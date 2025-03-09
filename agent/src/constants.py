FE_DATA_MARKETING_DEFAULTS = {
    "model": "deepseek_v3_or",
    "role": "terse, funny, curious, philosophical",
    "time": "24h",
    "metric_name": "followers",
    "research_tools": [
        "Twitter",
        "CoinGecko",
        "DuckDuckGo",
    ],
    "notifications": ["twitter"],
    "twitter_access_token": "",
    "prompts": {},
}

FE_DATA_TRADING_DEFAULTS = {
    "model": "deepseek_v3_or",
    "role": "terse, funny, curious, philosophical",
    "network": "ethereum",
    "time": "24h",
    "metric_name": "wallet",
    "research_tools": [
        "CoinGecko",
        "DuckDuckGo",
    ],
    "prompts": {},
    "notifications": ["twitter"],
    "trading_instruments": ["spot"],
}
