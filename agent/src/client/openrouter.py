import httpx
import json
from typing import Optional, Dict, Generator, List, Any, Tuple
from dataclasses import dataclass


@dataclass
class Message:
	role: str
	content: str


class OpenRouterError(Exception):
	"""Base exception class for OpenRouter errors"""

	pass


class OpenRouter:
	def __init__(
		self,
		api_key: str,
		base_url: str = "https://openrouter.ai/api/v1",
		providers: List[str] = [
			"DeepSeek",
			"Nebius",
			"Together",
			"Fireworks",
		],
		timeout: int = 60,
		model: str = "deepseek/deepseek-r1",
		include_reasoning: bool = True,
	):
		"""
		Initialize the OpenRouter client.

		Args:
		    api_key: Your OpenRouter API key
		    base_url: The base URL for OpenRouter API
		    timeout: Request timeout in seconds
		    include_reasoning: Whether to include reasoning tokens in streaming responses
		"""
		self.api_key = api_key
		self.base_url = base_url.rstrip("/")
		self.providers = providers
		self.timeout = timeout
		self.include_reasoning = include_reasoning
		self.model = model

		# Create a client with explicit headers matching the working example
		self.headers = {
			"Authorization": f"Bearer {api_key}",
			"Content-Type": "application/json",
		}
		self.http_client = httpx.Client(timeout=timeout)

	def _prepare_payload(
		self,
		messages: List[Dict],
		providers: List[str] = [],
		temperature: Optional[float] = None,
		model: Optional[str] = None,
		include_reasoning: Optional[bool] = None,
		max_tokens: Optional[int] = None,
		stream: bool = False,
	) -> Dict[str, Any]:
		"""
		Prepare the payload for API requests.

		This method formats the messages and other parameters into the structure
		expected by the OpenRouter API.

		Args:
		    messages (List[Dict]): List of message dictionaries or Message objects
		    temperature (float, optional): Sampling temperature. Defaults to 1.0.
		    providers (List[str], optional): List of preferred providers. Defaults to [].
		    model (Optional[str], optional): Model to use. Defaults to None.
		    include_reasoning (Optional[bool], optional): Whether to include reasoning. Defaults to None.
		    max_tokens (Optional[int], optional): Maximum tokens to generate. Defaults to None.
		    stream (bool, optional): Whether to stream the response. Defaults to False.

		Returns:
		    Dict[str, Any]: Formatted payload for the API request
		"""
		processed_messages = [
			msg if isinstance(msg, dict) else {"role": msg.role, "content": msg.content}
			for msg in messages
		]

		payload = {
			"messages": processed_messages,
			"provider": {"order": self.providers},
			"max_tokens": max_tokens,
			"include_reasoning": include_reasoning,
			"model": model,
			"stream": stream,
		}

		if not providers:
			payload["provider"] = {"order": self.providers}

		if temperature is not None:
			payload["temperature"] = temperature

		if max_tokens is not None:
			payload["max_tokens"] = max_tokens

		if include_reasoning is None:
			payload["include_reasoning"] = self.include_reasoning

		if model is None:
			payload["model"] = self.model

		return payload

	def create_chat_completion(
		self,
		messages: List[Dict],
		providers: List[str] = [],
		temperature: Optional[float] = None,
		model: Optional[str] = None,
		include_reasoning: Optional[bool] = None,
		max_tokens: Optional[int] = None,
	) -> str:
		"""
		Create a non-streaming chat completion.

		Args:
		    messages: List of message dictionaries or Message objects
		    model: The model to use (e.g., "openai/gpt-4o", "deepseek/deepseek-r1")
		    temperature: Sampling temperature (0-2)
		    max_tokens: Maximum tokens to generate
		    **kwargs: Additional parameters to pass to the API

		Returns:
		    The generated text response as a string
		"""
		payload = self._prepare_payload(
			messages=messages,
			temperature=temperature,
			providers=providers,
			model=model,
			max_tokens=max_tokens,
			include_reasoning=include_reasoning,
			stream=False,
		)

		endpoint = f"{self.base_url}/chat/completions"
		response = self._send_request(endpoint, payload)

		try:
			content = response["choices"][0]["message"]["content"]
			if not isinstance(content, str):
				raise OpenRouterError(
					"Unexpected response format: content is not a string"
				)
			return content
		except (KeyError, IndexError) as e:
			raise OpenRouterError(f"Unexpected response format: {str(e)}")

	def _send_request(self, endpoint: str, payload: Dict) -> Dict:
		"""
		Send a regular (non-streaming) request to the API.

		This method handles the HTTP request to the OpenRouter API and processes
		the response, including error handling.

		Args:
		    endpoint (str): API endpoint URL
		    payload (Dict): Request payload

		Returns:
		    Dict: JSON response from the API

		Raises:
		    OpenRouterError: If an HTTP error or other exception occurs
		"""
		try:
			# Exactly mirror the requests implementation that works
			response = self.http_client.post(
				endpoint,
				headers=self.headers,
				content=json.dumps(
					payload
				),  # This is key - using content with json.dumps() instead of json=payload
			)

			if response.status_code != 200:
				error_text = response.text
				raise OpenRouterError(
					f"HTTP error {response.status_code}: {error_text}"
				)

			return response.json()
		except httpx.HTTPError as e:
			raise OpenRouterError(f"HTTP error occurred: {str(e)}")
		except Exception as e:
			raise OpenRouterError(f"Error occurred: {str(e)}")

	def create_chat_completion_stream(
		self,
		messages: List[Dict],
		providers: List[str] = [],
		temperature: Optional[float] = 1.0,
		model: Optional[str] = None,
		include_reasoning: Optional[bool] = None,
		max_tokens: Optional[int] = None,
	) -> Generator[Tuple[str, str], None, None]:
		"""
		Create a streaming chat completion with support for reasoning models.

		Args:
		    messages: List of message dictionaries or Message objects
		    model: The model to use (e.g., "openai/gpt-4o", "deepseek/deepseek-r1")
		    temperature: Sampling temperature (0-2)
		    max_tokens: Maximum tokens to generate
		    **kwargs: Additional parameters to pass to the API

		Returns:
		    Generator yielding tuples of (content, type) where type is "reasoning" or "main"
		"""
		payload = self._prepare_payload(
			messages=messages,
			temperature=temperature,
			providers=providers,
			model=model,
			include_reasoning=include_reasoning,
			max_tokens=max_tokens,
			stream=True,
		)

		endpoint = f"{self.base_url}/chat/completions"
		return self._stream_response(endpoint, payload)

	def _stream_response(
		self, endpoint: str, payload: Dict
	) -> Generator[Tuple[str, str], None, None]:
		"""
		Stream the response from the API, handling both content and reasoning tokens.

		This method handles the streaming HTTP request to the OpenRouter API and processes
		the response chunks, separating reasoning tokens from main content tokens.
		It cleans up special tokens and manages the transition between reasoning and
		response phases.

		Args:
		    endpoint (str): API endpoint URL
		    payload (Dict): Request payload

		Returns:
		    Generator[Tuple[str, str], None, None]: Generator yielding tuples of
		        (content, type) where type is "reasoning" or "main"

		Raises:
		    OpenRouterError: If an HTTP error or other exception occurs during streaming
		"""
		try:
			with self.http_client.stream(
				"POST",
				endpoint,
				headers=self.headers,
				content=json.dumps(payload),
				timeout=self.timeout,
			) as response:
				if response.status_code != 200:
					error_text = response.read().decode("utf-8")
					raise OpenRouterError(
						f"HTTP error {response.status_code}: {error_text}"
					)
				buffer = ""
				in_reasoning_phase = False
				for chunk in response.iter_raw():
					buffer += chunk.decode("utf-8")
					while "\n" in buffer:
						line_end = buffer.find("\n")
						line = buffer[:line_end].strip()
						buffer = buffer[line_end + 1 :]
						if line.startswith(": OPENROUTER PROCESSING"):
							continue
						if line.startswith("data: "):
							data = line[6:]
							if data == "[DONE]":
								return
							try:
								data_obj = json.loads(data)
								if "choices" in data_obj and data_obj["choices"]:
									delta = data_obj["choices"][0].get("delta", {})
									content = delta.get("content")
									reasoning = delta.get("reasoning")

									# Process tokens but DON'T emit the <think> tags
									if reasoning is not None and self.include_reasoning:
										# Clean various tokens that might appear
										reasoning = (
											reasoning.replace("</s>", "")
											.replace("<response>", "")
											.replace("</thinking>", "")
										)
										# Track phase but don't emit tag
										in_reasoning_phase = True
										# Just yield the reasoning content
										yield (reasoning, "reasoning")
									elif content is not None:
										# Track phase change but don't emit closing tag
										if in_reasoning_phase:
											in_reasoning_phase = False

										# Yield main content without checking for </think>
										yield (content, "main")
							except json.JSONDecodeError:
								pass
		except httpx.HTTPError as e:
			raise OpenRouterError(f"HTTP error occurred during streaming: {str(e)}")
		except Exception as e:
			raise OpenRouterError(f"Error occurred during streaming: {str(e)}")
