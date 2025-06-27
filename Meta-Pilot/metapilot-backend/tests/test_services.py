"""
Tests for the MetaPilot v2.0 services.
"""

import pytest
import uuid
import json
import httpx
from unittest.mock import patch, AsyncMock, MagicMock

from metapilot.services.user_service import UserService
from metapilot.services.monitoring_service import MonitoringService
from metapilot.core.agent import MetaPilotAgent
from metapilot.core.agents.governor_agent import GovernorAgent
from metapilot.core.agents.defi_agent import DeFiAgent
from metapilot.core.agents.nft_agent import NFTAgent
from metapilot.core.memory import VectorMemory
from metapilot.core.learning import ReinforcementLearner


class TestUserService:
    """Tests for the UserService."""
    
    @pytest.mark.asyncio
    async def test_create_user(self):
        """Test creating a user."""
        service = UserService()
        result = await service.create_user("testuser", "test@example.com")
        
        assert "user_id" in result
        assert "session_key" in result
        assert isinstance(result["user_id"], str)
        assert isinstance(result["session_key"], str)
    
    @pytest.mark.asyncio
    async def test_create_rule(self):
        """Test creating a rule."""
        service = UserService()
        rule_data = {
            "type": "keyword",
            "keywords": ["ethereum", "proposal", "vote"],
            "action": {
                "type": "notification",
                "target": "email",
                "details": {
                    "recipient": "user@example.com",
                    "subject": "New Ethereum Proposal"
                }
            }
        }
        
        result = await service.create_rule("test-user-id", rule_data)
        
        assert "rule_id" in result
        assert isinstance(result["rule_id"], str)
    
    @pytest.mark.asyncio
    async def test_run_metapilot_for_user(self):
        """Test running MetaPilot for a user."""
        service = UserService()
        result = await service.run_metapilot_for_user("test-user-id")
        
        assert "status" in result
        assert result["status"] == "completed"
        assert "actions_executed" in result


class TestAgentFramework:
    """Tests for the Agent Framework."""
    
    @pytest.mark.asyncio
    async def test_governor_agent_analyze(self):
        """Test Governor Agent analysis."""
        # Create agent
        agent = GovernorAgent()
        
        # Test data
        test_data = {
            'task': 'optimize_yield',
            'parameters': {
                'risk_tolerance': 0.5,
                'time_horizon': '30d'
            }
        }
        
        # Test
        decision = await agent.analyze(test_data)
        
        # Assertions
        assert decision.action is not None
        assert isinstance(decision.confidence, float)
        assert 0 <= decision.confidence <= 1
        assert isinstance(decision.expected_return, float)
        assert decision.reasoning is not None
    
    @pytest.mark.asyncio
    async def test_defi_agent_analyze(self):
        """Test DeFi Agent analysis."""
        # Create agent
        agent = DeFiAgent()
        
        # Test data
        test_data = {
            'protocol': 'uniswap',
            'tokens': ['ETH', 'USDC'],
            'market_conditions': {
                'volatility': 0.2,
                'trend': 0.1
            }
        }
        
        # Test
        decision = await agent.analyze(test_data)
        
        # Assertions
        assert decision.action is not None
        assert isinstance(decision.parameters, dict)
        assert isinstance(decision.confidence, float)
        assert 0 <= decision.confidence <= 1
    
    @pytest.mark.asyncio
    async def test_nft_agent_analyze(self):
        """Test NFT Agent analysis."""
        # Create agent
        agent = NFTAgent()
        
        # Test data
        test_data = {
            'collection': 'test_collection',
            'floor_price': 1.5,
            'volume_24h': 10.5,
            'market_trend': 'bullish'
        }
        
        # Test
        decision = await agent.analyze(test_data)
        
        # Assertions
        assert decision.action is not None
        assert isinstance(decision.parameters, dict)
        assert isinstance(decision.confidence, float)
        assert 0 <= decision.confidence <= 1
    
    @pytest.mark.asyncio
    async def test_vector_memory(self):
        """Test Vector Memory storage and retrieval."""
        # Create memory
        memory = VectorMemory(collection_name='test_memory')
        
        # Test experience
        test_experience = {
            'action': 'provide_liquidity',
            'parameters': {'pool': 'ETH-USDC', 'amount': 1000},
            'result': {'success': True, 'return': 0.05}
        }
        
        # Store experience
        await memory.store(test_experience)
        
        # Query similar experiences
        query = {'action': 'provide_liquidity', 'parameters': {'pool': 'ETH-USDC'}}
        results = await memory.search(query, limit=1)
        
        # Assertions
        assert len(results) > 0
        assert results[0]['action'] == 'provide_liquidity'
    
    @pytest.mark.asyncio
    async def test_reinforcement_learner(self):
        """Test Reinforcement Learner updates."""
        # Create learner
        learner = ReinforcementLearner()
        
        # Test decision
        from metapilot.models.schemas import Decision
        test_decision = Decision(
            action='provide_liquidity',
            parameters={'pool': 'ETH-USDC', 'amount': 1000},
            confidence=0.8,
            expected_return=0.05,
            reasoning='High APY with moderate risk'
        )
        
        # Update with reward
        await learner.update(test_decision, reward=0.1)
        
        # Get best action
        best_action = await learner.get_best_action(
            'action:provide_liquidity|param:pool|confidence:0.8|expected_return:0.0',
            ['provide_liquidity', 'remove_liquidity']
        )
        
        # Assertions
        assert best_action is not None
                    model="invalid-model"
                )


class TestMonitoringService:
    """Tests for the MonitoringService."""
    
    @pytest.mark.asyncio
    async def test_monitor_snapshot_proposals(self):
        """Test monitoring Snapshot proposals."""
        service = MonitoringService()
        result = await service.monitor_snapshot_proposals()
        
        assert isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_monitor_ethereum_events(self):
        """Test monitoring Ethereum events."""
        service = MonitoringService()
        result = await service.monitor_ethereum_events()
        
        assert isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_monitor_nft_prices(self):
        """Test monitoring NFT prices."""
        service = MonitoringService()
        result = await service.monitor_nft_prices()
        
        assert isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_monitor_token_prices(self):
        """Test monitoring token prices."""
        service = MonitoringService()
        result = await service.monitor_token_prices()
        
        assert isinstance(result, list)
