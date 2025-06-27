"""
MetaPilot Usage Examples
-----------------------
This script demonstrates how to use the MetaPilot API client.
"""

import asyncio
import json
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
API_KEY = os.getenv("API_KEY", "your-api-key-here")


async def create_user_example():
    """Example of creating a user."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/users",
            headers={"X-API-Key": API_KEY},
            json={"username": "example_user", "email": "user@example.com"}
        )
        
        print("Create User Response:")
        print(json.dumps(response.json(), indent=2))
        return response.json()


async def create_rule_example(user_id):
    """Example of creating a rule for a user."""
    rule_data = {
        "type": "keyword",
        "keywords": ["ethereum", "proposal", "vote"],
        "action": {
            "type": "notification",
            "target": "email",
            "details": {
                "recipient": "user@example.com",
                "subject": "New Ethereum Proposal"
            }
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://localhost:8000/users/{user_id}/rules",
            headers={"X-API-Key": API_KEY},
            json=rule_data
        )
        
        print("\nCreate Rule Response:")
        print(json.dumps(response.json(), indent=2))
        return response.json()


async def run_metapilot_example(user_id):
    """Example of running MetaPilot for a user."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://localhost:8000/users/{user_id}/run",
            headers={"X-API-Key": API_KEY}
        )
        
        print("\nRun MetaPilot Response:")
        print(json.dumps(response.json(), indent=2))


async def gaia_completion_example():
    """Example of using Gaia Agent for completion."""
    request_data = {
        "prompt": "What are the benefits of decentralized finance?",
        "model": "llama",
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/gaia/completion",
            headers={"X-API-Key": API_KEY},
            json=request_data
        )
        
        print("\nGaia Completion Response:")
        print(json.dumps(response.json(), indent=2))


async def main():
    """Run all examples."""
    # Create a user
    user_response = await create_user_example()
    user_id = user_response["user_id"]
    
    # Create a rule for the user
    await create_rule_example(user_id)
    
    # Run MetaPilot for the user
    await run_metapilot_example(user_id)
    
    # Use Gaia Agent for completion
    await gaia_completion_example()


if __name__ == "__main__":
    asyncio.run(main())
