"""
Reinforcement learning implementation for MetaPilot AI Engine v2.0.
"""

from typing import Dict, List, Any
import asyncio
import random
import numpy as np

from metapilot.models.schemas import Decision


class ReinforcementLearner:
    """Reinforcement learning module for agent improvement."""
    
    def __init__(self, learning_rate: float = 0.1, discount_factor: float = 0.9):
        """
        Initialize a new reinforcement learner.
        
        Args:
            learning_rate: The learning rate (alpha)
            discount_factor: The discount factor (gamma)
        """
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.q_table = {}  # State-action value function
        self.experience_buffer = []  # Experience replay buffer
        
    async def update(self, decision: Decision, reward: float) -> None:
        """
        Update the Q-values based on a decision and reward.
        
        Args:
            decision: The decision that was made
            reward: The reward received
        """
        # Create a state representation from the decision context
        state = self._create_state_representation(decision)
        
        # Get the action from the decision
        action = decision.action
        
        # Update Q-value using Q-learning update rule
        if state not in self.q_table:
            self.q_table[state] = {}
        
        if action not in self.q_table[state]:
            self.q_table[state][action] = 0.0
        
        # Q(s,a) = Q(s,a) + alpha * (reward + gamma * max(Q(s',a')) - Q(s,a))
        # For now, we use a simplified update rule without the next state
        self.q_table[state][action] += self.learning_rate * (reward - self.q_table[state][action])
        
        # Store experience in replay buffer
        self.experience_buffer.append({
            "state": state,
            "action": action,
            "reward": reward
        })
        
        # Periodically replay experiences to improve learning
        if len(self.experience_buffer) >= 10:
            await self._experience_replay()
    
    async def get_best_action(self, state: str, available_actions: List[str]) -> str:
        """
        Get the best action for a state based on learned Q-values.
        
        Args:
            state: The current state
            available_actions: The available actions
            
        Returns:
            The best action
        """
        # Epsilon-greedy action selection
        epsilon = 0.1  # 10% exploration
        
        if random.random() < epsilon:
            # Exploration: choose a random action
            return random.choice(available_actions)
        else:
            # Exploitation: choose the best action based on Q-values
            if state in self.q_table:
                # Filter Q-values for available actions
                available_q_values = {
                    action: self.q_table[state].get(action, 0.0)
                    for action in available_actions
                    if action in self.q_table[state]
                }
                
                if available_q_values:
                    # Choose the action with the highest Q-value
                    return max(available_q_values.items(), key=lambda x: x[1])[0]
            
            # If no Q-values are available, choose a random action
            return random.choice(available_actions)
    
    async def _experience_replay(self, batch_size: int = 5) -> None:
        """
        Perform experience replay to improve learning.
        
        Args:
            batch_size: The number of experiences to replay
        """
        if len(self.experience_buffer) < batch_size:
            return
        
        # Sample a batch of experiences
        batch = random.sample(self.experience_buffer, batch_size)
        
        # Update Q-values for each experience in the batch
        for experience in batch:
            state = experience["state"]
            action = experience["action"]
            reward = experience["reward"]
            
            if state not in self.q_table:
                self.q_table[state] = {}
            
            if action not in self.q_table[state]:
                self.q_table[state][action] = 0.0
            
            # Update Q-value
            self.q_table[state][action] += self.learning_rate * (reward - self.q_table[state][action])
    
    def _create_state_representation(self, decision: Decision) -> str:
        """
        Create a string representation of a state from a decision.
        
        Args:
            decision: The decision
            
        Returns:
            A string representation of the state
        """
        # Extract relevant features from the decision
        # In a real implementation, this would use more sophisticated feature extraction
        
        # For now, use a simple representation based on the decision parameters
        state_features = []
        
        # Add action type
        state_features.append(f"action:{decision.action}")
        
        # Add parameter keys (sorted for consistency)
        if decision.parameters:
            param_keys = sorted(decision.parameters.keys())
            for key in param_keys[:3]:  # Limit to first 3 keys to avoid state explosion
                state_features.append(f"param:{key}")
        
        # Add confidence level (discretized)
        confidence_level = int(decision.confidence * 10) / 10
        state_features.append(f"confidence:{confidence_level}")
        
        # Add expected return (discretized)
        expected_return_level = int(decision.expected_return * 10) / 10
        state_features.append(f"expected_return:{expected_return_level}")
        
        # Combine features into a state representation
        return "|".join(state_features)


class ExperienceBuffer:
    """Buffer for storing agent experiences for learning."""
    
    def __init__(self, max_size: int = 1000):
        """
        Initialize a new experience buffer.
        
        Args:
            max_size: The maximum size of the buffer
        """
        self.buffer = []
        self.max_size = max_size
    
    def add(self, experience: Dict[str, Any]) -> None:
        """
        Add an experience to the buffer.
        
        Args:
            experience: The experience to add
        """
        # Add the experience
        self.buffer.append(experience)
        
        # If buffer is full, remove the oldest experience
        if len(self.buffer) > self.max_size:
            self.buffer.pop(0)
    
    def sample(self, batch_size: int) -> List[Dict[str, Any]]:
        """
        Sample a batch of experiences from the buffer.
        
        Args:
            batch_size: The size of the batch to sample
            
        Returns:
            A batch of experiences
        """
        # Ensure batch_size is not larger than buffer size
        batch_size = min(batch_size, len(self.buffer))
        
        # Sample without replacement
        return random.sample(self.buffer, batch_size)
    
    def clear(self) -> None:
        """Clear the buffer."""
        self.buffer = []
    
    def __len__(self) -> int:
        """Get the current size of the buffer."""
        return len(self.buffer)


class StrategyTrainer:
    """Trainer for optimizing agent strategies."""
    
    def __init__(self, learning_rate: float = 0.01):
        """
        Initialize a new strategy trainer.
        
        Args:
            learning_rate: The learning rate for model updates
        """
        self.learning_rate = learning_rate
        self.models = {}  # Strategy models
    
    async def train_on_batch(self, experiences: List[Dict[str, Any]]) -> None:
        """
        Train on a batch of experiences.
        
        Args:
            experiences: The experiences to train on
        """
        # Group experiences by strategy type
        strategy_experiences = {}
        
        for exp in experiences:
            strategy_type = exp.get("strategy_type", "default")
            
            if strategy_type not in strategy_experiences:
                strategy_experiences[strategy_type] = []
            
            strategy_experiences[strategy_type].append(exp)
        
        # Train models for each strategy type
        for strategy_type, exps in strategy_experiences.items():
            await self._train_strategy_model(strategy_type, exps)
    
    async def _train_strategy_model(self, strategy_type: str, experiences: List[Dict[str, Any]]) -> None:
        """
        Train a model for a specific strategy type.
        
        Args:
            strategy_type: The strategy type
            experiences: The experiences to train on
        """
        # In a real implementation, this would use a proper machine learning model
        # For now, use a simple averaging approach
        
        # Extract features and rewards
        features = []
        rewards = []
        
        for exp in experiences:
            # Extract features from experience
            feature_vector = self._extract_features(exp)
            features.append(feature_vector)
            
            # Extract reward
            reward = exp.get("reward", 0.0)
            rewards.append(reward)
        
        # Update model weights (simple averaging)
        if strategy_type not in self.models:
            # Initialize model with zeros
            self.models[strategy_type] = np.zeros(len(features[0])) if features else np.zeros(10)
        
        # Update weights using gradient descent
        if features and rewards:
            features_array = np.array(features)
            rewards_array = np.array(rewards)
            
            # Simple gradient descent update
            predictions = np.dot(features_array, self.models[strategy_type])
            errors = rewards_array - predictions
            
            # Update weights
            gradient = -2 * np.dot(features_array.T, errors) / len(errors)
            self.models[strategy_type] -= self.learning_rate * gradient
    
    def _extract_features(self, experience: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from an experience.
        
        Args:
            experience: The experience
            
        Returns:
            A feature vector
        """
        # In a real implementation, this would use more sophisticated feature extraction
        # For now, use a simple approach
        
        # Initialize feature vector
        features = np.zeros(10)
        
        # Extract basic features
        if "market_conditions" in experience:
            market = experience["market_conditions"]
            features[0] = market.get("volatility", 0.0)
            features[1] = market.get("trend", 0.0)
            features[2] = market.get("volume", 0.0)
        
        if "decision" in experience:
            decision = experience["decision"]
            features[3] = decision.get("confidence", 0.0)
            features[4] = decision.get("expected_return", 0.0)
        
        if "result" in experience:
            result = experience["result"]
            features[5] = float(result.get("success", False))
            features[6] = result.get("actual_return", 0.0)
        
        return features
