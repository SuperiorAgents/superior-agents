from typing import Dict, Any


def get_mock_wallet_stats(
	address: str, infura_project_id: str, etherscan_key: str
) -> Dict[str, Any]:
	return {
		"wallet_address": "0xAB12CD34Ef5678901234567890ABCDEF12345678",
		"eth_balance": 0.1432567890123456,
		"eth_balance_reserved": 0.015,
		"eth_balance_available": 0.1282567890123456,
		"eth_price_usd": 1973.45,
		"tokens": {
			"0x1234567890abcdef1234567890abcdef12345678": {
				"symbol": "FOO",
				"balance": 12.345678,
				"price_usd": 0.0412,
			},
			"0xabcdef1234567890abcdef1234567890abcdef12": {
				"symbol": "BAR",
				"balance": 0.987654321,
				"price_usd": 1.2345,
			},
		},
		"total_value_usd": 310.87,
		"timestamp": "2025-05-04T20:16:50.675146",
	}
