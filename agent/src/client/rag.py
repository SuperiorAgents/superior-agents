from datetime import datetime
import json
from pprint import pprint
from loguru import logger
import requests
from src.datatypes import StrategyData
from typing import List, Tuple, TypedDict, Any
import dataclasses


class RAGInsertData(TypedDict):
	"""
	Type definition for data to be inserted into the RAG system.

	Attributes:
	    strategy_id (str): Unique identifier for the strategy
	    summarized_desc (str): Summarized description of the strategy
	"""

	strategy_id: str
	summarized_desc: str


class Metadata(TypedDict):
	"""
	Type definition for metadata associated with RAG content.

	Attributes:
	    created_at (str): Timestamp when the content was created
	    reference_id (str): Reference identifier for the content
	    strategy_data (str): JSON string containing StrategyData
	"""

	created_at: str
	reference_id: str
	strategy_data: str  # JSON string containing StrategyData


class PageContent(TypedDict):
	"""
	Type definition for a page of content in the RAG system.

	Attributes:
	    metadata (Metadata): Metadata associated with the content
	    page_content (str): The actual content text
	"""

	metadata: Metadata
	page_content: str


class PageContentV2(TypedDict):
	"""
	Type definition for a page of content in the RAG system v2.

	Attributes:
	    metadata (MetadataV2): Metadata associated with the content including similarity score
	    page_content (str): The actual content text
	"""

	metadata: "MetadataV2"
	page_content: str


class MetadataV2(TypedDict):
	"""
	Type definition for metadata associated with RAG content for v2 endpoint.

	Attributes:
	    created_at (str): Timestamp when the content was created
	    reference_id (str): Reference identifier for the content
	    strategy_data (str): JSON string containing StrategyData
	    similarity (float): Similarity score between query and content
	"""

	created_at: str
	reference_id: str
	strategy_data: str  # JSON string containing StrategyData
	similarity: float


class StrategyResponse(TypedDict):
	"""
	Type definition for the response from the RAG API when retrieving strategies.

	Attributes:
	    data (List[PageContent]): List of page content items
	    message (str): Message from the API
	    status (str): Status of the response
	"""

	data: List[Any]  # Can be either PageContent or PageContentV2
	message: str
	status: str


class RAGClient:
	"""
	Client for interacting with the Retrieval-Augmented Generation (RAG) API.

	This class provides methods to save strategy data to the RAG system and
	retrieve relevant strategies based on a query.
	"""

	def __init__(
		self,
		agent_id: str,
		session_id: str,
		base_url: str,
	):
		"""
		Initialize the RAG client with agent and session information.

		Args:
		    agent_id (str): Identifier for the agent
		    session_id (str): Identifier for the session
		    base_url (str, optional): Base URL for the RAG API.

		"""

		self.base_url = base_url
		self.agent_id = agent_id
		self.session_id = session_id

	def save_result_batch(self, batch_data: List[StrategyData]) -> requests.Response:
		"""
		Save a batch of strategy data to the RAG system.

		This method takes a list of StrategyData objects and sends them to the RAG API
		for storage and later retrieval. Each strategy is converted to the appropriate
		format expected by the API.

		Args:
		    batch_data (List[StrategyData]): List of strategy data objects to save

		Returns:
		    requests.Response: The response from the API

		Raises:
		    requests.HTTPError: If the API request fails
		"""
		logger.warning("USING DEPRECTED ENDPOINT")
		url = f"{self.base_url}/save_result_batch"

		payload = []

		for data in batch_data:
			if isinstance(data.created_at, datetime):
				data.created_at = data.created_at.isoformat()

			payload.append(
				{
					"strategy": data.summarized_desc,
					"strategy_data": json.dumps(dataclasses.asdict(data)),
					"reference_id": data.strategy_id,
					"agent_id": self.agent_id,
					"session_id": self.session_id,
					"created_at": data.created_at,
				}
			)

		response = requests.post(url, json=payload)
		response.raise_for_status()

		r = response.json()

		return r

	def save_result_batch_v4(self, batch_data: List[StrategyData]) -> requests.Response:
		"""
		Save a batch of strategy data to the RAG system.

		This method takes a list of StrategyData objects and sends them to the RAG API
		for storage and later retrieval. Each strategy is converted to the appropriate
		format expected by the API.

		Args:
		    batch_data (List[StrategyData]): List of strategy data objects to save

		Returns:
		    requests.Response: The response from the API

		Raises:
		    requests.HTTPError: If the API request fails
		"""
		url = f"{self.base_url}/save_result_batch_v4"

		payload = []

		# class SaveResultParamsV4(BaseModel):
		#     notification_key: str
		#     strategy_data: str
		#     reference_id: str
		#     agent_id: str
		#     session_id: str
		#     created_at: str = datetime.now().isoformat()
		# params: List[SaveResultParamsV4]

		missing_keys = 0

		for data in batch_data:
			if isinstance(data.created_at, datetime):
				data.created_at = data.created_at.isoformat()

			if isinstance(data.parameters, str):
				parsed_once = json.loads(data.parameters)

				if isinstance(parsed_once, str):
					data_params = json.loads(parsed_once)
				else:
					data_params = parsed_once
			else:
				data_params = data.parameters

			if "notif_str" not in data_params.keys():
				missing_keys += 1
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

		if missing_keys > 0:
			logger.info(
				f"{missing_keys} StrategyData(s) with missing 'notif_str' keys are found, those are being skipped..."
			)

		response = requests.post(url, json=payload)
		response.raise_for_status()

		r = response.json()

		return r

	def relevant_strategy_raw(self, query: str | None) -> List[StrategyData]:
		"""
		Retrieve strategies relevant to the given query.

		This method searches the RAG system for strategies that are semantically
		similar to the provided query. It returns a list of StrategyData objects
		sorted by relevance.

		Args:
		    query (str): The search query to find relevant strategies

		Returns:
		    List[StrategyData]: List of relevant strategy data objects

		Raises:
		    requests.HTTPError: If the API request fails
		"""
		logger.warning("USING DEPRECTED ENDPOINT")
		if query is None:
			return []

		url = f"{self.base_url}/relevant_strategy_raw"

		payload = {
			"query": query,
			"agent_id": self.agent_id,
			"session_id": self.session_id,
			"top_k": 5,
			"threshold": 0.7,
		}

		response = requests.post(url, json=payload)
		response.raise_for_status()

		r: StrategyResponse = response.json()
		pprint(r)

		strategy_datas = []
		for subdata in r["data"]:
			strategy_data = json.loads(subdata["metadata"]["strategy_data"])
			strategy_data["created_at"] = strategy_data.get(
				"created_at", subdata["metadata"]["created_at"]
			)
			strategy_data = StrategyData(**strategy_data)
			strategy_datas.append(strategy_data)

		return strategy_datas

	def relevant_strategy_raw_v2(self, query: str) -> List[Tuple[StrategyData, float]]:
		"""
		Retrieve strategies relevant to the given query using v2 endpoint.

		This method searches the RAG system for strategies that are semantically
		similar to the provided query. It returns a list of tuples containing
		StrategyData objects and their similarity scores.

		Args:
		    query (str): The search query to find relevant strategies

		Returns:
		    List[Tuple[StrategyData, float]]: List of tuples with relevant strategy data objects and their similarity scores

		Raises:
		    requests.HTTPError: If the API request fails
		"""
		logger.warning("USING DEPRECTED ENDPOINT")
		if not query.strip():
			return []

		url = f"{self.base_url}/relevant_strategy_raw_v2"

		payload = {
			"query": query,
			"agent_id": self.agent_id,
			"session_id": self.session_id,
			"top_k": 1,
		}

		response = requests.post(url, json=payload)

		try:
			response.raise_for_status()

			r: StrategyResponse = response.json()

			strategy_data_tuples = []
			for subdata in r["data"]:
				strategy_data = json.loads(subdata["metadata"]["strategy_data"])
				strategy_data["created_at"] = strategy_data.get(
					"created_at", subdata["metadata"]["created_at"]
				)
				strategy_data_obj = StrategyData(**strategy_data)
				similarity_score = subdata["metadata"]["similarity"]
				strategy_data_tuples.append((strategy_data_obj, similarity_score))

			return strategy_data_tuples
		except Exception as e:
			logger.error(
				"Error on `/relevant_strategy_raw_v2`, \n"
				f"`query`: \n{query}\n"
				f"`e`: \n{e}\n"
			)

			return []

	def relevant_strategy_raw_v4(self, query: str) -> List[Tuple[StrategyData, float]]:
		"""
		Retrieve strategies relevant to the given query using v4 endpoint.

		This method searches the RAG system for strategies that are semantically
		similar to the provided query. It returns a list of tuples containing
		StrategyData objects and their similarity scores.

		Args:
		    query (str): The search query to find relevant strategies

		Returns:
		    List[Tuple[StrategyData, float]]: List of tuples with relevant strategy data objects and their similarity scores

		Raises:
		    requests.HTTPError: If the API request fails
		"""
		if not query.strip():
			return []

		url = f"{self.base_url}/relevant_strategy_raw_v4"

		# class GetRelevantStrategyRawParamsV4(BaseModel):
		#     query: str
		#     agent_id: str
		#     session_id: str
		#     top_k: int = 1

		payload = {
			"query": query,
			"agent_id": self.agent_id,
			"session_id": self.session_id,
			"top_k": 1,
		}

		response = requests.post(url, json=payload)

		try:
			response.raise_for_status()

			r: StrategyResponse = response.json()

			# class RelevantStrategyDataV4(BaseModel):
			#     class RelevantStrategyMetadata(BaseModel):
			#         reference_id: str
			#         strategy_data: str
			#         created_at: str
			#         distance: float
			#
			#     page_content: str
			#     metadata: RelevantStrategyMetadata

			strategy_data_tuples = []
			for subdata in r["data"]:
				strategy_data = json.loads(subdata["metadata"]["strategy_data"])
				strategy_data["created_at"] = strategy_data.get(
					"created_at", subdata["metadata"]["created_at"]
				)

				strategy_data_obj = StrategyData(**strategy_data)
				similarity_score = subdata["metadata"]["distance"]
				strategy_data_tuples.append((strategy_data_obj, similarity_score))

			return strategy_data_tuples
		except Exception as e:
			logger.error(
				"Error on `/relevant_strategy_raw_v4`, \n"
				f"`query`: \n{query}\n"
				f"`e`: \n{e}\n"
			)

			return []
