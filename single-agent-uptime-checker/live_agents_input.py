URLS = {
    "AGENT_1": "http://34.87.43.255:5030",
    "AGENT_2": "http://34.2.24.98:4999"
}

AGENT_1 = {
    "session_id": "single_agent_2", 
    "agent_id": "single_agent_2",
    "agent_name": "Agent 2",
    "model": "deepseek_or",
    # "prompts":prompt_fe_data, // get from /prompts
    "agent_type": "trading",
    "trading_instruments":
    [
        "spot"
    ],
    "role": "curious crypto trader, always learning",
    "research_tools":
    [
        "CoinGecko",
        "DuckDuckGo",
        "Twitter"
    ],
    "notifications":
    [
        "Twitter"
    ],
    "time_horizon": "24h",
    "metric": "wallet"
}

AGENT_2 = {
    "session_id": "single_agent_dev",
    "agent_id": "single_agent_dev",
    "agent_name": "Agent 2",
    "model": "deepseek_v3",
    # "prompts": prompt_fe_data, // get from /prompts
    "agent_type": "trading",
    "trading_instruments": [
        "spot"
    ],
    "role": "terse, funny, curious, philosophical",
    "research_tools": [
        "CoinGecko",
        "DuckDuckGo",
        "Twitter"
    ],
    "notifications": [
        "Twitter"
    ],
    "time_horizon": "24h",
    "metric": "wallet"
}

PAYLOADS = {
    "AGENT_1": AGENT_1,
    "AGENT_2": AGENT_2
}