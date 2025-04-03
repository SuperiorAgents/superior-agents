"""
GRPO Data Collector Module

This module handles the collection and processing of data for Group Relative Policy Optimization (GRPO).
It converts agent interactions into training examples with reward signals based on portfolio value changes.
"""

import os
import json
import datetime
from typing import Dict, List, Any, Optional
from datetime import datetime

from loguru import logger
from src.datatypes.trading import GRPOTrainingExample
from src.types import ChatHistory, Message

class GRPOCollector:
    """
    Collects and processes data for Group Relative Policy Optimization (GRPO).
    
    This class is responsible for:
    1. Capturing agent interactions and portfolio state changes
    2. Calculating rewards based on portfolio value changes
    3. Converting the data into the format required for GRPO training
    4. Saving the training examples to disk
    """
    
    def __init__(self, output_dir: str = "data/grpo"):
        """
        Initialize the GRPO Collector.
        
        Args:
            output_dir (str): Directory where GRPO training data will be saved
        """
        self.output_dir = output_dir
        self._ensure_output_dir()
    
    def _ensure_output_dir(self) -> None:
        """Ensure the output directory exists."""
        os.makedirs(self.output_dir, exist_ok=True)
        logger.info(f"GRPO Collector initialized with output directory: {self.output_dir}")
    
    def calculate_reward(
        self, 
        portfolio_start: Dict[str, Any], 
        portfolio_end: Dict[str, Any]
    ) -> tuple[float, Dict[str, float]]:
        """
        Calculate reward based on portfolio value changes.
        
        Args:
            portfolio_start (Dict[str, Any]): Portfolio state at the start
            portfolio_end (Dict[str, Any]): Portfolio state at the end
            
        Returns:
            tuple[float, Dict[str, float]]: Total reward and reward components
        """
        reward_components = {}
        
        # Calculate portfolio value change
        try:
            start_value = portfolio_start.get("total_value_usd", 0)
            end_value = portfolio_end.get("total_value_usd", 0)
            
            # Absolute change
            absolute_change = end_value - start_value
            reward_components["absolute_change"] = absolute_change
            
            # Percentage change
            if start_value > 0:
                percentage_change = (absolute_change / start_value) * 100
                reward_components["percentage_change"] = percentage_change
            else:
                percentage_change = 0
                reward_components["percentage_change"] = 0
            
            # Baseline to compare against (e.g., market average)
            # This could be enhanced with actual market data
            market_baseline = 0.5  # Assume 0.5% as market baseline
            reward_components["market_outperformance"] = percentage_change - market_baseline
            
            # Risk adjustment factor
            # Simple volatility measure based on token count and diversification
            token_count = len(portfolio_end.get("token_balances", []))
            if token_count > 1:
                risk_factor = 1.0  # Better diversification
            else:
                risk_factor = 0.8  # Less diversification
            
            reward_components["risk_factor"] = risk_factor
            
            # Final reward calculation
            # Weight the components based on importance
            total_reward = (
                (0.3 * absolute_change) +  # 30% weight to absolute change
                (0.4 * percentage_change) +  # 40% weight to percentage change
                (0.2 * reward_components["market_outperformance"]) +  # 20% weight to market outperformance
                (0.1 * risk_factor * 10)  # 10% weight to risk factor (scaled)
            )
            
            logger.info(f"Calculated GRPO reward: {total_reward} from components: {reward_components}")
            return total_reward, reward_components
            
        except Exception as e:
            logger.error(f"Error calculating reward: {str(e)}")
            return 0.0, {"error": str(e)}
    
    def create_training_example(
        self,
        chat_history: ChatHistory,
        strategy_output: str,
        trading_code: str,
        portfolio_start: Dict[str, Any],
        portfolio_end: Dict[str, Any],
        execution_success: bool
    ) -> GRPOTrainingExample:
        """
        Create a GRPO training example from agent interaction.
        
        Args:
            chat_history (ChatHistory): Chat history with system and user prompts
            strategy_output (str): The agent's strategy reasoning
            trading_code (str): The trading code that was executed
            portfolio_start (Dict[str, Any]): Portfolio state at the start
            portfolio_end (Dict[str, Any]): Portfolio state at the end
            execution_success (bool): Whether the trading execution was successful
            
        Returns:
            GRPOTrainingExample: Formatted training example for GRPO
        """
        # Calculate reward
        reward, reward_components = self.calculate_reward(portfolio_start, portfolio_end)
        
        # If execution failed, apply penalty
        if not execution_success:
            reward = reward * 0.5  # 50% penalty for failed execution
            reward_components["execution_penalty"] = 0.5
        
        # Format messages for prompt
        prompt_messages = []
        for msg in chat_history.messages:
            if msg.role in ["system", "user"]:
                prompt_messages.append({"role": msg.role, "content": msg.content})
                
        # Create the training example
        example: GRPOTrainingExample = {
            "prompt": prompt_messages,
            "reasoning": strategy_output,
            "answer": trading_code,
            "reward": reward,
            "reward_components": reward_components,
            "portfolio_start": portfolio_start,
            "portfolio_end": portfolio_end,
            "timestamp": datetime.now().isoformat()
        }
        
        return example
    
    def save_training_example(self, example: GRPOTrainingExample) -> str:
        """
        Save a GRPO training example to disk.
        
        Args:
            example (GRPOTrainingExample): The training example to save
            
        Returns:
            str: Path to the saved file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"grpo_example_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(example, f, indent=2)
        
        logger.info(f"Saved GRPO training example to {filepath}")
        return filepath
    
    def save_training_dataset(self, examples: List[GRPOTrainingExample], name: str) -> str:
        """
        Save a collection of training examples as a dataset.
        
        Args:
            examples (List[GRPOTrainingExample]): List of training examples
            name (str): Name for the dataset
            
        Returns:
            str: Path to the saved dataset
        """
        timestamp = datetime.now().strftime("%Y%m%d")
        filename = f"grpo_dataset_{name}_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(examples, f, indent=2)
        
        logger.info(f"Saved GRPO dataset with {len(examples)} examples to {filepath}")
        return filepath