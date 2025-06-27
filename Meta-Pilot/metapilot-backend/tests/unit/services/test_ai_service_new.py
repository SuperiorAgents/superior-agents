"""
Unit tests for AIService with direct GROQ API integration.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
import asyncio
import httpx
import numpy as np

from metapilot.services.ai_service import AIService


class TestAIService(unittest.TestCase):
    """Test cases for AIService with direct GROQ API integration."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {'GROQ_API_KEY': 'test-api-key'})
        self.env_patcher.start()
        
        # Mock httpx AsyncClient
        self.client_patcher = patch('metapilot.services.ai_service.httpx.AsyncClient')
        self.mock_client_class = self.client_patcher.start()
        self.mock_client = AsyncMock()
        self.mock_client_class.return_value = self.mock_client
        
        # Mock SentenceTransformer
        self.transformer_patcher = patch('metapilot.services.ai_service.SentenceTransformer')
        self.mock_transformer_class = self.transformer_patcher.start()
        self.mock_transformer = MagicMock()
        self.mock_transformer_class.return_value = self.mock_transformer
        
        # Create service instance
        self.service = AIService()
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
        self.client_patcher.stop()
        self.transformer_patcher.stop()
    
    def test_initialization(self):
        """Test AIService initialization."""
        self.assertEqual(self.service.api_key, 'test-api-key')
        self.assertEqual(self.service.default_model, 'llama3-70b-8192')
        self.assertEqual(self.service.default_temperature, 0.7)
        self.assertEqual(self.service.default_max_tokens, 1024)
        self.mock_transformer_class.assert_called_once_with('sentence-transformers/all-mpnet-base-v2')
    
    async def async_test_generate_text(self):
        """Test generate_text method."""
        # Mock response
        mock_response = AsyncMock()
        mock_response.raise_for_status = AsyncMock()
        # Use MagicMock for json() since it's not awaited in the implementation
        mock_response.json = MagicMock(return_value={
            "choices": [{"message": {"content": "Generated text"}}]
        })
        self.mock_client.post = AsyncMock(return_value=mock_response)
        
        # Call method
        result = await self.service.generate_text("Test prompt")
        
        # Verify
        self.assertEqual(result, "Generated text")
        self.mock_client.post.assert_called_once()
        args, kwargs = self.mock_client.post.call_args
        self.assertEqual(args[0], "https://api.groq.com/openai/v1/chat/completions")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer test-api-key")
        self.assertEqual(kwargs["json"]["messages"][0]["content"], "Test prompt")
    
    def test_generate_text(self):
        """Run async test for generate_text."""
        asyncio.run(self.async_test_generate_text())
    
    async def async_test_generate_embeddings(self):
        """Test generate_embeddings method."""
        # Mock response
        self.mock_transformer.encode.return_value = np.array([[0.1, 0.2], [0.3, 0.4]])
        
        # Call method
        result = await self.service.generate_embeddings(["Text 1", "Text 2"])
        
        # Verify
        self.assertEqual(result, [[0.1, 0.2], [0.3, 0.4]])
        self.mock_transformer.encode.assert_called_once_with(["Text 1", "Text 2"])
    
    def test_generate_embeddings(self):
        """Run async test for generate_embeddings."""
        asyncio.run(self.async_test_generate_embeddings())
    
    async def async_test_chain_of_thought(self):
        """Test chain_of_thought method."""
        # Mock generate_text to return a response with reasoning and answer
        self.service.generate_text = AsyncMock(return_value="Step 1: Think about X\nStep 2: Consider Y\nFinal answer: Z")
        
        # Call method
        result = await self.service.chain_of_thought("Test question")
        
        # Verify
        self.assertEqual(result["reasoning"], "Step 1: Think about X\nStep 2: Consider Y")
        self.assertEqual(result["answer"], "Final answer: Z")
        self.service.generate_text.assert_called_once()
    
    def test_chain_of_thought(self):
        """Run async test for chain_of_thought."""
        asyncio.run(self.async_test_chain_of_thought())
    
    async def async_test_generate_structured_output(self):
        """Test generate_structured_output method."""
        # Mock generate_text to return a JSON string
        self.service.generate_text = AsyncMock(return_value='```json\n{"key": "value"}\n```')
        
        # Call method
        result = await self.service.generate_structured_output("Test prompt", {"schema": "test"})
        
        # Verify
        self.assertEqual(result, {"key": "value"})
        self.service.generate_text.assert_called_once()
    
    def test_generate_structured_output(self):
        """Run async test for generate_structured_output."""
        asyncio.run(self.async_test_generate_structured_output())
    
    async def async_test_error_handling(self):
        """Test error handling."""
        # Mock client to raise an exception
        self.mock_client.post.side_effect = Exception("API error")
        
        # Call method
        result = await self.service.generate_text("Test prompt")
        
        # Verify error handling
        self.assertTrue("Error generating text" in result)
    
    def test_error_handling(self):
        """Run async test for error handling."""
        asyncio.run(self.async_test_error_handling())


if __name__ == '__main__':
    unittest.main()
