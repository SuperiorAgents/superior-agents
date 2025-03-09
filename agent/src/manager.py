from pprint import pformat
from loguru import logger
from src.agent.marketing import MarketingPromptGenerator
from src.agent.trading import TradingPromptGenerator
from src.constants import FE_DATA_MARKETING_DEFAULTS, FE_DATA_TRADING_DEFAULTS
import requests
import json


class ManagerClient:
    """Client for interacting with the manager service to handle session data and communication."""

    def __init__(self, base_url: str, session_id: str):
        """
        Initialize the ManagerClient with base URL and session ID.

        Args:
                base_url (str): The base URL of the manager service API
                session_id (str): The unique identifier for the current session
        """
        self.base_url = base_url
        self.session_id = session_id

    def push_token(self, token: str):
        """
        Push a token to the session as a log message.

        Args:
                token (str): The token to push to the session
        """
        url = f"{self.base_url}/sessions/{self.session_id}/push_token"
        payload = {"type": "log", "message": token}
        requests.post(url, json=payload)

    def fetch_fe_data(self, type: str):
        """
        Fetch frontend data for the specified agent type.

        Args:
                type (str): The type of agent ("trading" or "marketing")

        Returns:
                dict: A dictionary containing the frontend data with defaults filled in

        Note:
                If an error occurs during fetching, the method falls back to default values
                and logs the error.
        """
        fe_data = (
            FE_DATA_TRADING_DEFAULTS.copy()
            if type == "trading"
            else FE_DATA_MARKETING_DEFAULTS.copy()
        )

        try:
            url = f"{self.base_url}/sessions/{self.session_id}/logs"
            response = requests.get(
                url, headers={"Accept": "text/event-stream"}, stream=True
            )
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode("utf-8")
                    if decoded_line.startswith("data: "):
                        data = json.loads(decoded_line[6:])
                        if "logs" in data:
                            log_entries = data["logs"].strip().split("\n")
                            if log_entries:
                                first_log = json.loads(log_entries[0])
                                if first_log["type"] == "request":
                                    payload = json.loads(
                                        json.dumps(first_log["payload"], indent=2)
                                    )

                                    for key in payload:
                                        if key in [
                                            "agent_id",
                                            "agent_name",
                                            "model",
                                            "agent_type",
                                            "trading_instruments",
                                            "research_tools",
                                            "notifications",
                                            "time",
                                            "metric_name",
                                            "role",
                                            "twitter_mention",
                                            "hyperliquid_config",
                                            "twitter_access_token",
                                        ]:
                                            fe_data[key] = payload[key]

                                    if "prompts" in payload:
                                        prompt_dict = {
                                            item["name"]: item["prompt"]
                                            for item in payload["prompts"]
                                            if isinstance(item, dict) and "name" in item
                                        }
                                        fe_data["prompts"].update(prompt_dict)
                                    break

            # Get default prompts
            if type == "trading":
                default_prompts = TradingPromptGenerator.get_default_prompts()
            else:
                default_prompts = MarketingPromptGenerator.get_default_prompts()

            logger.info(f"Available default prompts: {list(default_prompts.keys())}")

            # Only fill in missing prompts from defaults
            missing_prompts = set(default_prompts.keys()) - set(
                fe_data["prompts"].keys()
            )
            if missing_prompts:
                logger.info(f"Adding missing default prompts: {list(missing_prompts)}")
                for key in missing_prompts:
                    fe_data["prompts"][key] = default_prompts[key]
        except Exception as e:
            logger.error(f"Error fetching session logs: {e}, going with defaults")
            # In case of error, return fe_data with default prompts
            if type == "trading":
                default_prompts = TradingPromptGenerator.get_default_prompts()
            else:
                default_prompts = MarketingPromptGenerator.get_default_prompts()

            fe_data["prompts"].update(default_prompts)

        logger.info(f"Final prompts: \n{pformat(fe_data["prompts"], 1)}")

        return fe_data
