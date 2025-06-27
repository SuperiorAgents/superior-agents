"""
Unit tests for AgentOrchestrator.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import asyncio

from metapilot.core.orchestration.agent_orchestrator import AgentOrchestrator
from metapilot.models.schemas import Decision, ExecutionResult, AgentType


class TestAgentOrchestrator(unittest.TestCase):
    """Test cases for AgentOrchestrator."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {
            'ENABLE_GOVERNOR_AGENT': 'true',
            'ENABLE_DEFI_AGENT': 'true',
            'ENABLE_NFT_AGENT': 'false',
            'ENABLE_DAO_AGENT': 'true'
        })
        self.env_patcher.start()
        
        # Mock agent classes
        self.governor_patcher = patch('metapilot.core.orchestration.agent_orchestrator.GovernorAgent')
        self.mock_governor_class = self.governor_patcher.start()
        self.mock_governor = MagicMock()
        self.mock_governor.id = "governor-id"
        self.mock_governor.name = "Governor"
        self.mock_governor.role = "Coordination"
        self.mock_governor.capabilities = ["coordinate", "delegate"]
        self.mock_governor_class.return_value = self.mock_governor
        
        self.defi_patcher = patch('metapilot.core.orchestration.agent_orchestrator.DeFiAgent')
        self.mock_defi_class = self.defi_patcher.start()
        self.mock_defi = MagicMock()
        self.mock_defi.id = "defi-id"
        self.mock_defi.name = "DeFi"
        self.mock_defi.role = "DeFi Operations"
        self.mock_defi.capabilities = ["swap", "lend"]
        self.mock_defi_class.return_value = self.mock_defi
        
        self.dao_patcher = patch('metapilot.core.orchestration.agent_orchestrator.DAOAgent')
        self.mock_dao_class = self.dao_patcher.start()
        self.mock_dao = MagicMock()
        self.mock_dao.id = "dao-id"
        self.mock_dao.name = "DAO"
        self.mock_dao.role = "DAO Governance"
        self.mock_dao.capabilities = ["vote", "propose"]
        self.mock_dao_class.return_value = self.mock_dao
        
        # Mock AIService
        self.ai_service_patcher = patch('metapilot.core.orchestration.agent_orchestrator.AIService')
        self.mock_ai_service_class = self.ai_service_patcher.start()
        
        # Create orchestrator instance
        self.orchestrator = AgentOrchestrator()
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
        self.governor_patcher.stop()
        self.defi_patcher.stop()
        self.dao_patcher.stop()
        self.ai_service_patcher.stop()
    
    def test_initialization(self):
        """Test orchestrator initialization."""
        # Verify agent initialization
        self.mock_governor_class.assert_called_once()
        self.mock_defi_class.assert_called_once()
        self.mock_dao_class.assert_called_once()
        
        # NFT agent should not be initialized (disabled in env vars)
        self.assertNotIn("nft-id", self.orchestrator.agents)
        
        # Verify agents are stored correctly
        self.assertEqual(len(self.orchestrator.agents), 3)
        self.assertIn("governor-id", self.orchestrator.agents)
        self.assertIn("defi-id", self.orchestrator.agents)
        self.assertIn("dao-id", self.orchestrator.agents)
    
    def test_get_agent(self):
        """Test getting agent by ID."""
        # Get existing agent
        agent = self.orchestrator.get_agent("defi-id")
        self.assertEqual(agent, self.mock_defi)
        
        # Get non-existent agent
        agent = self.orchestrator.get_agent("non-existent-id")
        self.assertIsNone(agent)
    
    def test_get_agent_by_type(self):
        """Test getting agent by type."""
        # Get existing agent
        agent = self.orchestrator.get_agent_by_type(AgentType.GOVERNOR)
        self.assertEqual(agent, self.mock_governor)
        
        # Get non-existent agent
        agent = self.orchestrator.get_agent_by_type("non-existent-type")
        self.assertIsNone(agent)
    
    def test_list_agents(self):
        """Test listing all agents."""
        agents = self.orchestrator.list_agents()
        
        # Verify list contains all agents
        self.assertEqual(len(agents), 3)
        
        # Verify agent information
        agent_ids = [agent["id"] for agent in agents]
        self.assertIn("governor-id", agent_ids)
        self.assertIn("defi-id", agent_ids)
        self.assertIn("dao-id", agent_ids)
        
        # Verify agent details
        for agent in agents:
            if agent["id"] == "governor-id":
                self.assertEqual(agent["name"], "Governor")
                self.assertEqual(agent["role"], "Coordination")
                self.assertEqual(agent["capabilities"], ["coordinate", "delegate"])
    
    async def test_process_task_with_agent_type(self):
        """Test processing task with specified agent type."""
        # Setup test data
        task_data = {"type": "test_task"}
        
        # Setup mock
        self.mock_defi.process_task.return_value = asyncio.Future()
        self.mock_defi.process_task.return_value.set_result(
            ExecutionResult(success=True, output={"result": "defi_output"}, error=None)
        )
        
        # Run test
        result = await self.orchestrator.process_task(task_data, agent_type=AgentType.DEFI)
        
        # Verify
        self.assertTrue(result.success)
        self.assertEqual(result.output, {"result": "defi_output"})
        self.mock_defi.process_task.assert_called_once_with(task_data)
    
    async def test_process_task_with_governor(self):
        """Test processing task with governor agent (default)."""
        # Setup test data
        task_data = {"type": "test_task"}
        
        # Setup mock
        self.mock_governor.process_task.return_value = asyncio.Future()
        self.mock_governor.process_task.return_value.set_result(
            ExecutionResult(success=True, output={"result": "governor_output"}, error=None)
        )
        
        # Run test
        result = await self.orchestrator.process_task(task_data)
        
        # Verify
        self.assertTrue(result.success)
        self.assertEqual(result.output, {"result": "governor_output"})
        self.mock_governor.process_task.assert_called_once_with(task_data)
    
    async def test_process_task_with_invalid_agent_type(self):
        """Test processing task with invalid agent type."""
        # Setup test data
        task_data = {"type": "test_task"}
        
        # Run test
        result = await self.orchestrator.process_task(task_data, agent_type="invalid_type")
        
        # Verify
        self.assertFalse(result.success)
        self.assertIsNone(result.output)
        self.assertTrue("not found" in result.error)
    
    async def test_autonomous_operation(self):
        """Test autonomous operation execution."""
        # Setup test data
        operation_type = "test_operation"
        parameters = {"param1": "value1"}
        
        # Setup mocks
        # Mock analyze for planning
        self.mock_governor.analyze.return_value = asyncio.Future()
        self.mock_governor.analyze.return_value.set_result(
            Decision(
                action="plan",
                parameters={"plan": [
                    {"agent_type": AgentType.GOVERNOR, "type": "step1", "parameters": {}},
                    {"agent_type": AgentType.DEFI, "type": "step2", "parameters": {}}
                ]},
                confidence=0.9,
                reasoning=""
            )
        )
        
        # Mock process_task for step execution
        self.mock_governor.process_task.return_value = asyncio.Future()
        self.mock_governor.process_task.return_value.set_result(
            ExecutionResult(success=True, output={"step": "step1_output"}, error=None)
        )
        
        self.mock_defi.process_task.return_value = asyncio.Future()
        self.mock_defi.process_task.return_value.set_result(
            ExecutionResult(success=True, output={"step": "step2_output"}, error=None)
        )
        
        # Run test
        with patch('metapilot.core.orchestration.agent_orchestrator.time'):
            result = await self.orchestrator.autonomous_operation(
                operation_type, parameters, risk_tolerance=0.7, max_duration_seconds=1800
            )
        
        # Verify
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["progress"], 1.0)
        self.assertEqual(len(result["errors"]), 0)
        
        # Verify governor was used for planning
        self.mock_governor.analyze.assert_called_once()
        
        # Verify both agents were used for steps
        self.mock_governor.process_task.assert_called_once()
        self.mock_defi.process_task.assert_called_once()
    
    async def test_autonomous_operation_with_error(self):
        """Test autonomous operation with error."""
        # Setup test data
        operation_type = "test_operation"
        parameters = {"param1": "value1"}
        
        # Setup mock to raise exception
        self.mock_governor.analyze.side_effect = Exception("Test error")
        
        # Run test
        with patch('metapilot.core.orchestration.agent_orchestrator.time'):
            result = await self.orchestrator.autonomous_operation(
                operation_type, parameters
            )
        
        # Verify
        self.assertEqual(result["status"], "failed")
        self.assertEqual(len(result["errors"]), 1)
        self.assertTrue("Test error" in result["errors"][0])
    
    async def test_get_operation_status(self):
        """Test getting operation status."""
        # Run test
        status = await self.orchestrator.get_operation_status("operation-123")
        
        # Verify
        self.assertEqual(status["operation_id"], "operation-123")
        self.assertEqual(status["status"], "running")
        self.assertEqual(status["progress"], 0.5)
    
    async def test_provide_feedback(self):
        """Test providing feedback."""
        # Run test
        result = await self.orchestrator.provide_feedback(
            "operation-123", rating=4.5, comments="Good job"
        )
        
        # Verify
        self.assertTrue(result)
        
        # Verify feedback was applied to all agents
        self.assertEqual(self.mock_governor.learner.learn_from_feedback.call_count, 1)
        self.assertEqual(self.mock_defi.learner.learn_from_feedback.call_count, 1)
        self.assertEqual(self.mock_dao.learner.learn_from_feedback.call_count, 1)


if __name__ == '__main__':
    unittest.main()
