"""
Base Agent implementation for MetaPilot AI Engine v2.0.
"""

import os
import uuid
import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

from metapilot.models.schemas import Decision, ExecutionResult
from metapilot.core.memory.vector_memory import VectorMemory
from metapilot.core.learning.reinforcement_learner import ReinforcementLearner

logger = logging.getLogger(__name__)


class MetaPilotAgent(ABC):
    """
    Base Agent class for MetaPilot AI Engine v2.0.
    
    All specialized agents should inherit from this class and implement
    the abstract methods.
    """
    
    def __init__(self, 
                 name: str,
                 role: str,
                 capabilities: List[str],
                 agent_id: str = None):
        """
        Initialize the base agent.
        
        Args:
            name: Name of the agent
            role: Role description of the agent
            capabilities: List of capabilities this agent has
            agent_id: Optional agent ID (will be generated if not provided)
        """
        self.id = agent_id or str(uuid.uuid4())
        self.name = name
        self.role = role
        self.capabilities = capabilities
        
        # Initialize memory
        memory_collection = f"agent_{self.name.lower().replace(' ', '_')}"
        self.memory = VectorMemory(memory_collection)
        
        # Initialize reinforcement learner
        self.learner = ReinforcementLearner(self.id)
        
        # Track last decision
        self.last_decision = None
        
        logger.info(f"Initialized {self.name} agent with ID {self.id}")
    
    @abstractmethod
    async def analyze(self, data: Dict[str, Any]) -> Decision:
        """
        Analyze input data and make a decision.
        
        Args:
            data: Input data to analyze
            
        Returns:
            Decision object with action, parameters, and reasoning
        """
        pass
    
    @abstractmethod
    async def execute(self, decision: Decision) -> ExecutionResult:
        """
        Execute a decision and return the result.
        
        Args:
            decision: Decision to execute
            
        Returns:
            ExecutionResult object with success status, output, and any error
        """
        pass
    
    async def store_memory(self, data: Dict[str, Any]) -> str:
        """
        Store data in agent's memory.
        
        Args:
            data: Data to store
            
        Returns:
            ID of the stored memory
        """
        memory_id = await self.memory.store(data)
        return memory_id
    
    async def retrieve_memory(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific memory by ID.
        
        Args:
            memory_id: ID of the memory to retrieve
            
        Returns:
            Retrieved memory data or None if not found
        """
        return await self.memory.retrieve(memory_id)
    
    async def search_memory(self, query: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar memories.
        
        Args:
            query: Query data to find similar memories
            limit: Maximum number of results to return
            
        Returns:
            List of similar memories
        """
        return await self.memory.search(query, limit)
    
    async def learn_from_result(self, result: ExecutionResult, next_state: Dict[str, Any] = None) -> None:
        """
        Learn from the result of a previous decision.
        
        Args:
            result: Result of executing the decision
            next_state: Next state after executing the decision
        """
        if self.last_decision:
            self.learner.learn_from_result(result, next_state)
    
    async def process_task(self, task_data: Dict[str, Any]) -> ExecutionResult:
        """
        Process a task from start to finish.
        
        Args:
            task_data: Task data to process
            
        Returns:
            ExecutionResult of the executed decision
        """
        try:
            # Store task in memory
            await self.store_memory({
                "type": "task",
                "data": task_data,
                "timestamp": task_data.get("timestamp", None)
            })
            
            # Analyze task and make a decision
            decision = await self.analyze(task_data)
            self.last_decision = decision
            
            # Store decision in memory
            await self.store_memory({
                "type": "decision",
                "action": decision.action,
                "parameters": decision.parameters,
                "reasoning": decision.reasoning,
                "confidence": decision.confidence,
                "task_id": task_data.get("id", None)
            })
            
            # Record decision for reinforcement learning
            self.learner.record_decision(task_data, decision)
            
            # Execute the decision
            result = await self.execute(decision)
            
            # Store result in memory
            await self.store_memory({
                "type": "result",
                "success": result.success,
                "output": result.output,
                "error": result.error,
                "task_id": task_data.get("id", None),
                "decision_action": decision.action
            })
            
            # Learn from the result
            await self.learn_from_result(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing task: {str(e)}")
            return ExecutionResult(
                success=False,
                output=None,
                error=f"Error processing task: {str(e)}"
            )
    
    def __str__(self) -> str:
        """String representation of the agent."""
        return f"{self.name} ({self.id}): {self.role}"
