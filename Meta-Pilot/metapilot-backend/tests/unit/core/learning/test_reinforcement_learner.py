"""
Unit tests for ReinforcementLearner.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import json
import tempfile

from metapilot.core.learning.reinforcement_learner import ReinforcementLearner
from metapilot.models.schemas import Decision, ExecutionResult


class TestReinforcementLearner(unittest.TestCase):
    """Test cases for ReinforcementLearner."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {
            'AGENT_LEARNING_RATE': '0.2',
            'AGENT_DISCOUNT_FACTOR': '0.8'
        })
        self.env_patcher.start()
        
        # Create learner instance
        self.learner = ReinforcementLearner("test_agent")
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
    
    def test_initialization(self):
        """Test ReinforcementLearner initialization."""
        self.assertEqual(self.learner.agent_id, "test_agent")
        self.assertEqual(self.learner.learning_rate, 0.2)
        self.assertEqual(self.learner.discount_factor, 0.8)
        self.assertEqual(self.learner.q_table, {})
        self.assertIsNone(self.learner.last_state)
        self.assertIsNone(self.learner.last_action)
    
    def test_get_state_key(self):
        """Test state key generation."""
        # Test with different state types
        state1 = {"type": "action", "context": {"data": "value"}}
        state2 = {"type": "action", "context": ["item1", "item2"]}
        state3 = {"parameters": {"param1": "value1", "param2": "value2"}}
        
        # Generate keys
        key1 = self.learner._get_state_key(state1)
        key2 = self.learner._get_state_key(state2)
        key3 = self.learner._get_state_key(state3)
        
        # Verify keys are strings and different
        self.assertIsInstance(key1, str)
        self.assertIsInstance(key2, str)
        self.assertIsInstance(key3, str)
        self.assertNotEqual(key1, key2)
        self.assertNotEqual(key1, key3)
        self.assertNotEqual(key2, key3)
    
    def test_get_action_key(self):
        """Test action key generation."""
        # Test with different action types
        action1 = "simple_action"
        action2 = MagicMock()
        action2.action = "object_action"
        action3 = {"action": "dict_action"}
        
        # Generate keys
        key1 = self.learner._get_action_key(action1)
        key2 = self.learner._get_action_key(action2)
        key3 = self.learner._get_action_key(action3)
        
        # Verify keys
        self.assertEqual(key1, "simple_action")
        self.assertEqual(key2, "object_action")
        self.assertIsInstance(key3, str)
    
    def test_get_q_value(self):
        """Test Q-value retrieval."""
        # Setup test state and action
        state = {"type": "test"}
        action = "test_action"
        state_key = self.learner._get_state_key(state)
        action_key = self.learner._get_action_key(action)
        
        # Get Q-value for new state-action pair
        q_value = self.learner.get_q_value(state, action)
        
        # Verify Q-value is initialized to 0
        self.assertEqual(q_value, 0.0)
        self.assertIn(state_key, self.learner.q_table)
        self.assertIn(action_key, self.learner.q_table[state_key])
        
        # Set Q-value and verify retrieval
        self.learner.q_table[state_key][action_key] = 0.5
        q_value = self.learner.get_q_value(state, action)
        self.assertEqual(q_value, 0.5)
    
    def test_update_q_value(self):
        """Test Q-value update."""
        # Setup test state, action, and reward
        state = {"type": "test"}
        action = "test_action"
        reward = 1.0
        next_state = {"type": "next"}
        
        # Initial Q-value should be 0
        initial_q = self.learner.get_q_value(state, action)
        self.assertEqual(initial_q, 0.0)
        
        # Update Q-value
        self.learner.update_q_value(state, action, reward, next_state)
        
        # Calculate expected Q-value: Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
        # With initial Q(s,a) = 0, α = 0.2, r = 1.0, γ = 0.8, max(Q(s',a')) = 0
        # Expected: 0 + 0.2 * (1.0 + 0.8 * 0 - 0) = 0.2
        updated_q = self.learner.get_q_value(state, action)
        self.assertEqual(updated_q, 0.2)
        
        # Update again with different reward
        self.learner.update_q_value(state, action, 0.5, next_state)
        
        # Calculate expected Q-value: Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
        # With Q(s,a) = 0.2, α = 0.2, r = 0.5, γ = 0.8, max(Q(s',a')) = 0
        # Expected: 0.2 + 0.2 * (0.5 + 0.8 * 0 - 0.2) = 0.2 + 0.2 * 0.3 = 0.2 + 0.06 = 0.26
        updated_q = self.learner.get_q_value(state, action)
        self.assertAlmostEqual(updated_q, 0.26)
    
    def test_select_action(self):
        """Test action selection."""
        # Setup test state and actions
        state = {"type": "test"}
        actions = ["action1", "action2", "action3"]
        
        # Set Q-values for actions
        self.learner.q_table[self.learner._get_state_key(state)] = {
            "action1": 0.1,
            "action2": 0.5,
            "action3": 0.2
        }
        
        # Test exploitation (exploration_rate = 0)
        action = self.learner.select_action(state, actions, exploration_rate=0)
        self.assertEqual(action, "action2")  # Should select highest Q-value
        
        # Test exploration (exploration_rate = 1)
        with patch('random.random', return_value=0.5):
            with patch('random.choice', return_value="action1"):
                action = self.learner.select_action(state, actions, exploration_rate=1)
                self.assertEqual(action, "action1")  # Should select random action
    
    def test_record_decision(self):
        """Test decision recording."""
        # Setup test state and decision
        state = {"type": "test"}
        decision = Decision(
            action="test_action",
            parameters={},
            confidence=0.8,
            reasoning="Test reasoning"
        )
        
        # Record decision
        self.learner.record_decision(state, decision)
        
        # Verify state and action are recorded
        self.assertEqual(self.learner.last_state, state)
        self.assertEqual(self.learner.last_action, "test_action")
    
    def test_learn_from_result(self):
        """Test learning from execution result."""
        # Setup test state, decision, and result
        state = {"type": "test"}
        decision = Decision(
            action="test_action",
            parameters={},
            confidence=0.8,
            reasoning="Test reasoning"
        )
        result = ExecutionResult(
            success=True,
            output={"profit": 0.5},
            error=None
        )
        
        # Record decision and learn from result
        self.learner.record_decision(state, decision)
        self.learner.learn_from_result(result)
        
        # Verify Q-value was updated
        q_value = self.learner.get_q_value(state, "test_action")
        self.assertGreater(q_value, 0)
        
        # Verify last state and action are reset
        self.assertIsNone(self.learner.last_state)
        self.assertIsNone(self.learner.last_action)
    
    def test_learn_from_feedback(self):
        """Test learning from explicit feedback."""
        # Setup test state, action, and feedback
        state = {"type": "test"}
        action = "test_action"
        feedback = {"reward": 0.8}
        
        # Learn from feedback
        self.learner.learn_from_feedback(feedback, state, action)
        
        # Verify Q-value was updated
        q_value = self.learner.get_q_value(state, action)
        self.assertEqual(q_value, 0.16)  # 0 + 0.2 * 0.8
    
    def test_calculate_reward(self):
        """Test reward calculation from execution result."""
        # Test successful result with profit
        result1 = ExecutionResult(
            success=True,
            output={"profit": 0.5},
            error=None
        )
        reward1 = self.learner._calculate_reward(result1)
        self.assertGreater(reward1, 1.0)  # Base reward + profit bonus
        
        # Test failed result with error
        result2 = ExecutionResult(
            success=False,
            output={},
            error="Test error"
        )
        reward2 = self.learner._calculate_reward(result2)
        self.assertLess(reward2, -1.0)  # Base penalty + error penalty
    
    def test_extract_reward_from_feedback(self):
        """Test reward extraction from feedback."""
        # Test explicit reward
        feedback1 = {"reward": 0.7}
        reward1 = self.learner._extract_reward_from_feedback(feedback1)
        self.assertEqual(reward1, 0.7)
        
        # Test rating
        feedback2 = {"rating": 4}
        reward2 = self.learner._extract_reward_from_feedback(feedback2)
        self.assertEqual(reward2, 0.5)  # (4 - 3) / 2
        
        # Test binary feedback
        feedback3 = {"positive": True}
        reward3 = self.learner._extract_reward_from_feedback(feedback3)
        self.assertEqual(reward3, 1.0)
        
        # Test default
        feedback4 = {"comment": "Good job"}
        reward4 = self.learner._extract_reward_from_feedback(feedback4)
        self.assertEqual(reward4, 0.0)
    
    def test_save_load_model(self):
        """Test saving and loading model."""
        # Setup test data
        state = {"type": "test"}
        action = "test_action"
        self.learner.q_table[self.learner._get_state_key(state)] = {action: 0.5}
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            filepath = tmp.name
        
        try:
            # Save model
            save_result = self.learner.save_model(filepath)
            self.assertTrue(save_result)
            
            # Create new learner
            new_learner = ReinforcementLearner("test_agent")
            self.assertEqual(new_learner.q_table, {})
            
            # Load model
            load_result = new_learner.load_model(filepath)
            self.assertTrue(load_result)
            
            # Verify Q-table was loaded
            q_value = new_learner.get_q_value(state, action)
            self.assertEqual(q_value, 0.5)
            
        finally:
            # Clean up
            os.unlink(filepath)


if __name__ == '__main__':
    unittest.main()
