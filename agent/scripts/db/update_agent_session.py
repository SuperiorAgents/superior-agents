"""
This module provides functionality to interact with the database service API for tracking and updating trading sessions.
"""

import os
import requests
import json

DB_SERVICE_API_KEY = os.getenv("DB_SERVICE_API_KEY")
DB_SERVICE_URL = os.getenv("DB_SERVICE_URL")


def update_agent_sessions(agent_id, session_id):
    """This function updates the trade count for a specific agent session."""
    # Set authentication headers for the API request
    headers = {"x-api-key": DB_SERVICE_API_KEY}
    # Prepare data payload with agent and session identifiers
    data = {"agent_id": agent_id, "session_id": session_id}
    # Retrieve the current agent session data from the database service
    agent_session = requests.post(
        DB_SERVICE_URL + "/agent_sessions/get_v2", json=data, headers=headers
    ).json()
    # Extract the first agent session from the response data
    agent_session = agent_session["data"][0]
    print(agent_session)
    # Set trades_count to 0 if it doesn't exist or is falsy
    if not agent_session["trades_count"]:
        agent_session["trades_count"] = 0
    # Increment the trades_count and add it to the data payload
    data["trades_count"] = str(agent_session["trades_count"] + 1)
    # Update the agent session with the new trades count
    requests.post(
        DB_SERVICE_URL + "/agent_sessions/update", json=data, headers=headers
    ).json()
