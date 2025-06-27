"""
Agent Orchestrator for MetaPilot AI Engine v2.0.
"""

import os
import uuid
import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Type

from metapilot.models.schemas import Decision, ExecutionResult, AgentType
from metapilot.core.agents.base_agent import MetaPilotAgent
from metapilot.core.agents.governor_agent import GovernorAgent
from metapilot.core.agents.defi_agent import DeFiAgent
from metapilot.core.agents.nft_agent import NFTAgent
from metapilot.core.agents.dao_agent import DAOAgent
from metapilot.core.agents.cross_chain_agent import CrossChainAgent
from metapilot.core.agents.market_intelligence_agent import MarketIntelligenceAgent
from metapilot.core.agents.risk_agent import RiskAgent
from metapilot.services.ai_service import AIService

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Agent Orchestrator for MetaPilot AI Engine v2.0.
    
    Manages the creation, coordination, and execution of specialized agents.
    """
    
    def __init__(self):
        """Initialize the Agent Orchestrator."""
        self.agents: Dict[str, MetaPilotAgent] = {}
        self.ai_service = AIService()
        
        # Initialize default agents
        self._initialize_default_agents()
        
        logger.info("AgentOrchestrator initialized")
    
    def _initialize_default_agents(self):
        """Initialize default agents."""
        # Create Governor Agent (always present as the coordinating agent)
        governor = GovernorAgent()
        self.agents[governor.id] = governor
        
        # Create other agents based on configuration
        self._create_agent_if_enabled(AgentType.DEFI, DeFiAgent)
        self._create_agent_if_enabled(AgentType.NFT, NFTAgent)
        self._create_agent_if_enabled(AgentType.DAO, DAOAgent)
        self._create_agent_if_enabled(AgentType.CROSS_CHAIN, CrossChainAgent)
        self._create_agent_if_enabled(AgentType.MARKET_INTELLIGENCE, MarketIntelligenceAgent)
        self._create_agent_if_enabled(AgentType.RISK, RiskAgent)
    
    def _create_agent_if_enabled(self, agent_type: str, agent_class: Type[MetaPilotAgent]):
        """
        Create an agent if it's enabled in configuration.
        
        Args:
            agent_type: Type of agent to create
            agent_class: Class of agent to instantiate
        """
        # Check if agent is enabled in environment variables
        env_var = f"ENABLE_{agent_type.upper()}_AGENT"
        if os.environ.get(env_var, "true").lower() == "true":
            try:
                agent = agent_class()
                self.agents[agent.id] = agent
                logger.info(f"Created {agent_type} agent with ID {agent.id}")
            except Exception as e:
                logger.error(f"Failed to create {agent_type} agent: {str(e)}")
    
    def get_agent(self, agent_id: str) -> Optional[MetaPilotAgent]:
        """
        Get an agent by ID.
        
        Args:
            agent_id: ID of the agent to get
            
        Returns:
            Agent instance or None if not found
        """
        return self.agents.get(agent_id)
    
    def get_agent_by_type(self, agent_type: str) -> Optional[MetaPilotAgent]:
        """
        Get an agent by type.
        
        Args:
            agent_type: Type of agent to get
            
        Returns:
            Agent instance or None if not found
        """
        for agent in self.agents.values():
            if agent.name.lower().replace(" ", "_") == agent_type.lower():
                return agent
        return None
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """
        List all available agents.
        
        Returns:
            List of agent information dictionaries
        """
        return [
            {
                "id": agent.id,
                "name": agent.name,
                "role": agent.role,
                "capabilities": agent.capabilities
            }
            for agent in self.agents.values()
        ]
    
    async def process_task(self, task_data: Dict[str, Any], agent_type: str = None) -> ExecutionResult:
        """
        Process a task using the appropriate agent.
        
        Args:
            task_data: Task data to process
            agent_type: Optional type of agent to use (if None, will be determined automatically)
            
        Returns:
            ExecutionResult of the executed decision
        """
        try:
            # If agent type is specified, use that agent
            if agent_type:
                agent = self.get_agent_by_type(agent_type)
                if not agent:
                    return ExecutionResult(
                        success=False,
                        output=None,
                        error=f"Agent type {agent_type} not found"
                    )
                
                logger.info(f"Processing task with specified agent type: {agent_type}")
                return await agent.process_task(task_data)
            
            # Otherwise, use the Governor Agent to delegate
            governor = self.get_agent_by_type(AgentType.GOVERNOR)
            if not governor:
                return ExecutionResult(
                    success=False,
                    output=None,
                    error="Governor Agent not found"
                )
            
            logger.info("Processing task with Governor Agent for delegation")
            return await governor.process_task(task_data)
            
        except Exception as e:
            logger.error(f"Error processing task: {str(e)}")
            return ExecutionResult(
                success=False,
                output=None,
                error=f"Error processing task: {str(e)}"
            )
    
    async def autonomous_operation(self, operation_type: str, parameters: Dict[str, Any], 
                                  risk_tolerance: float = 0.5, 
                                  max_duration_seconds: int = 3600) -> Dict[str, Any]:
        """
        Execute an autonomous operation involving multiple agents.
        
        Args:
            operation_type: Type of operation to execute
            parameters: Parameters for the operation
            risk_tolerance: Risk tolerance level (0.0 to 1.0)
            max_duration_seconds: Maximum duration in seconds
            
        Returns:
            Operation results
        """
        operation_id = str(uuid.uuid4())
        logger.info(f"Starting autonomous operation {operation_id} of type {operation_type}")
        
        # Create operation context
        context = {
            "operation_id": operation_id,
            "operation_type": operation_type,
            "parameters": parameters,
            "risk_tolerance": risk_tolerance,
            "max_duration_seconds": max_duration_seconds,
            "start_time": time.time(),
            "status": "running",
            "progress": 0.0,
            "current_step": "initializing",
            "results": {},
            "errors": []
        }
        
        try:
            # Get the Governor Agent to coordinate the operation
            governor = self.get_agent_by_type(AgentType.GOVERNOR)
            if not governor:
                raise ValueError("Governor Agent not found")
            
            # Start the operation
            context["current_step"] = "planning"
            
            # Create operation plan
            plan_data = {
                "operation_type": operation_type,
                "parameters": parameters,
                "risk_tolerance": risk_tolerance,
                "context": context
            }
            
            plan_result = await governor.analyze(plan_data)
            if not plan_result or not plan_result.action:
                raise ValueError("Failed to create operation plan")
            
            context["plan"] = plan_result.parameters.get("plan", [])
            context["progress"] = 0.1
            
            # Execute the plan steps
            steps = context["plan"]
            total_steps = len(steps)
            
            for i, step in enumerate(steps):
                # Update context
                context["current_step"] = f"executing_step_{i+1}"
                context["progress"] = 0.1 + 0.8 * (i / total_steps)
                
                # Determine which agent should handle this step
                agent_type = step.get("agent_type", AgentType.GOVERNOR)
                agent = self.get_agent_by_type(agent_type)
                
                if not agent:
                    error_msg = f"Agent type {agent_type} not found for step {i+1}"
                    context["errors"].append(error_msg)
                    logger.error(error_msg)
                    continue
                
                # Execute the step
                step_data = {
                    "operation_id": operation_id,
                    "step_number": i + 1,
                    "step_type": step.get("type"),
                    "parameters": step.get("parameters", {}),
                    "context": context
                }
                
                step_result = await agent.process_task(step_data)
                
                # Store the result
                step["result"] = {
                    "success": step_result.success,
                    "output": step_result.output,
                    "error": step_result.error
                }
                
                # Check for failure
                if not step_result.success:
                    error_msg = f"Step {i+1} failed: {step_result.error}"
                    context["errors"].append(error_msg)
                    logger.error(error_msg)
                    
                    # Check if this is a critical step
                    if step.get("critical", False):
                        context["status"] = "failed"
                        break
            
            # Finalize the operation
            context["current_step"] = "finalizing"
            context["progress"] = 0.9
            
            # Analyze results and generate summary
            summary_data = {
                "operation_id": operation_id,
                "operation_type": operation_type,
                "steps": context["plan"],
                "errors": context["errors"]
            }
            
            summary_result = await governor.analyze(summary_data)
            
            if summary_result and summary_result.parameters:
                context["results"] = summary_result.parameters.get("summary", {})
            
            # Mark as complete
            context["status"] = "completed" if not context["errors"] else "completed_with_errors"
            context["progress"] = 1.0
            context["current_step"] = "completed"
            
            logger.info(f"Completed autonomous operation {operation_id}")
            
            return {
                "operation_id": operation_id,
                "status": context["status"],
                "progress": context["progress"],
                "results": context["results"],
                "errors": context["errors"]
            }
            
        except Exception as e:
            error_msg = f"Error in autonomous operation: {str(e)}"
            logger.error(error_msg)
            
            context["status"] = "failed"
            context["errors"].append(error_msg)
            context["current_step"] = "failed"
            
            return {
                "operation_id": operation_id,
                "status": "failed",
                "progress": context["progress"],
                "results": context["results"],
                "errors": context["errors"]
            }
    
    async def get_operation_status(self, operation_id: str) -> Dict[str, Any]:
        """
        Get the status of an autonomous operation.
        
        Args:
            operation_id: ID of the operation
            
        Returns:
            Operation status information
        """
        # In a real implementation, this would retrieve the status from a database
        # For now, we'll return a simulated status
        return {
            "operation_id": operation_id,
            "status": "running",
            "progress": 0.5,
            "current_step": "executing_step_3",
            "results": {},
            "errors": []
        }
    
    async def provide_feedback(self, operation_id: str, rating: float, comments: Optional[str] = None) -> bool:
        """
        Provide feedback on an autonomous operation for learning.
        
        Args:
            operation_id: ID of the operation
            rating: Rating from 1.0 to 5.0
            comments: Optional feedback comments
            
        Returns:
            True if feedback was processed successfully
        """
        try:
            # In a real implementation, this would store the feedback and use it for learning
            # For now, we'll just log it
            logger.info(f"Received feedback for operation {operation_id}: rating={rating}, comments={comments}")
            
            # Convert rating to a reward (-1.0 to 1.0)
            reward = (rating - 3.0) / 2.0
            
            # Apply feedback to all agents that participated in the operation
            for agent in self.agents.values():
                # In a real implementation, we would only update agents that participated
                # and we would have specific state and action information
                feedback_data = {
                    "reward": reward,
                    "comments": comments,
                    "operation_id": operation_id
                }
                
                # Apply general feedback
                await agent.learner.learn_from_feedback(feedback_data, {"operation_id": operation_id}, "participate")
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing feedback: {str(e)}")
            return False
