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
