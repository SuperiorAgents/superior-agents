"""
Tests for the MetaPilot v2.0 API.
"""

import json
import pytest
from unittest.mock import patch, MagicMock


def test_root_endpoint(test_client):
    """Test the root endpoint."""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "online"
    assert "uptime" in data
    assert "agent_count" in data
    assert "operation_count" in data
    assert "success_rate" in data


def test_create_user_without_api_key(test_client, mock_user_data):
    """Test creating a user without an API key."""
    response = test_client.post("/users", json=mock_user_data)
    assert response.status_code == 403


def test_create_user_with_api_key(test_client, mock_user_data):
    """Test creating a user with a valid API key."""
    with patch("metapilot.services.user_service.UserService.create_user") as mock_create_user:
        mock_create_user.return_value = {"user_id": "test-user-id", "session_key": "test-session-key"}
        
        response = test_client.post(
            "/users",
            json=mock_user_data,
            headers={"X-API-Key": "test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test-user-id"
        assert data["session_key"] == "test-session-key"


def test_create_rule(test_client, mock_rule_data):
    """Test creating a rule for a user."""
    with patch("metapilot.services.user_service.UserService.create_rule") as mock_create_rule:
        mock_create_rule.return_value = {"rule_id": "test-rule-id"}
        
        response = test_client.post(
            "/users/test-user-id/rules",
            json=mock_rule_data,
            headers={"X-API-Key": "test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["rule_id"] == "test-rule-id"


def test_run_metapilot(test_client):
    """Test running MetaPilot for a user."""
    with patch("metapilot.services.user_service.UserService.run_metapilot_for_user") as mock_run:
        mock_run.return_value = {"status": "completed", "actions_executed": 0}
        
        response = test_client.post(
            "/users/test-user-id/run",
            headers={"X-API-Key": "test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) > 0


def test_agent_request(test_client, mock_agent_request):
    """Test agent request endpoint."""
    with patch("metapilot.core.agents.governor_agent.GovernorAgent.analyze") as mock_analyze:
        from metapilot.models.schemas import Decision
        mock_decision = Decision(
            action="optimize_yield",
            parameters={"protocol": "aave", "amount": 1000},
            confidence=0.85,
            expected_return=0.12,
            reasoning="High APY with moderate risk"
        )
        mock_analyze.return_value = mock_decision
        
        response = test_client.post(
            "/agents/request",
            json=mock_agent_request,
            headers={"X-API-Key": "test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "agent_id" in data
        assert "decision" in data
        assert data["decision"]["action"] == "optimize_yield"
        assert data["decision"]["confidence"] == 0.85
