from dataclasses import dataclass
from typing import Dict, Any, Optional, List, cast, Generic, TypeVar

from loguru import logger
import requests
import json
from datetime import datetime, timedelta

from src.datatypes import StrategyData, StrategyInsertData
from src.db.interface import DBInterface
from src.types import ChatHistory
from src.helper import get_latest_notifications_by_source
import random

T = TypeVar("T")


class ApiError(Exception):
	"""
	Exception raised for API-related errors.

	This exception is used when API requests fail or return unexpected results.
	"""

	pass


@dataclass
class ApiResponse(Generic[T]):
	"""
	Generic data class representing an API response.

	This class encapsulates the response from an API request, including
	success status, data payload, and error information.

	Attributes:
		success (bool): Whether the API request was successful
		data (Optional[T]): The data returned by the API, if successful
		error (Optional[str]): Error message, if the request failed
	"""

	success: bool
	data: Optional[T]
	error: Optional[str]


class APIDB(DBInterface[T]):
	"""
	Client for interacting with the API database.

	This class provides methods to interact with the API database, including
	fetching and storing strategies, chat histories, notifications, and session data.
	"""

	def __init__(self, base_url: str, api_key: str):
		"""
		Initialize the API database client.

		Args:
			base_url (str): The base URL of the API
			api_key (str): API key for authentication
		"""
		self.base_url = base_url
		self.headers = {"x-api-key": api_key, "Content-Type": "application/json"}

	def _make_request(
		self, endpoint: str, data: Dict[str, Any], response_type: type[T]
	) -> ApiResponse[T]:
		"""
		Make a request to the API.

		This internal method handles the details of making HTTP requests to the API,
		including error handling and response parsing.

		Args:
			endpoint (str): The API endpoint to call
			data (Dict[str, Any]): The data to send in the request body
			response_type (type[T]): The expected type of the response data

		Returns:
			ApiResponse[T]: Response object containing success status, data, and error info
		"""
		try:
			response = requests.post(
				f"{self.base_url}/{endpoint}", headers=self.headers, json=data
			)
			response.raise_for_status()
			return ApiResponse(success=True, data=cast(T, response.json()), error=None)
		except requests.exceptions.RequestException as e:
			return ApiResponse(success=False, data=None, error=str(e))

	def _make_get_request(self, endpoint: str) -> ApiResponse[T]:
		"""
		Make a GET request to the API.

		This internal method handles the details of making HTTP GET requests to the API,
		including error handling and response parsing.

		Args:
			endpoint (str): The API endpoint to call
			response_type (type[T]): The expected type of the response data

		Returns:
			ApiResponse[T]: Response object containing success status, data, and error info
		"""
		try:
			response = requests.get(f"{self.base_url}/{endpoint}", headers=self.headers)
			response.raise_for_status()
			return ApiResponse(success=True, data=cast(T, response.json()), error=None)
		except requests.exceptions.RequestException as e:
			return ApiResponse(success=False, data=None, error=str(e))

	def fetch_params_using_agent_id(self, agent_id: str) -> Dict[str, Dict[str, Any]]:
		"""
		Fetch parameters for strategies associated with an agent.

		This method retrieves all strategies for a specific agent and extracts
		their parameters, descriptions, and other metadata.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			Dict[str, Dict[str, Any]]: Dictionary mapping strategy IDs to their parameters

		Raises:
			ApiError: If the agent verification or strategy fetching fails
		"""
		agent_response = self._make_request(
			"agent/get", {"id": agent_id}, Dict[str, Any]
		)
		if not agent_response.success:
			raise ApiError(f"Failed to verify agent: {agent_response.error}")

		strategies_response = self._make_request(
			"strategies/get", {}, List[Dict[str, Any]]
		)
		if not strategies_response.success:
			raise ApiError(f"Failed to fetch strategies: {strategies_response.error}")

		strategies = strategies_response.data or []
		agent_strategies = [s for s in strategies if s.get("agent_id") == agent_id]

		params: Dict[str, Dict[str, Any]] = {}
		for strategy in agent_strategies:
			try:
				strategy_id = str(strategy["id"])
				params[strategy_id] = {
					"parameters": json.loads(strategy["parameters"]),
					"summarized_desc": str(strategy["summarized_desc"]),
					"full_desc": str(strategy["full_desc"]),
				}
			except (KeyError, json.JSONDecodeError, ValueError) as e:
				raise ApiError(
					f"Error processing strategy {strategy.get('id')}: {str(e)}"
				)

		return params

	def insert_strategy_and_result(
		self, agent_id: str, strategy_result: StrategyInsertData
	) -> bool:
		"""
		Insert a new strategy and its result into the database.

		This method creates a new strategy entry in the database with the provided
		data, associating it with the specified agent.

		Args:
			agent_id (str): The ID of the agent
			strategy_result (StrategyInsertData): The strategy data to insert

		Returns:
			bool: True if the insertion was successful, False otherwise

		Raises:
			ApiError: If the agent verification fails
		"""
		# Verify agent exists
		agent_response = self._make_request(
			"agent/get", {"id": agent_id}, Dict[str, Any]
		)
		if not agent_response.success:
			raise ApiError(f"Failed to verify agent: {agent_response.error}")

		# Build strategy data dictionary, handling optional fields
		strategy_data = {
			"agent_id": agent_id,
		}

		# Add optional fields if they exist
		if strategy_result.summarized_desc is not None:
			strategy_data["summarized_desc"] = strategy_result.summarized_desc

		if strategy_result.full_desc is not None:
			strategy_data["full_desc"] = strategy_result.full_desc

		if strategy_result.parameters is not None:
			strategy_data["parameters"] = json.dumps(strategy_result.parameters)

		if strategy_result.strategy_result is not None:
			strategy_data["strategy_result"] = strategy_result.strategy_result

		# Make API request to create strategy
		response = self._make_request(
			"strategies/create", strategy_data, Dict[str, Any]
		)
		if not response.success:
			raise ApiError(f"Failed to insert strategy: {response.error}")

		return True

	def fetch_latest_strategy(self, agent_id: str) -> Optional[StrategyData]:
		"""
		Fetch the most recent strategy for a specific agent.

		This method retrieves the latest strategy associated with the given agent ID.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			Optional[StrategyData]: The latest strategy data, or None if no strategies exist

		Raises:
			ApiError: If the strategy fetching fails
		"""
		strategies_response = self._make_request(
			"strategies/get_2",
			{},
			Dict[str, List[Dict[str, Any]]],  # Changed from List[Dict[str, Any]]
		)
		if not strategies_response.success or not strategies_response.data:
			raise ApiError(f"Failed to fetch strategies: {strategies_response.error}")

		strategies = strategies_response.data["data"]

		agent_strategies = [s for s in strategies if s.get("agent_id") == agent_id]

		if not agent_strategies:
			return None

		latest = max(agent_strategies, key=lambda s: s.get("strategy_id", ""))

		return StrategyData(
			strategy_id=str(latest["strategy_id"]),
			agent_id=agent_id,
			parameters=json.loads(latest["parameters"]),
			summarized_desc=str(latest["summarized_desc"]),
			strategy_result=latest["strategy_result"],
			full_desc=str(latest["full_desc"]),
			created_at=str(latest["created_at"]),
		)

	def fetch_all_strategies(self, agent_id: str) -> List[StrategyData]:
		"""
		Fetch all strategies associated with a specific agent.

		This method retrieves all strategies for the given agent ID and converts
		them to StrategyData objects.

		Args:
			agent_id (str): The ID of the agent

		Returns:
			List[StrategyData]: List of all strategies for the agent

		Raises:
			ApiError: If the strategy fetching fails
		"""
		strategies_response = self._make_request(
			"strategies/get",
			{},
			Dict[str, List[Dict[str, Any]]],  # Changed from List[Dict[str, Any]]
		)
		if not strategies_response.success or not strategies_response.data:
			raise ApiError(f"Failed to fetch strategies: {strategies_response.error}")

		strategies = strategies_response.data["data"]

		agent_strategies = [
			StrategyData(
				strategy_id=str(strat["strategy_id"]),
				agent_id=agent_id,
				parameters=json.loads(strat["parameters"]),
				summarized_desc=str(strat["summarized_desc"]),
				strategy_result=strat["strategy_result"],
				full_desc=str(strat["full_desc"]),
				created_at=str(strat["created_at"]),
			)
			for strat in strategies
			if strat.get("agent_id") == agent_id
		]

		return agent_strategies

	def insert_chat_history(
		self,
		session_id: str,
		chat_history: ChatHistory,
		base_timestamp: Optional[str] = None,
	) -> bool:
		"""
		Insert chat history messages into the database.

		This method stores a sequence of chat messages in the database, associating
		them with a specific session. It can use a provided base timestamp or
		generate timestamps automatically.

		Args:
			session_id (str): The ID of the session
			chat_history (ChatHistory): The chat messages to store
			base_timestamp (Optional[str]): Starting timestamp in 'YYYY-MM-DD HH:MM:SS' format

		Returns:
			bool: True if all messages were inserted successfully

		Raises:
			ValueError: If the base_timestamp format is invalid
			ApiError: If message insertion fails
		"""
		current_time = datetime.utcnow()

		if base_timestamp:
			try:
				current_time = datetime.strptime(base_timestamp, "%Y-%m-%d %H:%M:%S")
			except ValueError:
				raise ValueError(
					"base_timestamp must be in format 'YYYY-MM-DD HH:MM:SS'"
				)

		for i, message in enumerate(chat_history.messages):
			# Create timestamp for each message, adding 1 second intervals if no base_timestamp provided
			message_time = (current_time + timedelta(seconds=i)).strftime(
				"%Y-%m-%d %H:%M:%S"
			)

			chat_data = {
				"session_id": session_id,
				"message_type": message.role,
				"content": message.content,
				"timestamp": message_time,
			}

			# Add metadata if it exists
			if message.metadata:
				chat_data["metadata"] = json.dumps(message.metadata)

			# Make API request to create chat history entry
			response = self._make_request(
				"chat_history/create", chat_data, Dict[str, Any]
			)
			if not response.success:
				raise ApiError(f"Failed to insert chat message: {response.error}")

		return True

	def fetch_latest_notification_str(self, sources: List[str]) -> str:
		"""
		Fetch the latest notifications as a formatted string.

		This method retrieves the most recent notifications from the database
		and formats them as a newline-separated string of short descriptions.

		Args:
			sources (List[str]): List of notification source identifiers

		Returns:
			str: Newline-separated string of notification short descriptions

		Raises:
			ApiError: If notification fetching fails
		"""
		notification_response = self._make_request(
			"notification/get",
			{},
			Dict[str, List[Dict[str, Any]]],  # Changed from List[Dict[str, Any]]
		)
		if not notification_response.success or not notification_response.data:
			raise ApiError(f"Failed to fetch strategies: {notification_response.error}")

		notifications = notification_response.data["data"]

		filtered_notifications = get_latest_notifications_by_source(notifications)

		ret = "\n".join([notif["short_desc"] for notif in filtered_notifications])

		return ret

	def fetch_latest_notification_str_v2(self, sources: List[str], limit: int = 1):
		"""
		Fetch the latest notifications as a formatted string (version 2).

		This enhanced version retrieves notifications with source validation and
		formatting as a newline-separated string of long descriptions.

		Args:
			sources (List[str]): List of notification source identifiers
			limit (int): Maximum number of notifications to retrieve per source

		Returns:
			str: Newline-separated string of notification long descriptions

		Raises:
			ApiError: If notification fetching fails
		"""
		expected_sources = [
			"animals_news",
			"business_news",
			"crypto_news",
			"entertainment_news",
			"general_news",
			"health_news",
			"politics_news",
			"science_news",
			"sports_news",
			"technology_news",
			"twitter_feed",
			"twitter_mentions",
			"world_news_news",
			"ats",
		]

		for source in sources:
			if source not in expected_sources:
				sources = random.sample(expected_sources, 2)
				break
			continue

		notification_response = self._make_request(
			"notification/get_v3",
			{"limit": limit, "sources": sources},
			Dict[str, List[Dict[str, Any]]],  # Changed from List[Dict[str, Any]]
		)

		if not notification_response.success or not notification_response.data:
			raise ApiError(f"Failed to fetch strategies: {notification_response.error}")

		notifications = notification_response.data["data"]

		notifications_long_descs = list(
			set([notif["long_desc"] for notif in notifications])
		)

		ret = "\n".join(notifications_long_descs)

		return ret

	def get_agent_session(self, session_id: str) -> Optional[Dict[str, Any]]:
		"""
		Get an agent session by session_id and agent_id.

		This method retrieves information about a specific agent session.

		Args:
			session_id (str): The ID of the session
			agent_id (str): The ID of the agent

		Returns:
			Optional[Dict[str, Any]]: Session data if found, None otherwise
		"""
		response = self._make_get_request(f"agent_sessions/{session_id}")
		if not response.success:
			return None

		result = response.data
		if result is not None and isinstance(result, dict):
			return result.get("data")
		return None

	def update_agent_session(self, session_id: str, agent_id: str, status: str) -> bool:
		"""
		Update an agent session's status.

		This method updates the status and optional frontend data for a specific agent session.

		Args:
			session_id (str): The ID of the session
			agent_id (str): The ID of the agent
			status (str): The new status to set
			fe_data (str, optional): Frontend-specific data to store

		Returns:
			bool: True if the update was successful, False otherwise
		"""
		response = self._make_request(
			"agent_sessions/update",
			{
				"session_id": session_id,
				"agent_id": agent_id,
				"status": status,
			},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(f"Failed creating an agent session, err: {response.error}")

		return response.success

	def add_cycle_count(self, session_id: str, agent_id: str) -> bool:
		"""
		Increment the cycle count for an agent session.

		This method retrieves the current cycle count for a session and increments it by one.

		Args:
			session_id (str): The ID of the session
			agent_id (str): The ID of the agent

		Returns:
			bool: True if the cycle count was successfully incremented, False otherwise
		"""
		response = self._make_request(
			"agent_sessions/get_v2",
			{"session_id": session_id, "agent_id": agent_id},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(
				f"Failed getting agent session for adding cycle count, err: {response.error}"
			)
			return False

		cycle_count = 0
		if (
			response.data
			and "data" in response.data.keys()
			and isinstance(response.data["data"], list)
		):
			if response.data["data"][0]["cycle_count"]:
				cycle_count = response.data["data"][0]["cycle_count"]
			cycle_count += 1

		response = self._make_request(
			"agent_sessions/update",
			{
				"session_id": session_id,
				"agent_id": agent_id,
				"cycle_count": str(cycle_count),
			},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(f"Failed creating an agent session, err: {response.error}")
			return False

		return response.success

	def create_agent_session(
		self, session_id: str, agent_id: str, started_at: str, status: str
	) -> bool:
		"""
		Create a new agent session.

		This method initializes a new session for an agent with the specified parameters.

		Args:
			session_id (str): The ID for the new session
			agent_id (str): The ID of the agent
			started_at (str): Timestamp when the session started
			status (str): Initial status of the session

		Returns:
			bool: True if the session was created successfully, False otherwise
		"""
		response = self._make_request(
			"agent_sessions/create",
			{
				"session_id": session_id,
				"agent_id": agent_id,
				"started_at": started_at,
				"status": status,
			},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(f"Failed creating an agent session, err: {response.error}")
			return False

		return response.success

	def create_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		response = self._make_request(
			"twitter_token/create",
			{
				"agent_id": agent_id,
				"last_refreshed_at": last_refreshed_at,
				"access_token": access_token,
				"refresh_token": refresh_token,
			},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(f"Failed creating an twitter account, err: {response.error}")
			return False

		return response.success

	def update_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		response = self._make_request(
			"twitter_token/update",
			{
				"agent_id": agent_id,
				"last_refreshed_at": last_refreshed_at,
				"access_token": access_token,
				"refresh_token": refresh_token,
			},
			Dict[str, Any],
		)

		if response.error:
			logger.warning(f"Failed creating an twitter account, err: {response.error}")
			return False

		return response.success

	def get_twitter_token(
		self, agent_id: str, access_token: str, refresh_token: str
	) -> Optional[Dict[str, Any]]:
		response = self._make_request(
			"twitter_token/get",
			{
				"agent_id": agent_id,
			},
			Dict[str, Any],
		)
		if not response.success:
			return None
		if len(response.data["data"]) == 0:
			self.create_twitter_token(
				agent_id=agent_id,
				access_token=access_token,
				refresh_token=refresh_token,
				last_refreshed_at=datetime.now().isoformat(),
			)
			response = self._make_request(
				"twitter_token/get",
				{
					"agent_id": agent_id,
				},
				Dict[str, Any],
			)
			if not response.success:
				return None
		return response.data["data"][0]
		return response.data["data"][0]  # type: ignore

	def insert_wallet_snapshot(
		self,
		snapshot_id: str,
		agent_id: str,
		total_value_usd: float,
		assets: str,
		snapshot_time: str = datetime.now().isoformat(),
	) -> bool:
		"""Given a snapshot_id, agent_id, total_value_usd, assets, and snapshot_time, insert a wallet snapshot.
		Args:
			snapshot_id (str): User generated snapshot ID
			agent_id (str): The ID of the agent
			total_value_usd (float): Total value of the wallet in USD
			assets (str): JSON string of assets in the wallet
			snapshot_time (str): Timestamp when the snapshot was taken
		Returns:
			bool: If the wallet snapshot was inserted successfully
		"""

		response = self._make_request(
			"wallet_snapshots/create_v2",
			{
				"snapshot_id": snapshot_id,
				"agent_id": agent_id,
				"total_value_usd": total_value_usd,
				"assets": assets,
				"snapshot_time": snapshot_time,
			},
			Dict[str, Any],
		)

		return response.success

	def get_historical_wallet_values(
		self,
		wallet_address: str,
		current_time: datetime,
		agent_id: str,
		intervals: Dict[str, timedelta],
	) -> Dict[str, Optional[float]]:
		historical_values = {}

		for interval_name, delta in intervals.items():
			target_time = current_time - delta
			target_time_str = target_time.replace(microsecond=0).isoformat()

			request_data = {
				"agent_id": agent_id,
				"snapshot_time": target_time_str,
				"limit": 1,
			}

			response = self._make_request(
				"wallet_snapshots/get_historical", request_data, Dict[str, Any]
			)

			if response.data and len(response.data.get("data", [])) > 0:
				snapshot = response.data["data"][0]
				try:
					assets = json.loads(snapshot["assets"])
					historical_values[f"wallet_value_{interval_name}"] = assets.get(
						"total_value_usd"
					)
				except json.JSONDecodeError as e:
					logger.error(
						f"[Historical Values] Failed to parse assets JSON: {e}"
					)
					historical_values[f"wallet_value_{interval_name}"] = None
			else:
				historical_values[f"wallet_value_{interval_name}"] = None
		return historical_values

	def find_wallet_snapshot(
		self, wallet_address: str, target_time: datetime
	) -> Optional[Dict]:
		request_data = {
			"wallet_address": wallet_address,
			"target_time": target_time.isoformat(),
			"limit": 1,
		}

		response = self._make_request(
			"wallet_snapshots/find_nearest", request_data, Dict[str, Any]
		)

		if not response.success:
			logger.error(f"[DB] Failed to find wallet snapshot: {response.error}")
			return None

		if not response.data or len(response.data.get("data", [])) == 0:
			return None

		snapshot = response.data["data"][0]
		return snapshot

	def get_agent_profile_image(self, agent_id: str) -> Optional[str]:
		"""Fetch agent's profile image URL from the API.

		Makes a request to the API endpoint 'agent/get' to retrieve the agent's
		profile image URL. Handles any errors gracefully by returning None.

		Args:
			agent_id (str): The unique identifier of the agent

		Returns:
			Optional[str]: The URL of the agent's profile image if found,
						None if the request fails or no image exists
		"""
		try:
			agent_response = self._make_request(
				"agent/get", {"agent_id": agent_id}, Dict[str, Any]
			)

			if not agent_response.success:
				return None

			if isinstance(agent_response.data, dict):
				data = agent_response.data.get("data", {})
				profile_image = data.get("profile_image")
				return profile_image

			return None

		except Exception:
			return None
