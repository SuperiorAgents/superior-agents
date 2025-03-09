import re
from typing import Callable, Generator, List, Tuple

import yaml
from loguru import logger
from openai import OpenAI
from openai.types.chat import ChatCompletionChunk
from result import Err, Ok, Result

from src.config import DeepseekConfig
from src.helper import extract_content
from src.client.openrouter import OpenRouter
from src.types import ChatHistory

from .Base import Genner


class DeepseekGenner(Genner):
    def __init__(
        self,
        client: OpenAI | OpenRouter,
        config: DeepseekConfig,
        stream_fn: Callable[[str], None] | None,
    ):
        """
        Initialize the Deepseek-based generator.
        - Sets up the generator with Deepseek configuration and streaming function.
        - Supports both OpenAI and OpenRouter clients.

        Args:
                client (OpenAI | OpenRouter): OpenAI or OpenRouter API client
                config (DeepseekConfig): Configuration for the Deepseek model
                stream_fn (Callable[[str], None] | None): Function to call with streamed tokens,
                        or None to disable streaming
        """
        super().__init__("deepseek", True if stream_fn else False)
        self.client = client
        self.config = config
        self.stream_fn = stream_fn

    def ch_completion(self, messages: ChatHistory) -> Result[str, str]:
        """
        Generate a completion using the Deepseek model.

        Args:
                messages (ChatHistory): Chat history containing the conversation context

        Returns:
                Result[str, str]:
                        Ok(str): The generated text if successful
                        Err(str): Error message if the API call fails
        """
        final_response = ""

        try:
            if isinstance(self.client, OpenAI):
                if self.do_stream:
                    assert self.stream_fn is not None

                    stream: Generator[ChatCompletionChunk, None, None] = (
                        self.client.chat.completions.create(
                            model=self.config.model,
                            messages=messages.as_native(),  # type: ignore
                            max_tokens=self.config.max_tokens,
                            stream=True,
                        )
                    )

                    for chunk in stream:
                        if chunk.choices[0].delta.content is not None:
                            token = chunk.choices[0].delta.content

                            if not isinstance(token, str):
                                continue

                            final_response += token
                            self.stream_fn(token)
                else:
                    response = self.client.chat.completions.create(
                        model=self.config.model,
                        messages=messages.as_native(),  # type: ignore
                        max_tokens=self.config.max_tokens,
                        stream=False,
                    )

                    final_response = response.choices[0].message.content

                assert isinstance(final_response, str)
            else:
                if self.do_stream:
                    assert self.stream_fn is not None

                    stream_ = self.client.create_chat_completion_stream(
                        messages=messages.as_native(),
                        model=self.config.model,
                        max_tokens=self.config.max_tokens,
                    )

                    reasoning_entered = False
                    main_entered = False

                    for token, token_type in stream_:
                        if not reasoning_entered and token_type == "reasoning":
                            reasoning_entered = True
                            self.stream_fn("<think>\n")
                        if (
                            reasoning_entered
                            and not main_entered
                            and token_type == "main"
                        ):
                            main_entered = True
                            self.stream_fn("</think>\n")
                        if token_type == "main":
                            final_response += token

                        self.stream_fn(token)
                    self.stream_fn("\n")
                else:
                    final_response = self.client.create_chat_completion(
                        messages=messages.as_native(),
                        model=self.config.model,
                        max_tokens=self.config.max_tokens,
                    )
                assert isinstance(final_response, str)
        except AssertionError as e:
            return Err(f"DeepseekGenner.ch_completion: {e}")
        except Exception as e:
            return Err(
                f"DeepseekGenner.ch_completion: An unexpected error while generating code with {self.config}, response: {response} occured: \n{e}"
            )

        return Ok(final_response)

    def generate_code(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[str], str], str]:
        """
        Generate code using the Deepseek model.
        - Getting a completion from the model
        - Extracting code blocks from the response

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
        try:
            completion_result = self.ch_completion(messages)

            if err := completion_result.err():
                return Err(
                    f"OllamaGenner.generate_code: completion_result.is_err(): \n{err}"
                )

            raw_response = completion_result.unwrap()

            extract_code_result = self.extract_code(raw_response, blocks)

            if err := extract_code_result.err():
                return Err(
                    f"DeepseekGenner.generate_code: extract_code_result.is_err(): \n{err}"
                )

            processed_code = extract_code_result.unwrap()
        except Exception as e:
            return Err(
                f"An unexpected error while generating code with {self.config.name}, occured: \n{e}"
            )

        return Ok((processed_code, raw_response))

    def generate_list(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[List[str]], str], str]:
        """
        Generate lists using the Deepseek model.
        - Getting a completion from the model
        - Extracting lists from the response

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
                    f"DeepseekGenner.generate_list: completion_result.is_err(): \n{err}"
                )

            raw_response = completion_result.unwrap()

            extract_list_result = self.extract_list(raw_response, blocks)

            if err := extract_list_result.err():
                return Err(
                    f"DeepseekGenner.generate_list: extract_list_result.is_err(): \n{err}"
                )

            extracted_list = extract_list_result.unwrap()
        except Exception as e:
            return Err(
                f"An unexpected error while generating list with {self.config.name}, raw response: {raw_response} occured: \n{e}"
            )

        return Ok((extracted_list, raw_response))

    @staticmethod
    def extract_code(response: str, blocks: List[str] = [""]) -> Result[List[str], str]:
        """
        Extract code blocks from a Deepseek model response.

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
                assert (
                    code_match.group(1) is not None
                ), "No code group number 1 found in the response"

                code = code_match.group(1)
                assert isinstance(code, str), "Code is not a string"

                extracts.append(code)
            except AssertionError as e:
                return Err(f"DeepseekGenner.extract_code: Regex failed: {e}")
            except Exception as e:
                return Err(
                    f"An unexpected error while extracting code occurred, raw response: {response}, error: \n{e}"
                )

        return Ok(extracts)

    @staticmethod
    def extract_list(
        response: str, blocks: List[str] = [""]
    ) -> Result[List[List[str]], str]:
        """
        Extract lists from a Deepseek model response.

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
                assert all(
                    isinstance(item, str) for item in yaml_content
                ), "All yaml content items must be strings"

                extracts.append(yaml_content)
            except AssertionError as e:
                logger.error(f"DeepseekGenner.extract_list: Assertion error: {e}")
                return Err(f"DeepseekGenner.extract_list: Assertion error: {e}")
            except Exception as e:
                logger.error(
                    f"An unexpected error while extracting code occurred, raw response: {response}, error: \n{e}"
                )
                return Err(
                    f"An unexpected error while extracting code occurred, raw response: {response}, error: \n{e}"
                )

        return Ok(extracts)
