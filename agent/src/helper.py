from contextlib import contextmanager
from datetime import datetime
import os
import signal
import re
from typing import Dict, List
from src.constants import SERVICE_TO_PROMPT, SERVICE_TO_ENV
import string
import random
import httpx


@contextmanager
def timeout(seconds: int):
	"""
	Context manager that raises a TimeoutError if the code inside the context takes longer than the specified time.

	This function uses the SIGALRM signal to implement a timeout mechanism. It sets up a signal handler
	that raises a TimeoutError when the alarm goes off, then restores the original handler when done.

	Args:
	    seconds (int): Maximum number of seconds to allow the code to run

	Yields:
	    None: The context to execute code within the timeout constraint

	Raises:
	    TimeoutError: If the code execution exceeds the specified timeout

	Example:
	    >>> with timeout(5):
	    ...     # Code that should complete within 5 seconds
	    ...     long_running_function()
	"""

	def timeout_handler(signum, frame):
		raise TimeoutError(f"Execution timed out after {seconds} seconds")

	# Set the timeout handler
	original_handler = signal.signal(signal.SIGALRM, timeout_handler)
	signal.alarm(seconds)

	try:
		yield
	finally:
		# Restore the original handler and cancel the alarm
		signal.alarm(0)
		signal.signal(signal.SIGALRM, original_handler)


def extract_content(text: str, block_name: str) -> str:
	"""
	Extract content between custom XML-like tags.

	This function uses regular expressions to find and extract content between
	specified XML-like tags in the input text.

	Args:
	    text (str): The input text containing XML-like blocks
	    block_name (str): The name of the block to extract content from

	Returns:
	    str: The content between the specified tags, or an empty string if not found

	Example:
	    >>> text = "<ASdasdas>\ncontent1\n</ASdasdas>\n<asdasdasdas>\ncontent2\n</asdasdasdas>"
	    >>> extract_content(text, "ASdasdas")
	    'content1'
	"""
	if block_name == "":
		return text

	pattern = rf"<{block_name}>\s*(.*?)\s*</{block_name}>"

	# Search for the pattern in the text
	match = re.search(pattern, text, re.DOTALL)

	# Return the content if found, empty string otherwise
	return match.group(1).strip() if match else ""


def services_to_prompts(services: List[str]) -> List[str]:
	"""
	Convert service names to detailed prompt descriptions with environment variables.

	This function maps service names to more detailed descriptions that include
	information about the environment variables needed for each service.

	Args:
	    services (List[str]): List of service names to convert to prompts

	Returns:
	    List[str]: List of detailed prompt descriptions for each service

	Example:
	    >>> services_to_prompts(["Twitter", "CoinGecko"])
	    ['Twitter (using tweepy, env vars TWITTER_API_KEY, ...)', 'CoinGecko (env vars COINGECKO_API_KEY) ...']
	"""
	service_to_prompt = SERVICE_TO_PROMPT

	return [service_to_prompt[service] for service in services]


def services_to_envs(platforms: List[str]) -> Dict[str, str]:
	"""
	Maps platform names to their environment variables and values.

	This function takes a list of platform names and returns a dictionary
	containing all the required environment variables and their values for
	those platforms. It retrieves the values from the system environment.

	Args:
	    platforms (List[str]): List of platform/service names

	Returns:
	    Dict[str, str]: Dictionary mapping environment variable names to their values

	Raises:
	    ValueError: If a platform is not supported

	Example:
	    >>> services_to_envs(["Twitter", "CoinGecko"])
	    {'TWITTER_API_KEY': 'key_value', 'TWITTER_API_KEY_SECRET': 'secret_value', ...}
	"""
	env_var_mapping: Dict[str, List[str]] = SERVICE_TO_ENV

	final_dict = {}
	for platform in platforms:
		if platform not in env_var_mapping:
			raise ValueError(
				f"Unsupported platform: {platform}. Supported platforms: {', '.join(env_var_mapping.keys())}"
			)

		# Create dictionary of environment variables and their values
		final_dict.update(
			{env_var: os.getenv(env_var, "") for env_var in env_var_mapping[platform]}
		)

	return final_dict


def get_latest_notifications_by_source(notifications: List[Dict]) -> List[Dict]:
	"""
	Get the latest notification for each source based on the created timestamp.

	This function groups notifications by their source, then for each source,
	finds the most recent notification based on the 'created' timestamp.

	Args:
	    notifications (List[Dict]): List of notification dictionaries, each containing
	                               at least 'source' and 'created' keys

	Returns:
	    List[Dict]: List of the latest notifications, one per source

	Example:
	    >>> notifications = [
	    ...     {"source": "Twitter", "created": "2023-01-01T12:00:00", "message": "Tweet 1"},
	    ...     {"source": "Twitter", "created": "2023-01-02T12:00:00", "message": "Tweet 2"},
	    ...     {"source": "Email", "created": "2023-01-01T10:00:00", "message": "Email 1"}
	    ... ]
	    >>> get_latest_notifications_by_source(notifications)
	    [{"source": "Twitter", "created": "2023-01-02T12:00:00", "message": "Tweet 2"},
	     {"source": "Email", "created": "2023-01-01T10:00:00", "message": "Email 1"}]
	"""
	# Group notifications by source
	source_groups: Dict[str, List[Dict]] = {}
	for notif in notifications:
		source = notif["source"]
		if source not in source_groups:
			source_groups[source] = []
		source_groups[source].append(notif)

	# Get latest notification for each source
	latest_notifications = []
	for source, notifs in source_groups.items():
		# Sort notifications by created timestamp in descending order
		sorted_notifs = sorted(
			notifs, key=lambda x: datetime.fromisoformat(x["created"]), reverse=True
		)
		# Add the first (latest) notification
		latest_notifications.append(sorted_notifs[0])

	return latest_notifications


def nanoid(size=21) -> str:
	"""Generates a random string of a given size.
	The string is composed of ASCII letters and digits.

	Examples:
		>>> nanoid()
		'A1b2C3d4E5f6G7h8I9j0'
		>>> nanoid(10)
		'K1l2M3n4O5p6'

	Args:
		size (int, optional): Size of the random string to generate. Defaults to 21.

	Returns:
		str: Random string of the given size
	"""

	alphabet = string.ascii_letters + string.digits
	return "".join(random.choice(alphabet) for _ in range(size))


async def get_ether_address_from_txn_service(agent_id: str) -> str:
	"""
	Fetches the ETHER_ADDRESS (evm) from the txn_service_url/api/v1/addresses endpoint.

	Returns:
	    str: The EVM address as a string.

	Raises:
	    Exception: If the request fails or the response is invalid.
	"""
	txn_service_url = os.getenv("TXN_SERVICE_URL")
	if not txn_service_url:
		raise ValueError("TXN_SERVICE_URL not set in environment")

	url = f"{txn_service_url}/api/v1/addresses"
	headers = {"x-superior-agent-id": agent_id}

	async with httpx.AsyncClient() as client:
		resp = await client.get(url, headers=headers)
		if resp.status_code != 200:
			raise Exception(
				f"Failed to fetch eth address: {resp.status_code} {resp.text}"
			)
		data = resp.json()
		if "evm" not in data or data["evm"] == "NOT IMPORTED/CREATED":
			raise Exception("ETHER ADDRESS not imported/created")
		return data["evm"]
