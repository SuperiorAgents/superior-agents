"""
Unit tests for AIService.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import asyncio

from metapilot.services.ai_service import AIService


class TestAIService(unittest.TestCase):
    """Test cases for AIService."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {'GROQ_API_KEY': 'test-api-key'})
        self.env_patcher.start()
        
        # Create service instance with mocked dependencies
        self.llm_patcher = patch('metapilot.services.ai_service.Groq')
        self.mock_groq = self.llm_patcher.start()
        self.mock_llm = MagicMock()
        self.mock_groq.return_value = self.mock_llm
        
        self.embeddings_patcher = patch('metapilot.services.ai_service.HuggingFaceEmbeddings')
        self.mock_embeddings_class = self.embeddings_patcher.start()
        self.mock_embeddings = MagicMock()
        self.mock_embeddings_class.return_value = self.mock_embeddings
        
        self.service = AIService()
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
        self.llm_patcher.stop()
        self.embeddings_patcher.stop()
    
    def test_initialization(self):
        """Test AIService initialization."""
        self.assertEqual(self.service.groq_api_key, 'test-api-key')
        self.mock_groq.assert_called_once()
        self.mock_embeddings_class.assert_called_once()
    
    def test_generate_text(self):
        """Test text generation."""
        # Setup mock
        self.mock_llm.return_value = "Generated text response"
        
        # Run test
        result = asyncio.run(self.service.generate_text("Test prompt"))
        
        # Verify
        self.assertEqual(result, "Generated text response")
        self.mock_llm.assert_called_once_with("Test prompt")
    
    def test_generate_embeddings(self):
        """Test embeddings generation."""
        # Setup mock
        test_embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
        self.mock_embeddings.embed_documents.return_value = test_embeddings
        
        # Run test
        result = asyncio.run(self.service.generate_embeddings(["Text 1", "Text 2"]))
        
        # Verify
        self.assertEqual(result, test_embeddings)
        self.mock_embeddings.embed_documents.assert_called_once_with(["Text 1", "Text 2"])
    
    def test_chain_of_thought(self):
        """Test chain of thought reasoning."""
        # Setup mock for LLMChain
        with patch('metapilot.services.ai_service.LLMChain') as mock_chain_class:
            mock_chain = MagicMock()
            mock_chain_class.return_value = mock_chain
            mock_chain.run.return_value = "Step 1: Think about X\nStep 2: Consider Y\nAnswer: Z"
            
            # Run test
            result = asyncio.run(self.service.chain_of_thought("What is X?"))
            
            # Verify
            self.assertEqual(result["reasoning"], "Step 1: Think about X\nStep 2: Consider Y")
            self.assertEqual(result["answer"], "Answer: Z")
    
    def test_generate_structured_output(self):
        """Test structured output generation."""
        # Setup mock
        self.mock_llm.return_value = '```json\n{"key": "value"}\n```'
        
        # Run test
        result = asyncio.run(self.service.generate_structured_output(
            "Generate JSON", {"key": ""}
        ))
        
        # Verify
        self.assertEqual(result, {"key": "value"})
    
    def test_error_handling(self):
        """Test error handling."""
        # Setup mock to raise exception
        self.mock_llm.side_effect = Exception("API Error")
        
        # Run test
        result = asyncio.run(self.service.generate_text("Test prompt"))
        
        # Verify error is handled
        self.assertTrue("Error generating text" in result)


if __name__ == '__main__':
    unittest.main()
