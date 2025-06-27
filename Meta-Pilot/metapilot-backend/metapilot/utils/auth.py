"""
Authentication utilities for MetaPilot.
"""

import os
from fastapi import HTTPException, Depends
from fastapi.security import APIKeyHeader

# API key security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)


async def verify_api_key(api_key: str = Depends(api_key_header)):
    """
    Verify that the API key is valid.
    
    Args:
        api_key: The API key to verify
        
    Returns:
        The API key if it is valid
        
    Raises:
        HTTPException: If the API key is invalid
    """
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(
            status_code=403, 
            detail="Invalid API key"
        )
    return api_key
