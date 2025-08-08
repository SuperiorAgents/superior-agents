from datetime import datetime
from typing import List, Tuple
import json
import dataclasses
from loguru import logger
from pprint import pprint

from src.datatypes import StrategyData


class MockRAGClient:
	"""
	Mock client for the Retrieval-Augmented Generation (RAG) system.

	This class simulates interactions with the RAG API for testing and development purposes.
	"""

	def __init__(self, agent_id: str, session_id: str, base_url: str = ""):
		self.agent_id = agent_id
		self.session_id = session_id
		self.base_url = base_url or "http://mock-rag.local"

	def save_result_batch(self, batch_data: List[StrategyData]) -> dict:
		logger.info("Mock save_result_batch called.")
		payload = [
			{
				"strategy": data.summarized_desc,
				"strategy_data": json.dumps(dataclasses.asdict(data)),
				"reference_id": data.strategy_id,
				"agent_id": self.agent_id,
				"session_id": self.session_id,
				"created_at": data.created_at.isoformat()
				if isinstance(data.created_at, datetime)
				else data.created_at,
			}
			for data in batch_data
		]
		pprint(payload)
		return {"status": "success", "message": "Mock save completed", "data": payload}

	def save_result_batch_v4(self, batch_data: List[StrategyData]) -> dict:
		logger.info("Mock save_result_batch_v4 called.")
		payload = []

		for data in batch_data:
			if isinstance(data.created_at, datetime):
				data.created_at = data.created_at.isoformat()

			if isinstance(data.parameters, str):
				try:
					parsed = json.loads(data.parameters)
					data_params = (
						json.loads(parsed) if isinstance(parsed, str) else parsed
					)
				except Exception:
					data_params = {}
			else:
				data_params = data.parameters or {}

			if "notif_str" not in data_params:
				logger.warning("Missing notif_str key, skipping strategy.")
				continue

			payload.append(
				{
					"notification_key": data_params["notif_str"],
					"strategy_data": json.dumps(dataclasses.asdict(data)),
					"reference_id": data.strategy_id,
					"agent_id": self.agent_id,
					"session_id": self.session_id,
					"created_at": data.created_at,
				}
			)

		return {
			"status": "success",
			"message": "Mock V4 save completed",
			"data": payload,
		}

	def relevant_strategy_raw(self, query: str | None) -> List[StrategyData]:
		logger.info(f"Mock relevant_strategy_raw called with query: {query}")
		if not query:
			return []

		return [
			StrategyData(
				strategy_id="mock-001",
				agent_id="mock-001",
				summarized_desc="Mock strategy result",
				full_desc="",
				created_at=datetime.now(),
				parameters={},
				strategy_result="success",
			)
		]

	def relevant_strategy_raw_v2(self, query: str) -> List[Tuple[StrategyData, float]]:
		logger.info(f"Mock relevant_strategy_raw_v2 called with query: {query}")
		return [
			(
				StrategyData(
					strategy_id="mock-002",
					agent_id="mock-002",
					summarized_desc="Mock strategy result v2",
					full_desc="",
					created_at=datetime.now(),
					parameters={},
					strategy_result="success",
				),
				0.95,
			)
		]

	def relevant_strategy_raw_v4(self, query: str) -> List[Tuple[StrategyData, float]]:
		logger.info(f"Mock relevant_strategy_raw_v4 called with query: {query}")
		return [
			(
				StrategyData(
					strategy_id="mock-003",
					agent_id="mock-003",
					summarized_desc="Mock strategy result v4",
					full_desc="",
					created_at=datetime.now(),
					parameters={},
					strategy_result="success",
				),
				0.89,
			)
		]
