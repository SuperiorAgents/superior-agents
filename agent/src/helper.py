from contextlib import contextmanager
from datetime import datetime
import os
import signal
import re
from textwrap import dedent
from typing import Callable, Dict, List


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
        ['Twitter (using tweepy, env vars POSTING_TWITTER_API_KEY, ...)', 'CoinGecko (env vars COINGECKO_API_KEY) ...']
    """
    service_to_prompt = {
        "Twitter": dedent("""
            Research Twitter (ONLY FOR RESEARCH, Using Tweepy, env vars RESEARCH_TWITTER_API_KEY, RESEARCH_TWITTER_API_KEY_SECRET, RESEARCH_TWITTER_BEARER_TOKEN)"
            Posting Twitter (ONLY FOR POSTING ON TWITTER) (POSTING_TWITTER_ACCESS_TOKEN) (
                curl --request POST \
                    --url https://api.x.com/2/tweets \
                    --header 'Authorization: Bearer <access_token>' \
                    --header 'Content-Type: application/json' \
                    --data '{
                        "text": "Learn how to use the user Tweet timeline and user mention timeline endpoints in the X API v2 to explore Tweet https://t.co/56a0vZUx7i"
                    }'
            )
        """),
        # "CoinMarketCap": "CoinMarketCap (env vars ??)",
        "CoinGecko": dedent("""
            <CoinGeckoTrendingCoins>
            curl -X GET "https://api.coingecko.com/api/v3/search/trending" # To find trending coins
            {{
                "type": "object",
                "required": [
                    "coins"
                ],
                "properties": {{
                    "coins": {{
                        "type": "array",
                        "description": "List of trending cryptocurrencies",
                        "items": {{
                            "type": "object",
                            "required": [
                                "item"
                            ],
                            "properties": {{
                                "item": {{
                                    "type": "object",
                                    "required": [
                                        "id",
                                        "symbol",
                                        "market_cap_rank",
                                        "slug",
                                        "platforms"
                                    ],
                                    "properties": {{
                                        "id": {{
                                            "type": "string",
                                            "description": "Unique identifier for the coin"
                                        }},
                                        "symbol": {{
                                            "type": "string",
                                            "description": "Trading symbol"
                                        }},
                                        "market_cap_rank": {{
                                            "type": "integer",
                                            "description": "Ranking by market cap"
                                        }},
                                        "slug": {{
                                            "type": "string",
                                            "description": "URL-friendly identifier"
                                        }},
                                        "platforms": {{
                                            "type": "object",
                                            "description": "Available blockchain platforms and contract addresses",
                                            "additionalProperties": {{
                                                "type": "string",
                                                "description": "Contract address on the platform"
                                            }}
                                        }},
                                        "data": {{
                                            "type": "object",
                                            "properties": {{
                                                "price": {{
                                                    "type": "number",
                                                    "description": "Current price in USD"
                                                }},
                                                "price_change_percentage_24h": {{
                                                    "type": "object",
                                                    "description": "24-hour price changes",
                                                    "properties": {{
                                                        "usd": {{
                                                            "type": "number",
                                                            "description": "24h change in USD"
                                                        }}
                                                    }}
                                                }},
                                                "market_cap": {{
                                                    "type": "string",
                                                    "description": "Market capitalization"
                                                }},
                                                "total_volume": {{
                                                    "type": "string",
                                                    "description": "24h trading volume"
                                                }}
                                            }}
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}
            ```
            </CoinGeckoTrendingCoins>
            <CoinGeckoSearch>
            curl -X GET "https://api.coingecko.com/api/v3/search?query={{ASSUMED_TOKEN_SYMBOL}}) # To find address given the token symbol
            ```return-json-schema
            {{
                "$schema": "http://json-schema.org/draft-07/schema#",
                "title": "CoinGecko Search Data Schema",
                "type": "object",
                "required": ["coins"],
                "properties": {{
                    "coins": {{
                        "type": "array",
                        "description": "Search results for cryptocurrencies",
                        "items": {{
                            "type": "object",
                            "required": ["id", "symbol", "market_cap_rank"],
                            "properties": {{
                                "id": {{
                                    "type": "string",
                                    "description": "Unique identifier for the coin"
                                }},
                                "name": {{
                                    "type": "string",
                                    "description": "Name of the cryptocurrency"
                                }},
                                "symbol": {{
                                    "type": "string",
                                    "description": "Trading symbol"
                                }},
                                "market_cap_rank": {{
                                    "type": ["integer", "null"],
                                    "description": "Ranking by market cap, null if unranked"
                                }},
                                "platforms": {{
                                    "type": "object",
                                    "description": "Available blockchain platforms and contract addresses",
                                    "additionalProperties": {{
                                        "type": "string",
                                        "description": "Contract address on the platform"
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}
            </CoinGeckoSearch>
        """),
        "DuckDuckGo": "DuckDuckGo (command line `ddgr`) (example usage `ddgr --json x` to search for x)",
        "Etherscan": "Etherscan (env vars ETHERSCAN_API_KEY)",
        # "Arbiscan": "Arbiscan (env vars ??)",
        # "Basescan": "Basescan (env vars ??)",
        # "Alchemy": "Alchemy (env vars ??)",
        "Infura": "Infura (env vars INFURA_PROJECT_ID)",
    }

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
        {'POSTING_TWITTER_API_KEY': 'key_value', 'POSTING_TWITTER_API_KEY_SECRET': 'secret_value', ...}
    """
    env_var_mapping: Dict[str, List[str]] = {
        "Twitter": [
            "RESEARCH_TWITTER_API_KEY",
            "RESEARCH_TWITTER_API_KEY_SECRET",
            "RESEARCH_TWITTER_BEARER_TOKEN",
            "POSTING_TWITTER_ACCESS_TOKEN",
        ],
        "CoinGecko": [
            "COINGECKO_API_KEY",
        ],
        "DuckDuckGo": [],
        "Etherscan": [
            "ETHERSCAN_API_KEY",
        ],
        "Infura": [
            "INFURA_PROJECT_ID",
        ],
    }

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
