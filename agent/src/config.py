from abc import ABC
from typing import Dict, NamedTuple
from dataclasses import dataclass


@dataclass
class BaseLLMConfig(ABC):
    """Abstract base class for language model configurations."""

    pass


@dataclass
class OllamaConfig(BaseLLMConfig):
    """Configuration for Ollama language models."""

    name: str | None = None
    model: str | None = None
    endpoint: str = "http://localhost:11434/api/chat"


@dataclass
class DeepseekConfig(BaseLLMConfig):
    """Configuration for Deepseek language models."""

    name: str = "Deepseek"
    model: str = "deepseek/deepseek-r1"
    max_tokens: int = 8192


@dataclass
class QwenConfig(BaseLLMConfig):
    """Configuration for Qwen language models via Ollama."""

    name: str = "Ollama Qwen"
    model: str = "qwen2.5-coder:latest"


@dataclass
class ClaudeConfig(BaseLLMConfig):
    """Configuration for Anthropic's Claude language models."""

    name: str = "Claude"
    model: str = "claude-3-5-sonnet-latest"
    max_tokens = 4096
