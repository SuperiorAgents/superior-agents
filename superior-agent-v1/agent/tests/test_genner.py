import os

from dotenv import load_dotenv

from src.client.openrouter import OpenRouter
from src.genner import get_genner
from src.types import ChatHistory, Message
from anthropic import Anthropic

load_dotenv()


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") or ""

print("OPENROUTER_API_KEY:", OPENROUTER_API_KEY)
or_client = OpenRouter(
	base_url="https://openrouter.ai/api/v1",
	api_key=OPENROUTER_API_KEY,
	include_reasoning=True,
)
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

genner = get_genner(
	"gemini",  # openai, gemini, claude
	or_client=or_client,
	anthropic_client=anthropic_client,
	stream_fn=lambda token: print(token, end="", flush=True),
)

completion = genner.ch_completion(
	ChatHistory(
		[
			Message(role="system", content="You are a helpful assistant."),
			Message(role="user", content="Hello, how are you?"),
		]
	)
)

print(completion)
