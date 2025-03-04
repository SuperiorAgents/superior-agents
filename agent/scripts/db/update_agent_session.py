import os
import requests
import json

DB_SERVICE_API_KEY = os.getenv("DB_SERVICE_API_KEY")
DB_SERVICE_URL = os.getenv("DB_SERVICE_URL")

def update_agent_sessions(agent_id, session_id):
    headers = {
        'x-api-key': DB_SERVICE_API_KEY
    }
    data = {
        "agent_id": agent_id,
        "session_id": session_id
    }
    agent_session = requests.post(DB_SERVICE_URL+"/agent_sessions/get_v2", json=data, headers=headers).json()
    agent_session = agent_session['data'][0]
    print(agent_session)
    if not agent_session['trades_count']:
        agent_session['trades_count'] = 0
    data['trades_count'] =  str(agent_session['trades_count'] + 1)
    requests.post(DB_SERVICE_URL +"/agent_sessions/update", json=data, headers=headers).json()
    
    
