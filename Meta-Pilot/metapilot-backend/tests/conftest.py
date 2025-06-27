"""
Pytest configuration for MetaPilot v2.0 tests.
"""

import os
import pytest
from fastapi.testclient import TestClient

# Set test environment variables
os.environ["API_KEY"] = "test-api-key"
os.environ["AGENT_MEMORY_STORAGE"] = "memory"
os.environ["AGENT_LEARNING_RATE"] = "0.1"
os.environ["AGENT_DISCOUNT_FACTOR"] = "0.9"


@pytest.fixture
def test_client():
    """Create a test client for FastAPI."""
    from metapilot.api.app import app
    return TestClient(app)


@pytest.fixture
def mock_user_data():
    """Return mock user data for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com"
    }


@pytest.fixture
def mock_rule_data():
    """Return mock rule data for testing."""
    return {
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


@pytest.fixture
def mock_agent_request():
    """Return mock agent request data for testing."""
    return {
        "agent_type": "governor",
        "data": {
            "task": "optimize_yield",
            "parameters": {
                "risk_tolerance": 0.5,
                "time_horizon": "30d"
            }
        },
        "parameters": {
            "confidence_threshold": 0.7,
            "max_execution_time": 60
        }
    }

@pytest.fixture
def mock_defi_request():
    """Return mock DeFi agent request data for testing."""
    return {
        "agent_type": "defi",
        "data": {
            "protocol": "uniswap",
            "tokens": ["ETH", "USDC"],
            "market_conditions": {
                "volatility": 0.2,
                "trend": 0.1
            }
        },
        "parameters": {
            "risk_tolerance": 0.6,
            "expected_return_threshold": 0.05
        }
    }

@pytest.fixture
def mock_nft_request():
    """Return mock NFT agent request data for testing."""
    return {
        "agent_type": "nft",
        "data": {
            "collection": "test_collection",
            "floor_price": 1.5,
            "volume_24h": 10.5,
            "market_trend": "bullish"
        },
        "parameters": {
            "risk_tolerance": 0.4,
            "time_horizon": "7d"
        }
    }
