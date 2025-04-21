import json
from pprint import pformat, pprint
import requests
from src.datatypes import StrategyData
from typing import List, TypedDict
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


class StrategyResponse(TypedDict):
    """
    Type definition for the response from the RAG API when retrieving strategies.
    
    Attributes:
        data (List[PageContent]): List of page content items
        msg (str): Message from the API
        status (str): Status of the response
    """
    data: List[PageContent]
    msg: str
    status: str


class MockRAGClient:
    """
    Client for interacting with the Retrieval-Augmented Generation (RAG) API.
    
    This class provides methods to save strategy data to the RAG system and
    retrieve relevant strategies based on a query.
    """
    def __init__(
        self,
        agent_id: str,
        session_id: str,
        base_url: str = "http://localhost:8080",
    ):
        """
        Initialize the RAG client with agent and session information.
        
        Args:
            agent_id (str): Identifier for the agent
            session_id (str): Identifier for the session
            base_url (str, optional): Base URL for the RAG API. 
                Defaults to "localhost:8080".
        """
        self.base_url = base_url
        self.agent_id = agent_id
        self.session_id = session_id

    def save_result_batch(self, batch_data: List[StrategyData]) -> requests.Response:
        return 

    def relevant_strategy_raw(self, query: str) -> List[StrategyData]:
        mock_strategy_data = StrategyData(
            strategy_id="strat_abc123",
            agent_id="agent_007",
            summarized_desc="Momentum strategy for trending altcoins",
            full_desc=(
                "This strategy detects high-volume breakout patterns in trending altcoins using CoinGecko data "
                "and executes trades via 1inch DEX aggregator. It measures performance using wallet balance growth."
            ),
            parameters=StrategyDataParameters(
                apis=["CoinGecko", "1inch"],
                trading_instruments=["ETH", "SOL", "MATIC"],
                metric_name="wallet_balance",
                start_metric_state="$1,000",
                end_metric_state="$1,350",
                summarized_state_change="Increased wallet balance by 35% over 7 days.",
                summarized_code="Scanned for tokens with volume spikes > 2x 7d average; executed buys via 1inch.",
                code_output="Bought 20 MATIC, 0.5 ETH. Final wallet balance: $1,350.",
                prev_strat="strat_xyz789"
            ),
            strategy_result="Success – strategy outperformed baseline by 18%."
        )
        return [
            mock_strategy_data
        ]
