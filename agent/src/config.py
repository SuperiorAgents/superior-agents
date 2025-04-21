from abc import ABC
from dataclasses import dataclass


@dataclass
class BaseLLMConfig(ABC):
	"""
	Abstract base class for language model configurations.

	This class serves as a base for all specific language model configurations,
	providing a common type for configuration objects.
	"""

	pass


@dataclass
class OAIConfig(BaseLLMConfig):
	"""
	Configuration for OpenAI compatibble language models APIs.
	"""

	name: str | None = None
	model: str | None = None
	max_tokens: int = 8192
	temperature: float = 0.0
	thinking_delimiter: str = ""


@dataclass
class OllamaConfig(BaseLLMConfig):
	"""
	Configuration for Ollama language models.

	This class contains settings specific to Ollama models, including
	the model name and API endpoint.

	Attributes:
		name (str | None): The display name of the model
		model (str | None): The model identifier used by Ollama
		endpoint (str): The URL of the Ollama API endpoint
	"""

	name: str | None = None
	model: str | None = None
	endpoint: str = "http://localhost:11434/api/chat"


@dataclass
class DeepseekConfig(BaseLLMConfig):
	"""
	Configuration for Deepseek language models.

	This class contains settings specific to Deepseek models, including
	the model name, identifier, and maximum token limit.

	Attributes:
		name (str): The display name of the model
		model (str): The model identifier for Deepseek
		max_tokens (int): The maximum number of tokens for model input/output
	"""

	name: str = "Deepseek"
	# model: str = "deepseek-chat"
	# model = "./DeepSeek-R1-Q4_K_M/DeepSeek-R1-Q4_K_M/DeepSeek-R1-Q4_K_M-00001-of-00011.gguf"
	model: str = "deepseek/deepseek-r1"
	max_tokens: int = 8192
	temperature: float = 1.0


@dataclass
class QwenConfig(BaseLLMConfig):
	"""
	Configuration for Qwen language models via Ollama.

	This class contains settings specific to Qwen models running through Ollama,
	including the model name and identifier.

	Attributes:
		name (str): The display name of the model
		model (str): The model identifier used by Ollama
	"""

	name: str = "Ollama Qwen"
	model: str = "qwen2.5-coder:latest"


@dataclass
class ClaudeConfig(BaseLLMConfig):
	"""
	Configuration for Anthropic's Claude language models.

	This class contains settings specific to Claude models, including
	the model name, identifier, and maximum token limit.

	Attributes:
		name (str): The display name of the model
		model (str): The model identifier for Claude
		max_tokens (int): The maximum number of tokens for model output
	"""

	name: str = "Claude"
	model: str = "claude-3-5-sonnet-latest"
	max_tokens = 8192


@dataclass
class OpenRouterConfig(BaseLLMConfig):
	"""
	Configuration for OpenRouter's language models.

	This class contains settings specific to language models, including
	the model name, identifier, and maximum token limit.

	Attributes:
		name (str): The display name of the model
		model (str): The model identifier for Claude
		max_tokens (int): The maximum number of tokens for model output
	"""

	name: str = "openai/o3-mini"
	model: str = "openai/o3-mini"
	max_tokens = 8192
	temperature: float | None = None
