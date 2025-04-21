from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Generic, TypeVar

from src.datatypes import StrategyData, StrategyInsertData
from src.types import ChatHistory

T = TypeVar("T")


class DBInterface(ABC, Generic[T]):
	"""Interface defining the contract for database operations."""

	@abstractmethod
	def fetch_params_using_agent_id(self, agent_id: str) -> Dict[str, Dict[str, Any]]:
		"""Fetch parameters for strategies associated with an agent.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			Dict[str, Dict[str, Any]]: Dictionary mapping strategy IDs to their parameters
		"""
		pass

	@abstractmethod
	def insert_strategy_and_result(
		self, agent_id: str, strategy_result: StrategyInsertData
	) -> bool:
		"""Insert a new strategy and its result into the database.

		Args:
			agent_id (str): The ID of the agent
			strategy_result (StrategyInsertData): The strategy data to insert

		Returns:
			bool: True if the insertion was successful, False otherwise
		"""
		pass

	@abstractmethod
	def fetch_latest_strategy(self, agent_id: str) -> Optional[StrategyData]:
		"""Fetch the most recent strategy for a specific agent.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			Optional[StrategyData]: The latest strategy data, or None if no strategies exist
		"""
		pass

	@abstractmethod
	def fetch_all_strategies(self, agent_id: str) -> List[StrategyData]:
		"""Fetch all strategies associated with a specific agent.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			List[StrategyData]: List of all strategies for the agent
		"""
		pass

	@abstractmethod
	def insert_chat_history(
		self,
		session_id: str,
		chat_history: ChatHistory,
		base_timestamp: Optional[str] = None,
	) -> bool:
		"""Insert chat history messages into the database.

		Args:
			session_id (str): The ID of the session
			chat_history (ChatHistory): The chat messages to store
			base_timestamp (Optional[str]): Starting timestamp in 'YYYY-MM-DD HH:MM:SS' format

		Returns:
			bool: True if all messages were inserted successfully
		"""
		pass

	@abstractmethod
	def fetch_latest_notification_str(self, sources: List[str]) -> str:
		"""Fetch the latest notifications as a formatted string.

		Args:
			sources (List[str]): List of notification source identifiers

		Returns:
			str: Newline-separated string of notification short descriptions
		"""
		pass

	@abstractmethod
	def fetch_latest_notification_str_v2(
		self, sources: List[str], limit: int = 1
	) -> str:
		"""Fetch the latest notifications as a formatted string (version 2).

		Args:
			sources (List[str]): List of notification source identifiers
			limit (int): Maximum number of notifications to retrieve per source

		Returns:
			str: Newline-separated string of notification long descriptions
		"""
		pass

	@abstractmethod
	def get_agent_session(self, session_id: str) -> Optional[Dict[str, Any]]:
		"""Get an agent session by session_id.

		Args:
			session_id (str): The ID of the session

		Returns:
			Optional[Dict[str, Any]]: Session data if found, None otherwise
		"""
		pass

	@abstractmethod
	def update_agent_session(self, session_id: str, agent_id: str, status: str) -> bool:
		"""Update an agent session's status.

		Args:
			session_id (str): The ID of the session
			agent_id (str): The ID of the agent
			status (str): The new status to set

		Returns:
			bool: True if the update was successful, False otherwise
		"""
		pass

	@abstractmethod
	def add_cycle_count(self, session_id: str, agent_id: str) -> bool:
		"""Increment the cycle count for an agent session.

		Args:
			session_id (str): The ID of the session
			agent_id (str): The ID of the agent

		Returns:
			bool: True if the cycle count was successfully incremented, False otherwise
		"""
		pass

	@abstractmethod
	def create_agent_session(
		self, session_id: str, agent_id: str, started_at: str, status: str
	) -> bool:
		"""Create a new agent session.

		Args:
			session_id (str): The ID for the new session
			agent_id (str): The ID of the agent
			started_at (str): Timestamp when the session started
			status (str): Initial status of the session

		Returns:
			bool: True if the session was created successfully, False otherwise
		"""
		pass

	@abstractmethod
	def create_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		"""Create a new Twitter token for an agent.

		Args:
			agent_id (str): The ID of the agent
			last_refreshed_at (str): Timestamp of the last token refresh
			access_token (str): Twitter access token
			refresh_token (str): Twitter refresh token

		Returns:
			bool: True if the token was created successfully, False otherwise
		"""
		pass

	@abstractmethod
	def update_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		"""Update a Twitter token for an agent.

		Args:
			agent_id (str): The ID of the agent
			last_refreshed_at (str): Timestamp of the last token refresh
			access_token (str): Twitter access token
			refresh_token (str): Twitter refresh token

		Returns:
			bool: True if the token was updated successfully, False otherwise
		"""
		pass

	@abstractmethod
	def get_twitter_token(
		self, agent_id: str, access_token: str, refresh_token: str
	) -> Optional[Dict[str, Any]]:
		"""Get a Twitter token for an agent.

		Args:
			agent_id (str): The ID of the agent
			access_token (str): Twitter access token
			refresh_token (str): Twitter refresh token

		Returns:
			Optional[Dict[str, Any]]: Token data if found, None otherwise
		"""
		pass

	@abstractmethod
	def insert_wallet_snapshot(
		self,
		snapshot_id: str,
		agent_id: str,
		total_value_usd: float,
		assets: str,
		snapshot_time: str = datetime.now().isoformat(),
	) -> bool:
		"""Insert a wallet snapshot.

		Args:
			snapshot_id (str): User generated snapshot ID
			agent_id (str): The ID of the agent
			total_value_usd (float): Total value of the wallet in USD
			assets (str): JSON string of assets in the wallet
			snapshot_time (str): Timestamp when the snapshot was taken

		Returns:
			bool: True if the wallet snapshot was inserted successfully
		"""
		pass

	@abstractmethod
	def get_historical_wallet_values(
		self,
		wallet_address: str,
		current_time: datetime,
		agent_id: str,
		intervals: Dict[str, timedelta],
	) -> Dict[str, Optional[float]]:
		"""TODO: Michael please complete the docs of this

		Args:
			wallet_address (str): _description_
			current_time (datetime): _description_
			agent_id (str): _description_
			intervals (Dict[str, timedelta]): _description_

		Returns:
			Dict[str, Optional[float]]: _description_
		"""
		pass

	@abstractmethod
	def find_wallet_snapshot(
		self, wallet_address: str, target_time: datetime
	) -> Optional[Dict]:
		"""TODO: Michael please complete the docs of this

		Args:
			wallet_address (str): _description_
			target_time (datetime): _description_

		Returns:
			Optional[Dict]: _description_
		"""
		pass

	@abstractmethod
	def get_agent_profile_image(self, agent_id: str) -> Optional[str]:
		"""Get the profile image URL for an agent.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			Optional[str]: URL of the profile image if found, None otherwise
		"""
		pass
