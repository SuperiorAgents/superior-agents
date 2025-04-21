from typing import Protocol, List
from src.datatypes import StrategyData

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

    def relevant_strategy_raw(self, query: str) -> List[StrategyData]:
        """
        Retrieve a list of relevant strategies for a given query.
        
        Args:
            query (str): The query string used to retrieve strategies.
        
        Returns:
            List[StrategyData]: A list of matching strategies.
        """
        ...
