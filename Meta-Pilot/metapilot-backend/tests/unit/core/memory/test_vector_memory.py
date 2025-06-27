"""
Unit tests for VectorMemory.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import asyncio
import json
import time

from metapilot.core.memory.vector_memory import VectorMemory


class TestVectorMemory(unittest.TestCase):
    """Test cases for VectorMemory."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {'VECTOR_DB_URI': 'redis://localhost:6379/1'})
        self.env_patcher.start()
        
        # Mock Redis
        self.redis_patcher = patch('metapilot.core.memory.vector_memory.redis')
        self.mock_redis_module = self.redis_patcher.start()
        self.mock_redis_client = MagicMock()
        self.mock_redis_module.from_url.return_value = self.mock_redis_client
        
        # Mock Redis JSON commands
        self.mock_json = MagicMock()
        self.mock_redis_client.json.return_value = self.mock_json
        
        # Mock Redis search
        self.mock_ft = MagicMock()
        self.mock_redis_client.ft.return_value = self.mock_ft
        
        # Mock AIService
        self.ai_service_patcher = patch('metapilot.core.memory.vector_memory.AIService')
        self.mock_ai_service_class = self.ai_service_patcher.start()
        self.mock_ai_service = MagicMock()
        self.mock_ai_service_class.return_value = self.mock_ai_service
        
        # Create test embeddings
        self.test_embedding = [0.1, 0.2, 0.3, 0.4]
        self.mock_ai_service.generate_embeddings = MagicMock()
        self.mock_ai_service.generate_embeddings.return_value = asyncio.Future()
        self.mock_ai_service.generate_embeddings.return_value.set_result([self.test_embedding])
        
        # Create memory instance
        self.memory = VectorMemory("test_collection", dimension=4)
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
        self.redis_patcher.stop()
        self.ai_service_patcher.stop()
    
    def test_initialization(self):
        """Test VectorMemory initialization."""
        self.assertEqual(self.memory.collection_name, "test_collection")
        self.assertEqual(self.memory.dimension, 4)
        self.mock_redis_module.from_url.assert_called_once_with('redis://localhost:6379/1')
        self.mock_ft.info.assert_called_once()
    
    def test_create_index(self):
        """Test index creation."""
        # Setup mock to raise exception to trigger index creation
        self.mock_ft.info.side_effect = Exception("Index not found")
        
        # Create new memory to trigger index creation
        memory = VectorMemory("new_collection", dimension=4)
        
        # Verify index creation was called
        self.mock_ft.create_index.assert_called_once()
    
    async def test_store(self):
        """Test storing data in memory."""
        # Setup test data
        test_data = {"key": "value"}
        
        # Run test
        memory_id = await self.memory.store(test_data)
        
        # Verify
        self.assertTrue(memory_id)  # Should return a UUID
        self.mock_ai_service.generate_embeddings.assert_called_once()
        self.mock_json.set.assert_called_once()
        
        # Check that the key format is correct
        args = self.mock_json.set.call_args[0]
        self.assertTrue(args[0].startswith("test_collection:"))
    
    async def test_retrieve(self):
        """Test retrieving data from memory."""
        # Setup mock
        test_data = {"text": '{"key": "value"}'}
        self.mock_json.get.return_value = test_data
        
        # Run test
        result = await self.memory.retrieve("test-id")
        
        # Verify
        self.assertEqual(result, {"key": "value"})
        self.mock_json.get.assert_called_once_with("test_collection:test-id")
    
    async def test_search(self):
        """Test searching for similar memories."""
        # Setup mock search results
        mock_doc1 = MagicMock()
        mock_doc1.text = '{"key1": "value1"}'
        mock_doc1.score = 0.95
        mock_doc1.id = "test_collection:id1"
        
        mock_doc2 = MagicMock()
        mock_doc2.text = '{"key2": "value2"}'
        mock_doc2.score = 0.85
        mock_doc2.id = "test_collection:id2"
        
        mock_results = MagicMock()
        mock_results.docs = [mock_doc1, mock_doc2]
        
        self.mock_ft.search.return_value = mock_results
        
        # Run test
        query = {"search": "test"}
        results = await self.memory.search(query, limit=2)
        
        # Verify
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["data"], {"key1": "value1"})
        self.assertEqual(results[0]["score"], 0.95)
        self.assertEqual(results[0]["id"], "id1")
        
        self.assertEqual(results[1]["data"], {"key2": "value2"})
        self.assertEqual(results[1]["score"], 0.85)
        self.assertEqual(results[1]["id"], "id2")
    
    async def test_update(self):
        """Test updating memory."""
        # Setup test data
        test_data = {"key": "updated_value"}
        self.mock_redis_client.exists.return_value = True
        
        # Run test
        result = await self.memory.update("test-id", test_data)
        
        # Verify
        self.assertTrue(result)
        self.mock_redis_client.exists.assert_called_once_with("test_collection:test-id")
        self.mock_json.set.assert_called_once()
    
    async def test_delete(self):
        """Test deleting memory."""
        # Setup mock
        self.mock_redis_client.delete.return_value = 1
        
        # Run test
        result = await self.memory.delete("test-id")
        
        # Verify
        self.assertTrue(result)
        self.mock_redis_client.delete.assert_called_once_with("test_collection:test-id")
    
    async def test_clear_all(self):
        """Test clearing all memories."""
        # Setup mock
        self.mock_redis_client.keys.return_value = ["test_collection:id1", "test_collection:id2"]
        
        # Run test
        result = await self.memory.clear_all()
        
        # Verify
        self.assertTrue(result)
        self.mock_redis_client.keys.assert_called_once_with("test_collection:*")
        self.mock_redis_client.delete.assert_called_once_with("test_collection:id1", "test_collection:id2")


if __name__ == '__main__':
    unittest.main()
