from decimal import Decimal
import json
from loguru import logger
from pydantic import BaseModel
from typing import Any, Dict, List, Optional, TypedDict, Union
from datetime import datetime, timedelta
import sqlite3
import typer


class ChatMessage(TypedDict):
	id: int
	history_id: str
	session_id: str
	message_type: str
	content: str
	timestamp: datetime


class ChatCycle(TypedDict):
	messages: List[ChatMessage]
	session_id: str
	start_timestamp: datetime
	end_timestamp: Optional[datetime]


def get_chat_cycle_by_timestamp(
	db_path: str, session_id: str, reference_timestamp: str
) -> Optional[ChatCycle]:
	"""
	Get a complete chat cycle based on session_id and timestamp.
	A cycle starts with a system message and ends right before the next system message.

	Args:
		db_path: Path to the SQLite database file
		session_id: The agent ID to filter by
		reference_timestamp: A timestamp within the cycle to retrieve

	Returns:
		ChatCycle: Object containing all messages in the cycle
	"""
	# Connect to the database
	conn = sqlite3.connect(db_path)
	conn.row_factory = sqlite3.Row
	cursor = conn.cursor()

	try:
		# Find the system message that started this cycle (the latest system message before or at the reference time)
		find_system_message_query = """
		SELECT id FROM sup_chat_history
		WHERE session_id = ? AND message_type = 'system' AND timestamp <= ?
		ORDER BY timestamp DESC
		LIMIT 1
		"""
		cursor.execute(find_system_message_query, [session_id, reference_timestamp])
		system_message_row = cursor.fetchone()

		if not system_message_row:
			return None  # No system message found before the reference timestamp

		system_message_id = system_message_row["id"]

		# Find the next system message (which marks the end of this cycle)
		find_next_system_query = """
		SELECT id FROM sup_chat_history
		WHERE session_id = ? AND message_type = 'system' AND id > ?
		ORDER BY timestamp ASC
		LIMIT 1
		"""
		cursor.execute(find_next_system_query, [session_id, system_message_id])
		next_system_row = cursor.fetchone()

		# If there's a next system message, get all messages between system_message_id and next_system_id
		if next_system_row:
			next_system_id = next_system_row["id"]
			chat_history_query = """
			SELECT id, history_id, session_id, message_type, content, timestamp
			FROM sup_chat_history
			WHERE session_id = ? AND id >= ? AND id < ?
			ORDER BY timestamp ASC
			"""
			cursor.execute(
				chat_history_query, [session_id, system_message_id, next_system_id]
			)
		else:
			# If there's no next system message, get all messages from system_message_id onwards
			chat_history_query = """
			SELECT id, history_id, session_id, message_type, content, timestamp
			FROM sup_chat_history
			WHERE session_id = ? AND id >= ?
			ORDER BY timestamp ASC
			"""
			cursor.execute(chat_history_query, [session_id, system_message_id])

		# Convert the results to ChatMessage objects
		messages: List[ChatMessage] = []
		for row in cursor.fetchall():
			messages.append(
				{
					"id": row["id"],
					"history_id": row["history_id"],
					"session_id": row["session_id"],
					"message_type": row["message_type"],
					"content": row["content"],
					"timestamp": row["timestamp"],
				}
			)

		if not messages:
			return None

		return {
			"messages": messages,
			"session_id": session_id,
			"start_timestamp": messages[0]["timestamp"],
			"end_timestamp": messages[-1]["timestamp"] if messages else None,
		}

	finally:
		# Ensure the connection is closed properly
		cursor.close()
		conn.close()


class StrategyData(TypedDict):
	id: int
	strategy_id: Optional[str]
	agent_id: str
	summarized_desc: Optional[str]
	full_desc: Optional[str]
	strategy_result: Optional[str]
	parameters: Optional[Union[Dict[str, Any], str]]
	created_at: str  # SQLite timestamps are stored as strings
	updated_at: str  # SQLite timestamps are stored as strings


def get_all_strategies(
	db_path: str,
	agent_id: Optional[str] = None,
	limit: Optional[int] = None,
	offset: Optional[int] = None,
) -> List[StrategyData]:
	"""
	Retrieve all strategies from the database with optional filtering by agent_id
	and pagination.

	Args:
		db_path (str): Path to the SQLite database file
		agent_id (str, optional): Filter strategies by agent_id
		limit (int, optional): Maximum number of strategies to return
		offset (int, optional): Number of strategies to skip

	Returns:
		list: List of StrategyData dictionaries conforming to the sup_strategies schema
	"""
	# Connect to the database
	conn = sqlite3.connect(db_path)
	conn.row_factory = sqlite3.Row
	cursor = conn.cursor()

	try:
		# Build the query with optional agent_id filter
		query = "SELECT * FROM sup_strategies"
		params = []

		if agent_id:
			query += " WHERE agent_id = ?"
			params.append(agent_id)

		query += " ORDER BY created_at DESC"

		# Add pagination if specified
		if limit is not None:
			query += " LIMIT ?"
			params.append(limit)

			if offset is not None:
				query += " OFFSET ?"
				params.append(offset)

		# Execute the query
		cursor.execute(query, params)

		# Convert results to list of dictionaries with proper typing
		strategies: List[StrategyData] = []
		for row in cursor.fetchall():
			strategy_dict: Dict[str, Any] = {}
			for key in row.keys():
				value = row[key]
				# Handle specific field types
				if key == "parameters" and value:
					try:
						# Assuming parameters is stored as JSON string
						strategy_dict[key] = json.loads(value)
					except json.JSONDecodeError:
						strategy_dict[key] = value
				else:
					strategy_dict[key] = value

			strategies.append(strategy_dict)  # type: ignore

		return strategies

	finally:
		# Ensure connection is closed
		cursor.close()
		conn.close()


# Define TypedDict for wallet snapshot data structure
class WalletSnapshot(TypedDict):
	id: int
	snapshot_id: Optional[str]
	agent_id: str
	total_value_usd: Optional[Union[str, float, Decimal]]
	assets: Optional[Union[Dict[str, Any], str]]
	snapshot_time: str  # SQLite timestamps are stored as strings


# Define TypedDict for wallet change data
class WalletChange(TypedDict):
	absolute_change_usd: float
	percentage_change: float
	before_actual_timestamp: str
	after_actual_timestamp: str


# Define TypedDict for the comparison result
class WalletComparisonResult(TypedDict):
	before_data: WalletSnapshot
	after_data: WalletSnapshot
	wallet_change: WalletChange


def get_wallet_snapshots_comparison(
	db_path: str,
	agent_id: str,
	before_timestamp: str,
	after_timestamp: str,
	tolerance_seconds: int = 60,
) -> WalletComparisonResult:
	"""
	Retrieve wallet snapshots nearest to two timestamps (within tolerance) and calculate the changes.

	Args:
		db_path (str): Path to the SQLite database file
		agent_id (str): Agent ID to filter by
		before_timestamp (str): Target timestamp for the "before" snapshot
		after_timestamp (str): Target timestamp for the "after" snapshot
		tolerance_seconds (int): Maximum time difference in seconds to consider a snapshot valid (default: 60)

	Returns:
		WalletComparisonResult: Dictionary containing before_data, after_data, and wallet_change

	Raises:
		ValueError: If either snapshot cannot be found within the tolerance window
	"""
	conn = sqlite3.connect(db_path)
	conn.row_factory = sqlite3.Row
	cursor = conn.cursor()

	try:
		# Function to get the nearest snapshot to a timestamp within tolerance
		def get_nearest_snapshot(target_timestamp: str) -> Optional[WalletSnapshot]:
			# Calculate the time window
			try:
				target_dt = datetime.fromisoformat(target_timestamp.replace(" ", "T"))
			except ValueError:
				# Try different format if the above fails
				target_dt = datetime.strptime(target_timestamp, "%Y-%m-%d %H:%M:%S")

			min_time = (target_dt - timedelta(seconds=tolerance_seconds)).strftime(
				"%Y-%m-%d %H:%M:%S"
			)
			max_time = (target_dt + timedelta(seconds=tolerance_seconds)).strftime(
				"%Y-%m-%d %H:%M:%S"
			)

			# Query to find the nearest snapshot within the tolerance window
			query = """
			SELECT 
				id, 
				snapshot_id, 
				agent_id, 
				total_value_usd, 
				assets, 
				snapshot_time,
				ABS(JULIANDAY(snapshot_time) - JULIANDAY(?)) AS time_diff
			FROM sup_wallet_snapshots
			WHERE 
				agent_id = ? 
				AND 
				snapshot_time BETWEEN ? AND ?
			ORDER BY time_diff ASC
			LIMIT 1
			"""
			cursor.execute(query, [target_timestamp, agent_id, min_time, max_time])
			row = cursor.fetchone()

			if not row:
				return None

			snapshot: Dict[str, Any] = {
				key: row[key] for key in row.keys() if key != "time_diff"
			}

			# Parse the assets JSON
			if snapshot["assets"]:
				try:
					snapshot["assets"] = json.loads(snapshot["assets"])
				except json.JSONDecodeError:
					snapshot["assets"] = {}

			return snapshot  # type: ignore

		# Get the snapshots
		before_snapshot = get_nearest_snapshot(before_timestamp)
		after_snapshot = get_nearest_snapshot(after_timestamp)

		# Raise error if either snapshot is missing
		if not before_snapshot:
			raise ValueError(
				f"No snapshot found for agent {agent_id} within {tolerance_seconds} seconds of {before_timestamp}"
			)

		if not after_snapshot:
			raise ValueError(
				f"No snapshot found for agent {agent_id} within {tolerance_seconds} seconds of {after_timestamp}"
			)

		# Calculate the wallet change (in total_value_usd)
		before_value = (
			float(before_snapshot["total_value_usd"])
			if before_snapshot["total_value_usd"]
			else 0
		)
		after_value = (
			float(after_snapshot["total_value_usd"])
			if after_snapshot["total_value_usd"]
			else 0
		)

		wallet_change: WalletChange = {
			"absolute_change_usd": after_value - before_value,
			"percentage_change": ((after_value - before_value) / before_value * 100)
			if before_value > 0
			else 0,
			"before_actual_timestamp": before_snapshot["snapshot_time"],
			"after_actual_timestamp": after_snapshot["snapshot_time"],
		}

		result: WalletComparisonResult = {
			"before_data": before_snapshot,
			"after_data": after_snapshot,
			"wallet_change": wallet_change,
		}

		return result

	finally:
		cursor.close()
		conn.close()


class DataPoint(TypedDict):
	chat_history: List[ChatMessage]
	response: ChatMessage
	score: float


app = typer.Typer()


@app.command()
def main(
	db_path: str = typer.Argument(
		"../rest-api/database.db",
		exists=True,
		readable=True,
		help="Path to the SQLite db file",
	),
	agent_id: str = typer.Argument("agent_007", help="Agent ID in the DB"),
	save_folder: str = typer.Argument(
		"./data/data_points", help="Save folder of the data points file"
	),
):
	logger.info(f"Processing agent {agent_id} from database {db_path}")
	strategies = get_all_strategies(db_path=db_path, agent_id=agent_id)

	data_points: List[DataPoint] = []

	for strategy in strategies:
		strategy_time = datetime.strptime(strategy["created_at"], "%Y-%m-%d %H:%M:%S")

		chat_cycle = get_chat_cycle_by_timestamp(
			db_path=db_path,
			session_id=agent_id,
			reference_timestamp=strategy["created_at"],
		)

		wallet_comparison = get_wallet_snapshots_comparison(
			db_path=db_path,
			agent_id=agent_id,
			before_timestamp=str(strategy["created_at"]),
			after_timestamp=str(strategy_time + timedelta()),
		)

		if chat_cycle is None:
			continue

		proper_chat_history: List = []

		time_to_break = False
		for message in chat_cycle["messages"]:
			if time_to_break:
				proper_chat_history.append(
					{
						"role": message["message_type"],
						"content": message["content"],
					}
				)
				break

			if (
				message["message_type"] == "user"
				and "You just learnt the following information" in message["content"]
			):
				time_to_break = True

			proper_chat_history.append(
				{
					"role": message["message_type"],
					"content": message["content"],
				}
			)

		data_points.append(
			{
				"chat_history": proper_chat_history[:-1],
				"response": proper_chat_history[-1],
				"score": wallet_comparison["wallet_change"]["percentage_change"],
			}
		)

	first_strategy_timestamp = datetime.strptime(
		strategies[0]["created_at"], "%Y-%m-%d %H:%M:%S"
	)
	latest_strategy_timestamp = datetime.strptime(
		strategies[-1]["created_at"], "%Y-%m-%d %H:%M:%S"
	)
	first_strategy_formatted = first_strategy_timestamp.strftime("%y_%m_%d_%H_%M")
	latest_strategy_formatted = latest_strategy_timestamp.strftime("%y_%m_%d_%H_%M")

	with open(
		f"{save_folder}/data_points_file_{first_strategy_formatted}_to_{latest_strategy_formatted}.jsonl",
		"w",
	) as f:
		for item in data_points:
			# Write each dictionary as a separate line
			json.dump(item, f, ensure_ascii=False, indent=2, sort_keys=True)
			f.write("\n")

	logger.info(f"{len(data_points)} data points successfully saved to {save_folder}")


if __name__ == "__main__":
	app()
