import requests
import json
import time
from single_agent_creation import create_single_agent, backup_file, get_file_size
import sys
from live_agents_input import URLS, PAYLOADS

name_mapping = {
    "single_agent_dev": "Agent 2",
    "single_agent_2": "Agent 1"
}

def send_message_tg(message, message_id=None):
    url = "https://api.telegram.org/bot"+"6847847314:AAEdiC4FZ6k_Cq9FPGLNlPvhpfdSGBBk4P4"+"/sendMessage"
    reserved_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in reserved_chars:
        message = message.replace(char, f'\\{char}')
    params = {
        'chat_id': "-4659031741",
        'text': message,
        'parse_mode': "MarkdownV2",
    }
    if message_id:
        params['reply_to_message_id'] = int(message_id)
    resp = requests.post(url,json = params)
    print(resp.text)

def do_something(base_url, payload):
    send_message_tg(f"{name_mapping[payload['session_id']]} stopped working. \nNo new logs generated after 5 minutes. \nrestarting in 5 seconds")
    backup_file(base_url, payload['session_id'])
    time.sleep(5)
    create_single_agent(base_url, payload)
    send_message_tg(f"{name_mapping[payload['session_id']]} restarted!")

def monitor_file_size(base_url, payload):
    unchanged_attempts = 0
    last_size = None
    
    while True:
        current_size = get_file_size(base_url, payload['session_id'])
        if current_size is None:
            print("Failed to get file size. Retrying in 1 minute...")
        elif current_size == last_size:
            unchanged_attempts += 1
            print(f"File size unchanged ({current_size}). Attempt {unchanged_attempts}/5.")
            if unchanged_attempts >= 5:
                do_something(base_url, payload)
                unchanged_attempts = 0  # Reset the counter after action
        else:
            print(f"File size changed to {current_size}. Resetting counter.")
            unchanged_attempts = 0
        
        last_size = current_size
        time.sleep(60)  # Wait 1 minute before checking again

if __name__ == "__main__":
    # python3 trigger-restart AGENT_1|AGENT_2
    agent_conf = sys.argv[1]    
    assert PAYLOADS[agent_conf]['session_id']
    monitor_file_size(URLS[agent_conf],PAYLOADS[agent_conf])