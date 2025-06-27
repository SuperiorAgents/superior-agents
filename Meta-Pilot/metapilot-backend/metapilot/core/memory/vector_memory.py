"""
Vector Memory implementation for MetaPilot AI Engine v2.0.
"""

import os
import json
import uuid
import logging
import time
from typing import Dict, List, Any, Optional
import redis
import numpy as np
from redis.commands.search.field import VectorField, TextField, NumericField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

from metapilot.services.ai_service import AIService

logger = logging.getLogger(__name__)


class VectorMemory:
    """
    Vector Memory for MetaPilot AI Engine v2.0.
    
    Provides vector-based memory storage and retrieval for agents using Redis as the backend.
    """
    
    def __init__(self, collection_name: str, dimension: int = 128):
        """
        Initialize Vector Memory.
        
        Args:
            collection_name: Name of the memory collection (typically agent-specific)
            dimension: Dimension of the vector embeddings
        """
        self.collection_name = collection_name
        self.dimension = dimension
        self.vector_db_uri = os.environ.get("VECTOR_DB_URI", "redis://localhost:6379/1")
        
        # Initialize Redis connection
        try:
            self.redis_client = redis.from_url(self.vector_db_uri)
            logger.info(f"Connected to Redis at {self.vector_db_uri}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise
        
        # Initialize AI service for embeddings
        self.ai_service = AIService()
        
        # Create index if it doesn't exist
        self._create_index()
        
        logger.info(f"VectorMemory initialized for collection: {collection_name}")
    
    def _create_index(self):
        """Create Redis search index for vector similarity search."""
        index_name = f"idx:{self.collection_name}"
        
        # Check if index already exists
        try:
            self.redis_client.ft(index_name).info()
            logger.info(f"Index {index_name} already exists")
            return
        except:
            logger.info(f"Creating index {index_name}")
        
        # Define fields for the index
        schema = (
            TextField("$.text", as_name="text"),
            TextField("$.metadata", as_name="metadata"),
            NumericField("$.timestamp", as_name="timestamp"),
            VectorField("$.embedding", 
                        "HNSW", {
                            "TYPE": "FLOAT32",
                            "DIM": self.dimension,
                            "DISTANCE_METRIC": "COSINE"
                        }, as_name="embedding")
        )
        
        # Create the index
        try:
            self.redis_client.ft(index_name).create_index(
                schema,
                definition=IndexDefinition(prefix=[f"{self.collection_name}:"], index_type=IndexType.JSON)
            )
            logger.info(f"Successfully created index {index_name}")
        except Exception as e:
            logger.error(f"Error creating index {index_name}: {str(e)}")
            raise
    
    async def store(self, data: Dict[str, Any]) -> str:
        """
        Store data in memory with vector embedding.
        
        Args:
            data: Data to store
            
        Returns:
            ID of the stored memory
        """
        try:
            # Generate a unique ID for this memory
            memory_id = str(uuid.uuid4())
            
            # Convert data to string for embedding
            if isinstance(data, dict):
                text_for_embedding = json.dumps(data)
            else:
                text_for_embedding = str(data)
            
            # Generate embedding
            embeddings = await self.ai_service.generate_embeddings([text_for_embedding])
            if not embeddings or len(embeddings) == 0:
                logger.error("Failed to generate embedding")
                return ""
            
            embedding = embeddings[0]
            
            # Prepare memory object
            memory_object = {
                "text": text_for_embedding,
                "metadata": json.dumps({"original_type": type(data).__name__}),
                "embedding": embedding,
                "timestamp": int(time.time())  # Current timestamp
            }
            
            # Store in Redis
            key = f"{self.collection_name}:{memory_id}"
            self.redis_client.json().set(key, "$", memory_object)
            
            logger.debug(f"Stored memory with ID {memory_id}")
            return memory_id
            
        except Exception as e:
            logger.error(f"Error storing memory: {str(e)}")
            return ""
    
    async def retrieve(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific memory by ID.
        
        Args:
            memory_id: ID of the memory to retrieve
            
        Returns:
            Retrieved memory data or None if not found
        """
        try:
            key = f"{self.collection_name}:{memory_id}"
            result = self.redis_client.json().get(key)
            
            if not result:
                logger.warning(f"Memory with ID {memory_id} not found")
                return None
            
            # Parse the stored text back to its original form if possible
            try:
                original_data = json.loads(result["text"])
                return original_data
            except:
                return {"text": result["text"]}
                
        except Exception as e:
            logger.error(f"Error retrieving memory {memory_id}: {str(e)}")
            return None
    
    async def search(self, query: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar memories using vector similarity.
        
        Args:
            query: Query data to find similar memories
            limit: Maximum number of results to return
            
        Returns:
            List of similar memories
        """
        try:
            # Convert query to string for embedding
            if isinstance(query, dict):
                query_text = json.dumps(query)
            else:
                query_text = str(query)
            
            # Generate embedding for query
            query_embeddings = await self.ai_service.generate_embeddings([query_text])
            if not query_embeddings or len(query_embeddings) == 0:
                logger.error("Failed to generate query embedding")
                return []
            
            query_embedding = query_embeddings[0]
            
            # Prepare search query
            index_name = f"idx:{self.collection_name}"
            query_vector = np.array(query_embedding, dtype=np.float32).tobytes()
            
            # Execute vector search
            q = f"*=>[KNN {limit} @embedding $query_vector AS score]"
            query_params = {"query_vector": query_vector}
            
            results = self.redis_client.ft(index_name).search(q, query_params=query_params)
            
            # Process results
            memories = []
            for doc in results.docs:
                try:
                    memory_data = json.loads(doc.text)
                    memories.append({
                        "data": memory_data,
                        "score": float(doc.score),
                        "id": doc.id.split(":")[-1]
                    })
                except:
                    memories.append({
                        "data": {"text": doc.text},
                        "score": float(doc.score),
                        "id": doc.id.split(":")[-1]
                    })
            
            return memories
            
        except Exception as e:
            logger.error(f"Error searching memories: {str(e)}")
            return []
    
    async def update(self, memory_id: str, data: Dict[str, Any]) -> bool:
        """
        Update an existing memory.
        
        Args:
            memory_id: ID of the memory to update
            data: New data to store
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            # Check if memory exists
            key = f"{self.collection_name}:{memory_id}"
            if not self.redis_client.exists(key):
                logger.warning(f"Memory with ID {memory_id} not found for update")
                return False
            
            # Convert data to string for embedding
            if isinstance(data, dict):
                text_for_embedding = json.dumps(data)
            else:
                text_for_embedding = str(data)
            
            # Generate embedding
            embeddings = await self.ai_service.generate_embeddings([text_for_embedding])
            if not embeddings or len(embeddings) == 0:
                logger.error("Failed to generate embedding for update")
                return False
            
            embedding = embeddings[0]
            
            # Prepare updated memory object
            memory_object = {
                "text": text_for_embedding,
                "metadata": json.dumps({"original_type": type(data).__name__, "updated": True}),
                "embedding": embedding,
                "timestamp": int(time.time())  # Current timestamp
            }
            
            # Update in Redis
            self.redis_client.json().set(key, "$", memory_object)
            
            logger.debug(f"Updated memory with ID {memory_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating memory {memory_id}: {str(e)}")
            return False
    
    async def delete(self, memory_id: str) -> bool:
        """
        Delete a memory.
        
        Args:
            memory_id: ID of the memory to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            key = f"{self.collection_name}:{memory_id}"
            result = self.redis_client.delete(key)
            
            if result == 1:
                logger.debug(f"Deleted memory with ID {memory_id}")
                return True
            else:
                logger.warning(f"Memory with ID {memory_id} not found for deletion")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting memory {memory_id}: {str(e)}")
            return False
    
    async def clear_all(self) -> bool:
        """
        Clear all memories in this collection.
        
        Returns:
            True if clearing was successful, False otherwise
        """
        try:
            # Find all keys in this collection
            pattern = f"{self.collection_name}:*"
            keys = self.redis_client.keys(pattern)
            
            if keys:
                # Delete all keys
                self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} memories from collection {self.collection_name}")
            else:
                logger.info(f"No memories to clear in collection {self.collection_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error clearing memories: {str(e)}")
            return False
