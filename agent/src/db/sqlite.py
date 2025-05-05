import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from src.datatypes import StrategyData, StrategyInsertData
from src.db.interface import DBInterface
from src.types import ChatHistory
import uuid

@dataclass
class TokenPriceData:
	token_addr: str
	symbol: str
	price: str
	last_updated_at: str
	metadata: str

class SQLiteDB(DBInterface):
	def __init__(self, db_path: str):
		"""Initialize SQLite database connection and create tables if they don't exist.

		Args:
		    db_path (str): Path to the SQLite database file
		"""
		self.db_path = db_path
		self._init_db()

	def _init_db(self):
		"""Initialize database tables and seed data from SQL files."""
		# Create tables
		with open("src/db/00001_init.sql", "r") as f:
			init_script = f.read()
		# Seed data
		with open("src/db/00002_seed.sql", "r") as f:
			seed_script = f.read()

		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.executescript(init_script)
			cursor.executescript(seed_script)
			conn.commit()

	def fetch_params_using_agent_id(self, agent_id: str) -> Dict[str, Dict[str, Any]]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"SELECT strategy_id, parameters, summarized_desc, full_desc FROM sup_strategies WHERE agent_id = ?",
				(agent_id,),
			)
			rows = cursor.fetchall()

			params = {}
			for row in rows:
				strategy_id = str(row[0])
				params[strategy_id] = {
					"parameters": json.loads(row[1]) if row[1] else {},
					"summarized_desc": row[2] or "",
					"full_desc": row[3] or "",
				}
			return params

	def insert_strategy_and_result(
		self, agent_id: str, strategy_result: StrategyInsertData
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""INSERT INTO sup_strategies (strategy_id, agent_id, parameters, summarized_desc, full_desc)
                       VALUES (?, ?, ?, ?, ?)""",
					(
						str(uuid.uuid4()),
						agent_id,
						json.dumps(strategy_result.parameters)
						if strategy_result.parameters
						else None,
						strategy_result.summarized_desc,
						strategy_result.full_desc,
					),
				)
				return True
		except sqlite3.Error:
			return False

	def fetch_latest_strategy(self, agent_id: str) -> Optional[StrategyData]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT strategy_id, parameters, summarized_desc, full_desc, strategy_result, created_at 
                   FROM sup_strategies 
                   WHERE agent_id = ? 
                   ORDER BY created_at DESC 
                   LIMIT 1""",
				(agent_id,),
			)
			row = cursor.fetchone()

			if row:
				return StrategyData(
					strategy_id=str(row[0]),
					agent_id=agent_id,
					parameters=json.dumps(row[1] if row[1] else None),
					summarized_desc=row[2],
					full_desc=row[3],
					strategy_result=row[4],
					created_at=row[5],
				)
			return None

	def fetch_all_strategies(self, agent_id: str) -> List[StrategyData]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT strategy_id, parameters, summarized_desc, full_desc, strategy_result, created_at 
                   FROM sup_strategies 
                   WHERE agent_id = ? 
                   ORDER BY created_at DESC""",
				(agent_id,),
			)
			rows = cursor.fetchall()

			return [
				StrategyData(
					strategy_id=str(row[0]),
					agent_id=agent_id,
					parameters=json.dumps(row[1] if row[1] else None),
					summarized_desc=row[2],
					full_desc=row[3],
					strategy_result=row[4],
					created_at=row[5],
				)
				for row in rows
			]

	def insert_chat_history(
		self,
		session_id: str,
		chat_history: ChatHistory,
		base_timestamp: Optional[str] = None,
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				for message in chat_history.messages:
					timestamp = base_timestamp or datetime.now().strftime(
						"%Y-%m-%d %H:%M:%S"
					)
					cursor.execute(
						"INSERT INTO sup_chat_history (session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?)",
						(session_id, "message", message, timestamp),
					)
				return True
		except sqlite3.Error:
			return False

	def fetch_latest_notification_str(self, sources: List[str]) -> str:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			placeholders = ",".join(["?" for _ in sources])
			cursor.execute(
				f"""SELECT short_desc 
                   FROM sup_notifications 
                   WHERE source IN ({placeholders}) 
                   ORDER BY created DESC""",
				tuple(sources),
			)
			rows = cursor.fetchall()
			return "\n".join(row[0] for row in rows) if rows else ""

	def fetch_latest_notification_str_v2(
		self, sources: List[str], limit: int = 1
	) -> str:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			results = []
			for source in sources:
				cursor.execute(
					"""SELECT long_desc 
                       FROM sup_notifications 
                       WHERE source = ? 
                       ORDER BY created DESC 
                       LIMIT ?""",
					(source, limit),
				)
				rows = cursor.fetchall()
				results.extend(row[0] for row in rows)
			return "\n".join(results)

	def get_agent_session(self, session_id: str) -> Optional[Dict[str, Any]]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT agent_id, started_at, status, cycle_count, fe_data, will_end_at 
                   FROM sup_agent_sessions 
                   WHERE session_id = ?""",
				(session_id,),
			)
			row = cursor.fetchone()

			if row:
				return {
					"agent_id": row[0],
					"started_at": row[1],
					"status": row[2],
					"cycle_count": row[3],
					"fe_data": row[4],
					"will_end_at": row[5],
				}
			return None

	def update_agent_session(self, session_id: str, agent_id: str, status: str) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""UPDATE sup_agent_sessions 
                       SET status = ? 
                       WHERE session_id = ? AND agent_id = ?""",
					(status, session_id, agent_id),
				)
				return cursor.rowcount > 0
		except sqlite3.Error:
			return False

	def add_cycle_count(self, session_id: str, agent_id: str) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""UPDATE sup_agent_sessions 
                       SET cycle_count = cycle_count + 1 
                       WHERE session_id = ? AND agent_id = ?""",
					(session_id, agent_id),
				)
				return cursor.rowcount > 0
		except sqlite3.Error:
			return False

	def create_agent_session(
		self, session_id: str, agent_id: str, started_at: str, status: str
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""INSERT INTO sup_agent_sessions (session_id, agent_id, started_at, status)
                       VALUES (?, ?, ?, ?)""",
					(session_id, agent_id, started_at, status),
				)
				return True
		except sqlite3.Error:
			return False

	def create_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""INSERT OR REPLACE INTO sup_twitter_token 
                       (agent_id, last_refreshed_at, access_token, refresh_token)
                       VALUES (?, ?, ?, ?)""",
					(agent_id, last_refreshed_at, access_token, refresh_token),
				)
				return True
		except sqlite3.Error:
			return False

	def update_twitter_token(
		self,
		agent_id: str,
		last_refreshed_at: str,
		access_token: str,
		refresh_token: str,
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""UPDATE sup_twitter_token 
                       SET last_refreshed_at = ?, access_token = ?, refresh_token = ? 
                       WHERE agent_id = ?""",
					(last_refreshed_at, access_token, refresh_token, agent_id),
				)
				return cursor.rowcount > 0
		except sqlite3.Error:
			return False

	def get_twitter_token(
		self, agent_id: str, access_token: str, refresh_token: str
	) -> Optional[Dict[str, Any]]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT agent_id, last_refreshed_at, access_token, refresh_token 
                   FROM sup_twitter_token 
                   WHERE agent_id = ?""",
				(agent_id,),
			)
			row = cursor.fetchone()

			if row:
				return {
					"agent_id": row[0],
					"last_refreshed_at": row[1],
					"access_token": row[2],
					"refresh_token": row[3],
				}
			return None

	def insert_wallet_snapshot(
		self, snapshot_id: str, agent_id: str, total_value_usd: float, assets: str
	) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""INSERT INTO sup_wallet_snapshots (snapshot_id, agent_id, total_value_usd, assets)
                       VALUES (?, ?, ?, ?)""",
					(snapshot_id, agent_id, total_value_usd, assets),
				)
				return True
		except sqlite3.Error:
			return False

	def find_wallet_snapshot(
		self, wallet_address: str, target_time: datetime
	) -> Dict | None:
		# TODO: Make this actually work
		return None

	def get_historical_wallet_values(
		self,
		wallet_address: str,
		current_time: datetime,
		agent_id: str,
		intervals: Dict[str, timedelta],
	) -> Dict[str, float | None]:
		# TODO: Make this actually work
		return {}

	def get_agent_profile_image(self, agent_id: str) -> Optional[str]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT profile_image 
				FROM sup_agents 
				WHERE agent_id = ?""",
				(agent_id,),
			)
			row = cursor.fetchone()

			if row:
				return row[0]
			return None
		
	def get_eth_price(self) -> Optional[TokenPriceData]:
		return self.get_token_price('ETH')
	
	def get_token_price(self, symbol: str) -> Optional[TokenPriceData]:
		with sqlite3.connect(self.db_path) as conn:
			cursor = conn.cursor()
			cursor.execute(
				"""SELECT token_addr, symbol, price, last_updated_at, metadata 
				FROM sup_token_price 
				WHERE symbol = ?""",
				(symbol,),
			)
			row = cursor.fetchone()

			if row:
				return TokenPriceData(
					token_addr=row[0], 
					symbol=row[1], 
					price=row[2], 
					last_updated_at=row[3], 
					metadata=row[4] 
				)
			return None
	
	def insert_token_price(self, token_addr, symbol, price, metadata=""):
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""INSERT INTO sup_token_price (token_addr, symbol, price, last_updated_at, metadata)
                       VALUES (?, ?, ?, ?, ?)""",
					(
						token_addr,
						symbol,
						price,
						datetime.now().isoformat(),
						metadata
					),
				)
				return True
		except sqlite3.Error:
			return False
		
	def update_token_price(self, token_addr, symbol, price, metadata) -> bool:
		try:
			with sqlite3.connect(self.db_path) as conn:
				cursor = conn.cursor()
				cursor.execute(
					"""UPDATE sup_token_price 
                       SET token_addr = ?, symbol = ?, price = ?, last_updated_at = ?, metadata = ?
                       WHERE token_addr = ?""",
					(token_addr, symbol, price, datetime.now().isoformat(), metadata, token_addr),
				)
				return cursor.rowcount > 0
		except sqlite3.Error:
			return False