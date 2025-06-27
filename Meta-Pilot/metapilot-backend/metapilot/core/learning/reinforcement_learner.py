"""
Reinforcement Learning implementation for MetaPilot AI Engine v2.0.
"""

import os
import json
import logging
import time
import random
import numpy as np
from typing import Dict, List, Any, Optional, Tuple

from metapilot.models.schemas import Decision, ExecutionResult

logger = logging.getLogger(__name__)


class ReinforcementLearner:
    """
    Reinforcement Learner for MetaPilot AI Engine v2.0.
    
    Provides reinforcement learning capabilities for agents to improve decision making
    based on feedback and outcomes.
    """
    
    def __init__(self, agent_id: str, learning_rate: float = None, discount_factor: float = None):
        """
        Initialize Reinforcement Learner.
        
        Args:
            agent_id: ID of the agent this learner belongs to
            learning_rate: Learning rate (alpha) for Q-learning updates
            discount_factor: Discount factor (gamma) for future rewards
        """
        self.agent_id = agent_id
        
        # Get parameters from environment variables or use defaults
        self.learning_rate = learning_rate or float(os.environ.get("AGENT_LEARNING_RATE", "0.1"))
        self.discount_factor = discount_factor or float(os.environ.get("AGENT_DISCOUNT_FACTOR", "0.9"))
        
        # Initialize Q-table for action-state values
        self.q_table = {}
        
        # Track recent actions and states for updates
        self.last_state = None
        self.last_action = None
        
        logger.info(f"ReinforcementLearner initialized for agent {agent_id} with "
                   f"learning_rate={self.learning_rate}, discount_factor={self.discount_factor}")
    
    def _get_state_key(self, state: Dict[str, Any]) -> str:
        """
        Convert a state dictionary to a string key for the Q-table.
        
        Args:
            state: State dictionary
            
        Returns:
            String key representing the state
        """
        # Extract key features from state to create a simplified representation
        # This is a simplified approach - in a real system, you'd want more sophisticated
        # state representation that captures the essential features while generalizing well
        
        key_features = {}
        
        # Extract common features that might be present in states
        if "type" in state:
            key_features["type"] = state["type"]
        
        if "context" in state:
            # For context, we might just want to know what kind of context it is
            # rather than the full context details
            if isinstance(state["context"], dict):
                key_features["context_type"] = list(state["context"].keys())
            elif isinstance(state["context"], list):
                key_features["context_size"] = len(state["context"])
            else:
                key_features["has_context"] = True
        
        if "parameters" in state and isinstance(state["parameters"], dict):
            # Extract parameter names but not values to generalize better
            key_features["param_keys"] = sorted(list(state["parameters"].keys()))
        
        # If we couldn't extract any features, use a hash of the full state
        if not key_features:
            return str(hash(json.dumps(state, sort_keys=True)))
        
        return json.dumps(key_features, sort_keys=True)
    
    def _get_action_key(self, action: str) -> str:
        """
        Convert an action to a string key for the Q-table.
        
        Args:
            action: Action string or object
            
        Returns:
            String key representing the action
        """
        if isinstance(action, str):
            return action
        elif hasattr(action, "action"):
            return action.action
        else:
            return str(action)
    
    def get_q_value(self, state: Dict[str, Any], action: str) -> float:
        """
        Get Q-value for a state-action pair.
        
        Args:
            state: Current state
            action: Action to evaluate
            
        Returns:
            Q-value for the state-action pair
        """
        state_key = self._get_state_key(state)
        action_key = self._get_action_key(action)
        
        # Initialize state in Q-table if not present
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        # Initialize action in state's action dictionary if not present
        if action_key not in self.q_table[state_key]:
            self.q_table[state_key][action_key] = 0.0
        
        return self.q_table[state_key][action_key]
    
    def update_q_value(self, state: Dict[str, Any], action: str, reward: float, next_state: Dict[str, Any] = None) -> None:
        """
        Update Q-value for a state-action pair using Q-learning.
        
        Args:
            state: Current state
            action: Action taken
            reward: Reward received
            next_state: Next state after taking the action
        """
        state_key = self._get_state_key(state)
        action_key = self._get_action_key(action)
        
        # Initialize state in Q-table if not present
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        # Initialize action in state's action dictionary if not present
        if action_key not in self.q_table[state_key]:
            self.q_table[state_key][action_key] = 0.0
        
        # Get current Q-value
        current_q = self.q_table[state_key][action_key]
        
        # Calculate max Q-value for next state if provided
        max_next_q = 0.0
        if next_state:
            next_state_key = self._get_state_key(next_state)
            if next_state_key in self.q_table:
                next_q_values = list(self.q_table[next_state_key].values())
                if next_q_values:
                    max_next_q = max(next_q_values)
        
        # Q-learning update formula: Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        
        # Update Q-value
        self.q_table[state_key][action_key] = new_q
        
        logger.debug(f"Updated Q-value for state {state_key}, action {action_key}: {current_q} -> {new_q}")
    
    def select_action(self, state: Dict[str, Any], available_actions: List[str], 
                     exploration_rate: float = 0.1) -> str:
        """
        Select an action using epsilon-greedy policy.
        
        Args:
            state: Current state
            available_actions: List of available actions
            exploration_rate: Probability of selecting a random action (epsilon)
            
        Returns:
            Selected action
        """
        # Exploration: select a random action
        if random.random() < exploration_rate:
            action = random.choice(available_actions)
            logger.debug(f"Exploration: selected random action {action}")
            return action
        
        # Exploitation: select the action with the highest Q-value
        state_key = self._get_state_key(state)
        
        # If state not in Q-table, initialize it
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        # Get Q-values for all available actions
        q_values = {}
        for action in available_actions:
            action_key = self._get_action_key(action)
            if action_key in self.q_table[state_key]:
                q_values[action] = self.q_table[state_key][action_key]
            else:
                # Initialize Q-value for new action
                self.q_table[state_key][action_key] = 0.0
                q_values[action] = 0.0
        
        # Select action with highest Q-value (with random tie-breaking)
        if q_values:
            max_q = max(q_values.values())
            best_actions = [a for a, q in q_values.items() if q == max_q]
            action = random.choice(best_actions)
            logger.debug(f"Exploitation: selected best action {action} with Q-value {max_q}")
            return action
        else:
            # If no Q-values available, select random action
            action = random.choice(available_actions)
            logger.debug(f"No Q-values available: selected random action {action}")
            return action
    
    def record_decision(self, state: Dict[str, Any], decision: Decision) -> None:
        """
        Record a decision for later learning updates.
        
        Args:
            state: State when decision was made
            decision: Decision that was made
        """
        self.last_state = state
        self.last_action = decision.action
        
        logger.debug(f"Recorded decision: action={decision.action} in state={self._get_state_key(state)}")
    
    def learn_from_result(self, result: ExecutionResult, next_state: Dict[str, Any] = None) -> None:
        """
        Learn from the result of a previous decision.
        
        Args:
            result: Result of executing the decision
            next_state: Next state after executing the decision
        """
        if self.last_state is None or self.last_action is None:
            logger.warning("Cannot learn from result: no previous decision recorded")
            return
        
        # Calculate reward based on execution result
        reward = self._calculate_reward(result)
        
        # Update Q-value
        self.update_q_value(self.last_state, self.last_action, reward, next_state)
        
        logger.info(f"Learned from result: action={self.last_action}, reward={reward}")
        
        # Reset last state and action
        self.last_state = None
        self.last_action = None
    
    def learn_from_feedback(self, feedback: Dict[str, Any], state: Dict[str, Any], action: str) -> None:
        """
        Learn from explicit feedback.
        
        Args:
            feedback: Feedback data
            state: State when action was taken
            action: Action that was taken
        """
        # Extract reward from feedback
        reward = self._extract_reward_from_feedback(feedback)
        
        # Update Q-value (no next state for direct feedback)
        self.update_q_value(state, action, reward)
        
        logger.info(f"Learned from feedback: action={action}, reward={reward}")
    
    def _calculate_reward(self, result: ExecutionResult) -> float:
        """
        Calculate reward from execution result.
        
        Args:
            result: Result of executing a decision
            
        Returns:
            Calculated reward
        """
        # Base reward based on success
        base_reward = 1.0 if result.success else -1.0
        
        # Additional reward/penalty based on output
        additional_reward = 0.0
        
        if result.output:
            # Check for common indicators of quality in the output
            if isinstance(result.output, dict):
                # Reward for providing detailed output
                additional_reward += min(0.5, len(result.output) * 0.1)
                
                # Check for specific positive indicators
                if "profit" in result.output and isinstance(result.output["profit"], (int, float)):
                    additional_reward += min(1.0, result.output["profit"] * 0.1)
                
                if "savings" in result.output and isinstance(result.output["savings"], (int, float)):
                    additional_reward += min(0.5, result.output["savings"] * 0.05)
        
        # Penalty for errors
        error_penalty = 0.0
        if result.error:
            error_penalty = -1.0
        
        total_reward = base_reward + additional_reward + error_penalty
        
        logger.debug(f"Calculated reward: {total_reward} (base={base_reward}, "
                    f"additional={additional_reward}, error_penalty={error_penalty})")
        
        return total_reward
    
    def _extract_reward_from_feedback(self, feedback: Dict[str, Any]) -> float:
        """
        Extract reward from feedback data.
        
        Args:
            feedback: Feedback data
            
        Returns:
            Extracted reward
        """
        # Check for explicit reward
        if "reward" in feedback and isinstance(feedback["reward"], (int, float)):
            return float(feedback["reward"])
        
        # Check for rating
        if "rating" in feedback and isinstance(feedback["rating"], (int, float)):
            # Convert rating (assumed 1-5) to reward (-1 to 1)
            return (float(feedback["rating"]) - 3) / 2
        
        # Check for binary feedback
        if "positive" in feedback and isinstance(feedback["positive"], bool):
            return 1.0 if feedback["positive"] else -1.0
        
        # Default neutral reward
        return 0.0
    
    def save_model(self, filepath: str) -> bool:
        """
        Save the Q-table to a file.
        
        Args:
            filepath: Path to save the model
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(filepath, 'w') as f:
                json.dump({
                    "agent_id": self.agent_id,
                    "learning_rate": self.learning_rate,
                    "discount_factor": self.discount_factor,
                    "q_table": self.q_table,
                    "timestamp": time.time()
                }, f)
            
            logger.info(f"Saved model to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            return False
    
    def load_model(self, filepath: str) -> bool:
        """
        Load the Q-table from a file.
        
        Args:
            filepath: Path to load the model from
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Verify this model is for the correct agent
            if data.get("agent_id") != self.agent_id:
                logger.warning(f"Model agent ID mismatch: {data.get('agent_id')} != {self.agent_id}")
                return False
            
            self.q_table = data.get("q_table", {})
            
            # Optionally update learning parameters
            if "learning_rate" in data:
                self.learning_rate = data["learning_rate"]
            
            if "discount_factor" in data:
                self.discount_factor = data["discount_factor"]
            
            logger.info(f"Loaded model from {filepath} with {len(self.q_table)} states")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
