module.exports = {
    "apps": [{
        "name": "superioagents/meta-swap-api",
        "script": "src/main.ts",
        "watch": false,
        "interpreter": "tsx",
        "ignore_watch": ["node_modules", "logs", "dist"],
        "max_memory_restart": "4G",
        "env": {
            "ETH_RPC_URL": "https://cloudflare-eth.com",
            "ETH_PRIVATE_KEY": "<YOUR_ETH_PRIVATE_KEY>",
            "ONEINCH_API_KEY": "<YOUR_1INCH_API_KEY>",
            "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com",
            "SOLANA_PRIVATE_KEY": "<YOUR_SOLANA_PRIVATE_KEY>",
            "PORT": 9009,
            "ETH_AGENT_IDS": [123, 456, 789],
            "ETH_AGENT_123_PRIVATE_KEY": "<AGENT_123_PRIVATE_KEY>",
            "ETH_AGENT_456_PRIVATE_KEY": "<AGENT_456_PRIVATE_KEY>",
            "ETH_AGENT_789_PRIVATE_KEY": "<AGENT_789_PRIVATE_KEY>",
        },
        "log_date_format": "YYYY-MM-DD HH:mm:ss",
        "merge_logs": true,
        "autorestart": true,
        "restart_delay": 4000,
        "max_restarts": 1000,
        "wait_ready": true,
        "listen_timeout": 8000,
        "kill_timeout": 1600,
        "source_map_support": true,
        "cwd": "./meta-swap-api"
    }]
}
