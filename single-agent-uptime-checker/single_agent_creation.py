import requests
import json


def create_single_agent(base_url,data):
    url = base_url+"/single_agent_session"
    headers = {
        "Content-Type": "application/json"
    }

    prompts = requests.get(base_url+"/prompts").json()

    prompt_fe_data = []
    for key, value in prompts['trading'].items():
        prompt_fe_data.append({
            'name': key,
            "prompt": value
        })
    data['prompts'] = prompt_fe_data
    print(data)

    response = requests.post(url, headers=headers, data=json.dumps(data))

    print("Status Code:", response.status_code)
    print("Response Body:", response.json())

def get_file_size(base_url, session_id):
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "session_id": session_id
    }
    try:
        url = base_url+"/filesize"
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # Raise exception for bad status codes
        data = response.json()
        return data.get("size")
    except requests.RequestException as e:
        print("Request failed:", e)
        return None


def backup_file(base_url, session_id):
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "session_id": session_id
    }
    try:
        url = base_url+"/backup_log"
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # Raise exception for bad status codes
        data = response.json()
        print(response.text)
    except requests.RequestException as e:
        print("Request failed:", e)
        return None

if __name__ == "__main__":
    create_single_agent("http://34.2.24.98:4999")