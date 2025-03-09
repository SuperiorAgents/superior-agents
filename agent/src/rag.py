from dataclasses import dataclass, asdict
from loguru import logger
import numpy as np
import faiss
from openai import OpenAI
from typing import List, Dict, Any, Tuple, Optional
import json
import os
from pathlib import Path

from src.datatypes import StrategyData


class StrategyRAG:
    """RAG system for strategy data. This class manages embeddings and similarity search for strategy objects."""
    def __init__(
        self,
        agent_id: str,
        oai_client: OpenAI,
        strategies: List[StrategyData],
        storage_dir: str = "rag_storage",
    ):
        """
        Initialize system.
        
        Args:
            agent_id: Unique identifier for the agent
            oai_client: OpenAI client for generating embeddings
            strategies: List of strategy data objects to index
            storage_dir: Directory to store the FAISS index
        """
        self.index = None
        self.agent_id = agent_id
        self.client = oai_client
        self.strategies = strategies
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        self.index_path = Path(storage_dir) / f"{self.agent_id}_index.faiss"
        if strategies:
            for strategy in strategies:
                self.add_strategy(
                    strategy, save=False, init=True
                )  # Don't save after each addition
            self.save() # Save index once after all strategies are added

    @staticmethod
    def load_or_setup_faiss_index(path: Path, dimension: int):
        """Load the RAG state from disk"""

        # Load FAISS index
        if path.exists():
            try:
                return faiss.read_index(str(path))
            except Exception as e:
                logger.info(f"Error loading index from {path}: {e}")
                logger.info("Creating new index instead")

        # Create new index if loading fails or file doesn't exist
        index = faiss.IndexFlatL2(
            dimension
        )  # Using L2 distance, you can change to other index types as needed

        return index

    def get_embedding(self, text: str) -> np.ndarray:
        """Get OpenAI embedding for text"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small", input=text
        )
        return np.array(response.data[0].embedding, dtype=np.float32).reshape(1, -1)

    def add_strategy(
        self, strategy: StrategyData | None, save: bool = True, init=False
    ):
        """Add strategy objects to the FAISS index"""

        if not strategy:
            logger.info("Strategy is empty, skipping creating RAG...")
            return

        embeddings = self.get_embedding(strategy.summarized_desc)
        dimension = embeddings.shape[1]
        if not init:
            self.strategies += [strategy]

        # If index exists, merge with existing strategies
        self.index = self.load_or_setup_faiss_index(self.index_path, dimension)

        # Add vectors to the index
        self.index.add(embeddings)  # type: ignore

        if save:
            self.save()

    def save(self):
        """Save the RAG state to disk"""
        # Save FAISS index
        if self.index is not None:
            faiss.write_index(
                self.index, str(self.storage_dir / f"{self.agent_id}_index.faiss")
            )

    def search(
        self, query: str, agent_id: Optional[str] = None, k: int = 3
    ) -> List[Tuple[StrategyData, float]]:
        """Return the indexes of strategy that had worked"""

        if not query:
            return []

        # Create query embedding
        query_embedding = self.get_embedding(query)

        # Search in FAISS index - get more results if filtering by agent_id
        k_search = k * 3 if agent_id else k
        distances, indices = self.index.search(query_embedding.reshape(1, -1), k_search)  # type: ignore

        # Get results
        results = [
            (self.strategies[idx], dist) for idx, dist in zip(indices[0], distances[0])
        ]
        return results

