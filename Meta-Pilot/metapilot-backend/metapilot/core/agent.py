"""
Base Agent framework for MetaPilot AI Engine v2.0.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import asyncio
import uuid

from metapilot.core.memory import VectorMemory
from metapilot.core.learning import ReinforcementLearner
from metapilot.models.schemas import Decision, ExecutionResult


class MetaPilotAgent(ABC):
    """Base agent class for all MetaPilot agents."""
    
    def __init__(self, name: str, role: str, capabilities: List[str] = None):
        """
        Initialize a new MetaPilot agent.
        
        Args:
            name: The name of the agent
            role: The role of the agent
            capabilities: The capabilities of the agent
        """
        self.id = str(uuid.uuid4())
        self.name = name
        self.role = role
        self.capabilities = capabilities or []
        self.memory = VectorMemory(collection_name=f"{name.lower()}_memory")
        self.learning_module = ReinforcementLearner()
        self.last_decision = None
    
    @abstractmethod
    async def analyze(self, data: Dict[str, Any]) -> Decision:
        """
        Analyze input data and make a decision.
        
        Args:
            data: The input data to analyze
            
        Returns:
            A decision object
        """
        pass
    
    @abstractmethod
    async def execute(self, decision: Decision) -> ExecutionResult:
        """
        Execute a decision.
        
        Args:
            decision: The decision to execute
            
        Returns:
            The result of the execution
        """
        pass
    
    async def learn_from_outcome(self, decision: Decision, result: Result) -> None:
        """
        Learn from the outcome of a decision.
        
        Args:
            decision: The decision that was made
            result: The result of the decision
        """
        feedback = self.evaluate_outcome(decision, result)
        await self.learning_module.update(decision, feedback)
    
    def evaluate_outcome(self, decision: Decision, result: Result) -> float:
        """
        Evaluate the outcome of a decision.
        
        Args:
            decision: The decision that was made
            result: The result of the decision
            
        Returns:
            A feedback score between 0 and 1
        """
        # Default implementation - can be overridden by subclasses
        if result.success:
            return 0.8 + (0.2 * result.confidence)
        else:
            return 0.2 * result.confidence
    
    async def store_experience(self, data: Dict[str, Any], decision: Decision, result: Result) -> None:
        """
        Store an experience in the agent's memory.
        
        Args:
            data: The input data
            decision: The decision that was made
            result: The result of the decision
        """
        experience = {
            "input": data,
            "decision": decision.dict(),
            "result": result.dict(),
            "timestamp": asyncio.get_event_loop().time()
        }
        
        await self.memory.store(experience)
    
    async def recall_similar_experiences(self, data: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Recall similar experiences from the agent's memory.
        
        Args:
            data: The input data
            limit: The maximum number of experiences to recall
            
        Returns:
            A list of similar experiences
        """
        return await self.memory.search(data, limit)
