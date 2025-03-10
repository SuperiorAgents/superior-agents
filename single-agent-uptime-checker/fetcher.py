import requests
import json
import os

# Get API URL and key from environment variables
API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")


def get_agent_session(data):
    """
    Retrieves agent session information by making a POST request to the API.

    Args:
        data (dict): The payload to send to the API containing session parameters

    Returns:
        dict: The JSON response from the API containing session information
    """
    url = API_URL + "/api_v1/agent_sessions/get_v2"
    # Define headers including content type and authentication
    headers = {"Content-Type": "application/json", "x-api-key": API_KEY}
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()
