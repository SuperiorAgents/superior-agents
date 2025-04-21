from eth_typing import Address
from web3 import Web3
import requests
from typing import Dict, Any
from datetime import datetime

def get_mock_wallet_stats(
	address: str, infura_project_id: str, etherscan_key: str
) -> Dict[str, Any]:
    return {
        "eth_balance": 2.718,
        "tokens": {
            "0xMockTokenAddress1": {
                "symbol": "DAI",
                "balance": 1500.25
            },
            "0xMockTokenAddress2": {
                "symbol": "USDC",
                "balance": 723.10
            },
            "0xMockTokenAddress3": {
                "symbol": "UNI",
                "balance": 42.0
            }
        },
        "timestamp": datetime.now().isoformat(),
    }