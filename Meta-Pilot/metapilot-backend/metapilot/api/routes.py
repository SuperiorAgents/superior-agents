"""
API routes for MetaPilot v2.0.
"""

from datetime import datetime
from typing import Dict, List, Set

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from fastapi.security import APIKeyHeader

from metapilot.models.schemas import (
    UserCreate, UserResponse, RuleCreate, RuleResponse,
    RunResponse, ErrorResponse, StatusResponse, AgentRequest, AgentResponse,
    AutonomousOperationRequest, OperationStatus, FeedbackRequest, InsightResponse
)
from metapilot.services.user_service import UserService
from metapilot.services.monitoring_service import MonitoringService
from metapilot.services.ai_service import AIService
from metapilot.services.blockchain_service import BlockchainService
from metapilot.core.agents.governor_agent import GovernorAgent
from metapilot.core.agents.defi_agent import DeFiAgent
from metapilot.core.agents.nft_agent import NFTAgent
from metapilot.core.orchestration.agent_orchestrator import AgentOrchestrator
from metapilot.utils.auth import verify_api_key

# Initialize router
router = APIRouter()

# Initialize services
user_service = UserService()
monitoring_service = MonitoringService()
ai_service = AIService()
blockchain_service = BlockchainService()

# Initialize agents
governor_agent = GovernorAgent()
defi_agent = DeFiAgent()
nft_agent = NFTAgent()

# Initialize orchestrator
agent_orchestrator = AgentOrchestrator()

# Store start time for uptime calculation
start_time = datetime.now()

# Track operations and agents
active_operations = {}
agent_registry = {
    "governor": governor_agent,
    "defi": defi_agent,
    "nft": nft_agent
}

# Background task manager
background_tasks: Set = set()


@router.get("/health", response_model=StatusResponse)
async def health_check():
    """API health check and status."""
    
    # Calculate uptime
    uptime = datetime.now() - start_time
    uptime_seconds = uptime.total_seconds()
    
    # Get system status
    system_status = monitoring_service.get_system_status()
    
    # Get counts from agent operations
    agent_count = len(agent_registry)
    operation_count = len(active_operations)
    
    # Calculate success rate (default to 100% if no operations)
    success_count = sum(1 for op in active_operations.values() if op.get("status") == "completed")
    success_rate = success_count / operation_count if operation_count > 0 else 1.0
    
    return {
        "status": "ok",
        "version": "2.0.0",
        "uptime_seconds": uptime_seconds,
        "active_operations": len(active_operations),
        "system_status": system_status,
        "agent_count": agent_count,
        "operation_count": operation_count,
        "success_rate": success_rate
    }


@router.post("/users", response_model=UserResponse, responses={400: {"model": ErrorResponse}})
async def create_new_user(user: UserCreate, api_key: str = Depends(verify_api_key)):
    """Create a new user."""
    
    result = await user_service.create_user(user.username, user.email)
    
    if "error" in result:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )
    
    return result


@router.post("/users/{user_id}/rules", response_model=RuleResponse, responses={400: {"model": ErrorResponse}})
async def create_new_rule(
    user_id: str, 
    rule: RuleCreate, 
    api_key: str = Depends(verify_api_key)
):
    """Create a new rule for a user."""
    
    # Convert Pydantic model to dict
    rule_data = rule.dict()
    
    result = await user_service.create_rule(user_id, rule_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )
    
    return result


@router.post("/users/{user_id}/run", response_model=RunResponse, responses={400: {"model": ErrorResponse}})
async def run_metapilot(
    user_id: str, 
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_api_key)
):
    """Run MetaPilot for a user."""
    
    # Run in the background to avoid long-running requests
    background_tasks.add_task(user_service.run_metapilot_for_user, user_id)
    
    return {
        "messages": ["MetaPilot execution started in the background. Results will be stored in the database."]
    }


@router.get("/events", response_model=List[Dict])
async def get_recent_events(
    limit: int = 10,
    api_key: str = Depends(verify_api_key)
):
    """Get recent events."""
    
    # In a real implementation, query from database
    # For demonstration, return empty list
    return []


@router.post("/agents/request", response_model=AgentResponse)
async def agent_request(request_data: AgentRequest, api_key: str = Depends(verify_api_key)):
    """Send a request to a specific agent."""
    
    try:
        # Get the requested agent
        agent_type = request_data.agent_type
        if agent_type not in agent_registry:
            raise HTTPException(status_code=404, detail=f"Agent type '{agent_type}' not found")
        
        agent = agent_registry[agent_type]
        
        # Generate agent ID
        agent_id = f"{agent_type}-{datetime.now().timestamp()}"
        
        # Analyze data with the agent
        decision = await agent.analyze(request_data.data)
        
        # Return the agent's decision
        return {
            "agent_id": agent_id,
            "decision": decision
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/agents/execute", response_model=OperationStatus)
async def execute_agent_decision(agent_id: str, api_key: str = Depends(verify_api_key)):
    """Execute a decision made by an agent."""
    
    try:
        # Parse agent ID to get agent type
        agent_type = agent_id.split("-")[0]
        if agent_type not in agent_registry:
            raise HTTPException(status_code=404, detail=f"Agent type '{agent_type}' not found")
        
        agent = agent_registry[agent_type]
        
        # Get the agent's last decision
        # In a real implementation, this would be retrieved from a database
        # For now, we'll simulate it
        decision = agent.last_decision if hasattr(agent, "last_decision") else None
        
        if not decision:
            raise HTTPException(status_code=404, detail=f"No decision found for agent '{agent_id}'")
        
        # Execute the decision
        result = await agent.execute(decision)
        
        # Create operation ID
        operation_id = f"op-{datetime.now().timestamp()}"
        
        # Store operation status
        active_operations[operation_id] = {
            "agent_id": agent_id,
            "status": "completed",
            "progress": 1.0,
            "current_step": "execution_completed",
            "results": result.output,
            "errors": [] if result.success else ["Execution failed"]
        }
        
        return {
            "operation_id": operation_id,
            "status": "completed",
            "progress": 1.0,
            "current_step": "execution_completed",
            "results": result.output,
            "errors": [] if result.success else ["Execution failed"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/operations/autonomous", response_model=OperationStatus)
async def start_autonomous_operation(request_data: AutonomousOperationRequest, api_key: str = Depends(verify_api_key)):
    """Start an autonomous operation using the Governor Agent."""
    
    try:
        # Create operation ID
        operation_id = f"auto-{datetime.now().timestamp()}"
        
        # Prepare data for the Governor Agent
        data = {
            "operation_type": request_data.operation_type,
            "parameters": request_data.parameters,
            "risk_tolerance": request_data.risk_tolerance,
            "max_duration_seconds": request_data.max_duration_seconds
        }
        
        # Start autonomous operation in background
        # In a real implementation, this would be a background task
        # For now, we'll simulate it
        
        # Store initial operation status
        active_operations[operation_id] = {
            "status": "running",
            "progress": 0.1,
            "current_step": "analyzing_request",
            "results": {},
            "errors": []
        }
        
        # Return initial status
        return {
            "operation_id": operation_id,
            "status": "running",
            "progress": 0.1,
            "current_step": "analyzing_request",
            "results": {},
            "errors": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/operations/{operation_id}", response_model=OperationStatus)
async def get_operation_status(operation_id: str, api_key: str = Depends(verify_api_key)):
    """Get the status of an operation."""
    
    if operation_id not in active_operations:
        raise HTTPException(status_code=404, detail=f"Operation '{operation_id}' not found")
    
    operation = active_operations[operation_id]
    
    return {
        "operation_id": operation_id,
        **operation
    }


@router.post("/insights", response_model=InsightResponse)
async def generate_insights(data: Dict, api_key: str = Depends(verify_api_key)):
    """Generate AI-powered insights from provided data."""
    
    try:
        # Use the Governor Agent to analyze the data and generate insights
        decision = await governor_agent.analyze(data)
        
        # Format insights from the decision
        insights = []
        if "insights" in decision.parameters:
            insights = decision.parameters["insights"]
        elif "analysis" in decision.parameters:
            insights = [{
                "type": "general",
                "title": "Analysis Summary",
                "content": decision.parameters["analysis"],
                "confidence": decision.confidence
            }]
        
        return {
            "insights": insights,
            "confidence": decision.confidence,
            "data_sources": data.get("sources", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# AI text generation endpoint
@router.post("/ai/generate")
async def generate_text(request: Dict, api_key: str = Depends(verify_api_key)):
    """Generate text using the GROQ API."""
    try:
        prompt = request.get("prompt")
        temperature = request.get("temperature", 0.7)
        max_tokens = request.get("max_tokens", 1000)
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        result = await ai_service.generate_text(
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return {"generated_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Multi-agent task execution endpoint
@router.post("/agents/execute/task")
async def execute_agent_task(request: Dict, api_key: str = Depends(verify_api_key)):
    """Execute a task using the multi-agent system."""
    try:
        task_type = request.get("task_type")
        parameters = request.get("parameters", {})
        agent_type = request.get("agent_type")
        
        if not task_type:
            raise HTTPException(status_code=400, detail="Task type is required")
        
        # If agent_type is specified, use that specific agent
        if agent_type and agent_type in agent_registry:
            result = await agent_registry[agent_type].process_task({
                "type": task_type,
                "parameters": parameters
            })
        else:
            # Otherwise use the orchestrator to select the appropriate agent
            result = await agent_orchestrator.process_task(
                task_data={
                    "type": task_type,
                    "parameters": parameters
                }
            )
        
        return {"task_id": str(result.get("task_id")), "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Blockchain data retrieval endpoint
@router.get("/blockchain/token/{token_address}")
async def get_token_info(token_address: str, api_key: str = Depends(verify_api_key)):
    """Get information about a specific token."""
    try:
        # Validate token address format
        if not token_address.startswith("0x") or len(token_address) != 42:
            raise HTTPException(status_code=400, detail="Invalid token address format")
        
        # Get token information
        token_info = await blockchain_service.get_token_info(token_address)
        
        if not token_info:
            raise HTTPException(status_code=404, detail="Token not found")
        
        return token_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
