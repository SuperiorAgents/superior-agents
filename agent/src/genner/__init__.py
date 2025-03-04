from typing import Callable

from anthropic import Anthropic
from openai import OpenAI

from src.client.openrouter import OpenRouter
from src.config import (
	ClaudeConfig,
	DeepseekConfig,
	OllamaConfig,
)
from src.genner.Claude import ClaudeGenner

from .Base import Genner
from .Deepseek import DeepseekGenner
from .Qwen import QwenGenner

__all__ = ["get_genner"]


class BackendException(Exception):
	pass


class DeepseekBackendException(Exception):
	pass


class ClaudeBackendException(Exception):
	pass


available_backends = ["deepseek", "deepseek_or", "deepseek_local", "deepseek_v3_or", "qwen", "claude"]


def get_genner(
	backend: str,
	stream_fn: Callable[[str], None] | None,
	deepseek_deepseek_client: OpenAI | None = None,
	deepseek_or_client: OpenRouter | None = None,
	deepseek_local_client: OpenAI | None = None,
	deepseek_config: DeepseekConfig = DeepseekConfig(),
	anthropic_client: Anthropic | None = None,
	claude_config: ClaudeConfig = ClaudeConfig(),
	qwen_config: OllamaConfig = OllamaConfig(),
) -> Genner:
	"""
	Get a genner instance based on the backend.

	Args:
		backend (str): The backend to use.
		deepseek_deepseek_client (OpenAI): OpenAI client but endpoint are pointed towards deepseek endpoint for deepseek-r1.
		deepseek_or_client (OpenAI): OpenAI client but endpoint are pointed towards openrouter endpoint for deepseek-r1.
		deepseek_local_client (OpenAI): OpenAI client but endpoint are pointed towards local endpoint for deepseek-r1.
		deepseek_config (DeepseekConfig, optional): The configuration for the Deepseek backend. Defaults to DeepseekConfig().
		qwen_config (QwenConfig, optional): The configuration for the Qwen backend. Defaults to QwenConfig().

	Raises:
		BackendException: If the backend is not supported.
		OaiBackendException: If the OpenAI client is required for the OAI backend but not provided.
		ClaudeBackendException: If the Anthropic client is required for the Claude backend but not provided.

	Returns:
		Genner: The genner instance.
	"""

	if backend == "deepseek":
		deepseek_config.model = "deepseek-reasoner"
		if not deepseek_deepseek_client:
			raise DeepseekBackendException(
				"Using backend 'deepseek', DeepSeek (openai) client is not provided."
			)

		return DeepseekGenner(deepseek_deepseek_client, deepseek_config, stream_fn)
	elif backend == "deepseek_or":
		deepseek_config.model = "deepseek/deepseek-r1"
		deepseek_config.max_tokens = 32768
		if not deepseek_or_client:
			raise DeepseekBackendException(
				"Using backend 'deepseek_or', OpenRouter client is not provided."
			)

		return DeepseekGenner(deepseek_or_client, deepseek_config, stream_fn)
	elif backend == "deepseek_v3":
		deepseek_config.model = "deepseek/deepseek-chat"
		deepseek_config.max_tokens = 32768
		if not deepseek_or_client:
			raise DeepseekBackendException(
				"Using backend 'deepseek_v3', OpenRouter client is not provided."
			)

		return DeepseekGenner(deepseek_or_client, deepseek_config, stream_fn)
	elif backend == "deepseek_local":
		deepseek_config.model = "../DeepSeek-R1-Q4_K_M/DeepSeek-R1-Q4_K_M/DeepSeek-R1-Q4_K_M-00001-of-00011.gguf"
		if not deepseek_local_client:
			raise DeepseekBackendException(
				"Using backend 'deepseek', DeepSeek Local (openai) client is not provided."
			)

		return DeepseekGenner(deepseek_local_client, deepseek_config, stream_fn)
	elif backend == "claude":
		if not anthropic_client:
			raise ClaudeBackendException(
				"Using backend 'claude', Anthropic client is not provided."
			)

		return ClaudeGenner(anthropic_client, claude_config, stream_fn)
	elif backend == "deepseek_v3_or":
		deepseek_config.model = "deepseek/deepseek-chat"
		deepseek_config.max_tokens = 32768

		if not deepseek_or_client:
			raise DeepseekBackendException(
				"Using backend 'deepseek_v3_or', OpenRouter client is not provided."
			)

		return DeepseekGenner(deepseek_or_client, deepseek_config, stream_fn)
	elif backend == "qwen":
		qwen_config.name = "Ollama Qwen"
		qwen_config.model = "qwen2.5-coder:latest"

		return QwenGenner(qwen_config, stream_fn)
	elif backend == "qwen-uncensored":
		qwen_config.name = "Ollama Uncensored Qwen"
		qwen_config.model = "qwen-uncensored:latest"
		return QwenGenner(qwen_config, stream_fn)

	raise BackendException(
		f"Unsupported backend: {backend}, available backends: {', '.join(available_backends)}"
	)
