"""
Unit tests for MetaPilotAgent base class.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import asyncio

from metapilot.core.agents.base_agent import MetaPilotAgent
from metapilot.models.schemas import Decision, ExecutionResult


# Create a concrete implementation of the abstract base class for testing
class TestableAgent(MetaPilotAgent):
    """Concrete implementation of MetaPilotAgent for testing."""
    
    async def analyze(self, data):
        """Implement abstract method."""
        return Decision(
            action="test_action",
            parameters={"param": "value"},
            confidence=0.9,
            reasoning="Test reasoning"
        )
    
    async def execute(self, decision):
        """Implement abstract method."""
        return ExecutionResult(
            success=True,
            output={"result": "test_output"},
            error=None
        )


class TestMetaPilotAgent(unittest.TestCase):
    """Test cases for MetaPilotAgent."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock VectorMemory
        self.memory_patcher = patch('metapilot.core.agents.base_agent.VectorMemory')
        self.mock_memory_class = self.memory_patcher.start()
        self.mock_memory = MagicMock()
        self.mock_memory_class.return_value = self.mock_memory
        
        # Mock ReinforcementLearner
        self.learner_patcher = patch('metapilot.core.agents.base_agent.ReinforcementLearner')
        self.mock_learner_class = self.learner_patcher.start()
        self.mock_learner = MagicMock()
        self.mock_learner_class.return_value = self.mock_learner
        
        # Create agent instance
        self.agent = TestableAgent(
            name="Test Agent",
            role="Test Role",
            capabilities=["capability1", "capability2"]
        )
    
    def tearDown(self):
        """Clean up after tests."""
        self.memory_patcher.stop()
        self.learner_patcher.stop()
    
    def test_initialization(self):
        """Test agent initialization."""
        self.assertEqual(self.agent.name, "Test Agent")
        self.assertEqual(self.agent.role, "Test Role")
        self.assertEqual(self.agent.capabilities, ["capability1", "capability2"])
        self.assertIsNotNone(self.agent.id)
        
        # Verify memory initialization
        self.mock_memory_class.assert_called_once_with("agent_test_agent")
        
        # Verify learner initialization
        self.mock_learner_class.assert_called_once_with(self.agent.id)
    
    async def test_store_memory(self):
        """Test storing data in memory."""
        # Setup mock
        memory_id = "test-memory-id"
        self.mock_memory.store.return_value = asyncio.Future()
        self.mock_memory.store.return_value.set_result(memory_id)
        
        # Run test
        test_data = {"key": "value"}
        result = await self.agent.store_memory(test_data)
        
        # Verify
        self.assertEqual(result, memory_id)
        self.mock_memory.store.assert_called_once_with(test_data)
    
    async def test_retrieve_memory(self):
        """Test retrieving data from memory."""
        # Setup mock
        test_data = {"key": "value"}
        self.mock_memory.retrieve.return_value = asyncio.Future()
        self.mock_memory.retrieve.return_value.set_result(test_data)
        
        # Run test
        result = await self.agent.retrieve_memory("test-id")
        
        # Verify
        self.assertEqual(result, test_data)
        self.mock_memory.retrieve.assert_called_once_with("test-id")
    
    async def test_search_memory(self):
        """Test searching memory."""
        # Setup mock
        test_results = [{"data": {"key": "value"}}]
        self.mock_memory.search.return_value = asyncio.Future()
        self.mock_memory.search.return_value.set_result(test_results)
        
        # Run test
        query = {"search": "test"}
        results = await self.agent.search_memory(query, limit=3)
        
        # Verify
        self.assertEqual(results, test_results)
        self.mock_memory.search.assert_called_once_with(query, 3)
    
    async def test_learn_from_result(self):
        """Test learning from execution result."""
        # Setup test data
        result = ExecutionResult(success=True, output={}, error=None)
        next_state = {"type": "next"}
        
        # Setup mock
        self.agent.last_decision = Decision(
            action="test_action",
            parameters={},
            confidence=0.9,
            reasoning=""
        )
        
        # Run test
        await self.agent.learn_from_result(result, next_state)
        
        # Verify
        self.mock_learner.learn_from_result.assert_called_once_with(result, next_state)
    
    async def test_process_task(self):
        """Test processing a task from start to finish."""
        # Setup test data
        task_data = {
            "id": "task-123",
            "type": "test_task",
            "parameters": {"param1": "value1"}
        }
        
        # Setup mocks for memory storage
        self.mock_memory.store.return_value = asyncio.Future()
        self.mock_memory.store.return_value.set_result("memory-id")
        
        # Run test
        result = await self.agent.process_task(task_data)
        
        # Verify
        self.assertTrue(result.success)
        self.assertEqual(result.output, {"result": "test_output"})
        self.assertIsNone(result.error)
        
        # Verify memory storage calls (3 calls: task, decision, result)
        self.assertEqual(self.mock_memory.store.call_count, 3)
        
        # Verify learner calls
        self.mock_learner.record_decision.assert_called_once()
        self.mock_learner.learn_from_result.assert_called_once()
    
    async def test_process_task_error_handling(self):
        """Test error handling in process_task."""
        # Setup test data
        task_data = {"type": "test_task"}
        
        # Setup mock to raise exception
        with patch.object(self.agent, 'analyze', side_effect=Exception("Test error")):
            # Run test
            result = await self.agent.process_task(task_data)
            
            # Verify
            self.assertFalse(result.success)
            self.assertIsNone(result.output)
            self.assertTrue("Error processing task" in result.error)
    
    def test_string_representation(self):
        """Test string representation of agent."""
        # Verify
        expected = f"Test Agent ({self.agent.id}): Test Role"
        self.assertEqual(str(self.agent), expected)


if __name__ == '__main__':
    unittest.main()
