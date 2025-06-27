"""
New endpoints for MetaPilot v2.0 API.
These will be added to the main routes.py file.
"""

from fastapi import Depends, HTTPException
from typing import Dict

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
@router.post("/agents/execute")
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
