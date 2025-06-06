import re
from typing import Callable, Generator, List, Tuple

import yaml
from openai import OpenAI
from openai.types.chat import ChatCompletionChunk
from result import Err, Ok, Result

from src.config import OAIConfig
from src.helper import extract_content
from src.types import ChatHistory

from .Base import Genner


class OAIGenner(Genner):
	def __init__(
		self,
		client: OpenAI,
		config: OAIConfig,
		stream_fn: Callable[[str], None] | None,
	):
		"""
		Initialize the OAI-based generator.

		This constructor sets up the generator with OAI configuration
		and streaming function.

		Args:
			client (OpenAI): OpenAI API client
			config (OAIConfig): Configuration for the OAI model
			stream_fn (Callable[[str], None] | None): Function to call with streamed tokens,
				or None to disable streaming
		"""
		super().__init__("OAI", True if stream_fn else False)
		self.client = client
		self.config = config
		self.stream_fn = stream_fn

	def ch_completion(self, messages: ChatHistory) -> Result[str, str]:
		"""
		Generate a completion using the OAI model.

		This method sends the chat history to either the OpenAI API
		(depending on the client type) and retrieves a completion response, with
		optional streaming support. It handles the differences between the two APIs.

		Args:
			messages (ChatHistory): Chat history containing the conversation context

		Returns:
			Result[str, str]:
				Ok(str): The generated text if successful
				Err(str): Error message if the API call fails
		"""
		final_response = ""

		try:
			if self.do_stream:
				assert self.stream_fn is not None
				kwargs = {
					"model": self.config.model,
					"messages": messages.as_native(),
					"max_completion_tokens": self.config.max_tokens,
					"temperature": self.config.temperature,
					"stream": True,
				}

				if self.config.model == "o3-mini":
					kwargs.pop("temperature")

				stream: Generator[ChatCompletionChunk, None, None] = (
					self.client.chat.completions.create(**kwargs)
				)

				if self.config.thinking_delimiter != "":
					main_entered = False
					reasoning_entered = False

					token_counts = 0
					for chunk in stream:
						if chunk.choices[0].delta.content is not None:
							token = chunk.choices[0].delta.content

							if not isinstance(token, str):
								continue

							if (
								not reasoning_entered
								and self.config.thinking_delimiter not in token
							):
								reasoning_entered = True
							elif (
								reasoning_entered
								and not main_entered
								and self.config.thinking_delimiter in token
							):
								main_entered = True

							if (
								reasoning_entered
								and main_entered
								and self.config.thinking_delimiter not in token
							):
								final_response += token

							self.stream_fn(token)

							token_counts += 1
							if token_counts >= self.config.max_tokens:
								break
					self.stream_fn("\n")
				else:
					for chunk in stream:
						if chunk.choices[0].delta.content is not None:
							token = chunk.choices[0].delta.content

							if not isinstance(token, str):
								continue

							final_response += token
							self.stream_fn(token)
			else:
				kwargs = {
					"model": self.config.model,
					"messages": messages.as_native(),
					"max_completion_tokens": self.config.max_tokens,
					"temperature": self.config.temperature,
					"stream": False,
				}

				if self.config.model == "o3-mini":
					kwargs.pop("temperature")

				response = self.client.chat.completions.create(**kwargs)

				final_response: str = response.choices[0].message.content
				final_response = final_response.split(self.config.thinking_delimiter)[
					-1
				].strip()

			assert isinstance(final_response, str)
		except AssertionError as e:
			return Err(f"OAIGenner.{self.config.model}.ch_completion error: \n{e}")
		except Exception as e:
			return Err(
				f"OAIGenner.{self.config.model}.ch_completion: An unexpected error while generating occured: \n{e}"
			)

		return Ok(final_response.strip())

	def generate_code(
		self, messages: ChatHistory, blocks: List[str] = [""]
	) -> Result[Tuple[List[str], str], str]:
		"""
		Generate code using the OAI model.

		This method handles the complete process of generating code:
		1. Getting a completion from the model
		2. Extracting code blocks from the response

		Args:
			messages (ChatHistory): Chat history containing the conversation context
			blocks (List[str]): XML tag names to extract content from before processing into code

		Returns:
			Result[Tuple[List[str], str], str]:
				Ok(Tuple[List[str], str]): Tuple containing:
					- List[str]: Processed code blocks
					- str: Raw response from the model
				Err(str): Error message if generation failed
		"""
		raw_response = ""

		try:
			completion_result = self.ch_completion(messages)

			if err := completion_result.err():
				return (
					Ok((None, raw_response))
					if raw_response
					else Err(
						f"OAIGenner.{self.config.name}.generate_code: completion_result.is_err(): \n{err}"
					)
				)

			raw_response = completion_result.unwrap()
			# logger.error(f"Response: {raw_response}")

			extract_code_result = self.extract_code(raw_response, blocks)

			if err := extract_code_result.err():
				return Ok((None, raw_response))

			processed_code = extract_code_result.unwrap()
			return Ok((processed_code, raw_response))

		except Exception as e:
			return (
				Ok((None, raw_response))
				if raw_response
				else Err(
					f"OAIGenner.{self.config.name}.generate_code: An unexpected error occurred: \n{e}"
				)
			)

	def generate_list(
		self, messages: ChatHistory, blocks: List[str] = [""]
	) -> Result[Tuple[List[List[str]], str], str]:
		"""
		Generate lists using the OAI model.

		This method handles the complete process of generating structured lists:
		1. Getting a completion from the model
		2. Extracting lists from the response

		Args:
			messages (ChatHistory): Chat history containing the conversation context
			blocks (List[str]): XML tag names to extract content from before processing into lists

		Returns:
			Result[Tuple[List[List[str]], str], str]:
				Ok(Tuple[List[List[str]], str]): Tuple containing:
					- List[List[str]]: Processed lists of items
					- str: Raw response from the model
				Err(str): Error message if generation failed
		"""
		try:
			completion_result = self.ch_completion(messages)

			if err := completion_result.err():
				return Err(
					f"OAIGenner.generate_list: completion_result.is_err(): \n{err}"
				)

			raw_response = completion_result.unwrap()

			extract_list_result = self.extract_list(raw_response, blocks)

			if err := extract_list_result.err():
				return Err(
					f"OAIGenner.{self.config.model}.generate_list: extract_list_result.is_err(): \n{err}"
				)

			extracted_list = extract_list_result.unwrap()
		except Exception as e:
			return Err(
				f"OAIGenner.{self.config.model}.ch_completion: An unexpected error while generating occured: \n{e}"
			)

		return Ok((extracted_list, raw_response))

	@staticmethod
	def extract_code(response: str, blocks: List[str] = [""]) -> Result[List[str], str]:
		"""
		Extract code blocks from a OAI model response.

		This static method extracts Python code blocks from the raw model response
		using regex patterns to find code within markdown code blocks.

		Args:
			response (str): The raw response from the model
			blocks (List[str]): XML tag names to extract content from before processing into code

		Returns:
			Result[List[str], str]:
				Ok(List[str]): List of extracted code blocks
				Err(str): Error message if extraction failed
		"""
		extracts: List[str] = []

		for block in blocks:
			# Extract code from the response
			try:
				response = extract_content(response, block)
				regex_pattern = r"```python\n([\s\S]*?)```"
				code_match = re.search(regex_pattern, response, re.DOTALL)

				assert code_match is not None, "No code match found in the response"
				assert code_match.group(1) is not None, (
					"No code group number 1 found in the response"
				)

				code = code_match.group(1)
				assert isinstance(code, str), "Code is not a string"

				extracts.append(code)
			except AssertionError as e:
				return Err(f"OAIGenner.extract_code: Regex failed: \n{e}")
			except Exception as e:
				return Err(
					f"OAIGenner.extract_code: An unexpected error while extracting code occurred, error: \n{e}"
				)

		return Ok(extracts)

	@staticmethod
	def extract_list(
		response: str, blocks: List[str] = [""]
	) -> Result[List[List[str]], str]:
		"""
		Extract lists from a OAI model response.

		This static method extracts YAML-formatted lists from the raw model response
		using regex patterns to find YAML content within markdown code blocks.

		Args:
			response (str): The raw response from the model
			blocks (List[str]): XML tag names to extract content from before processing into lists

		Returns:
			Result[List[List[str]], str]:
				Ok(List[List[str]]): List of extracted lists
				Err(str): Error message if extraction failed
		"""
		extracts: List[List[str]] = []

		for block in blocks:
			try:
				response = extract_content(response, block)
				# Remove markdown code block markers and find yaml content
				# Updated regex pattern to handle triple backticks
				regex_pattern = r"```yaml\n(.*?)```"
				yaml_match = re.search(regex_pattern, response, re.DOTALL)

				assert yaml_match is not None, "No match found"
				yaml_content = yaml.safe_load(yaml_match.group(1).strip())
				assert isinstance(yaml_content, list), "Yaml content is not a list"
				assert all(isinstance(item, str) for item in yaml_content), (
					"All yaml content items must be strings"
				)

				extracts.append(yaml_content)
			except AssertionError as e:
				return Err(f"OAIGenner.extract_list: Assertion error: \n{e}")
			except Exception as e:
				return Err(
					f"OAIGenner.extract_list: An unexpected error while extracting list occurred, error: \n{e}"
				)

		return Ok(extracts)
