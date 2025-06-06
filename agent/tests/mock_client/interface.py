from typing import List
from src.datatypes import StrategyData
import requests
from typing import Tuple


class RAGInterface:
	"""
	Interface for interacting with a Retrieval-Augmented Generation (RAG) backend.

	Implementations must support saving strategy data and retrieving relevant strategies.
	"""

	def save_result_batch(self, batch_data: List[StrategyData]) -> None:
		"""
		Save a batch of strategy data to the RAG backend.

		Args:
		    batch_data (List[StrategyData]): A list of strategy data to save.
		"""
		...

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
		...

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
		...

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
		...

	def relevant_strategy_raw(self, query: str) -> List[StrategyData]:
		"""
		Retrieve a list of relevant strategies for a given query.

		Args:
		    query (str): The query string used to retrieve strategies.

		Returns:
		    List[StrategyData]: A list of matching strategies.
		"""
		...
