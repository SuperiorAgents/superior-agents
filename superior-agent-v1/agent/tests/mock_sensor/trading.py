from typing import Any, Dict
from tests.mock_sensor.wallet import get_mock_wallet_stats
from src.datatypes.trading import PortfolioStatus
from functools import partial

from decimal import Decimal
import time

# Mock current prices (as of a point in time)
mock_portfolio: PortfolioStatus = {
	"total_value_usd": 100.00,  # $30 USDT + $40 ETH + $30 MATIC
	"total_change_24h": -2.15,  # Weighted average of all tokens' 24h changes
	"eth_balance": Decimal("0.0166"),  # ~$40 worth of ETH at $2400/ETH
	"token_balances": [
		{
			"token_address": "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT contract
			"symbol": "USDT",
			"name": "Tether USD",
			"balance": Decimal("30.00"),  # 30 USDT
			"decimals": 6,
			"price_usd": 1.00,
			"value_usd": 30.00,
			"change_24h": -0.01,  # Very stable as it's a stablecoin
		},
		{
			"token_address": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",  # MATIC contract
			"symbol": "MATIC",
			"name": "Polygon",
			"balance": Decimal("33.33"),  # ~$30 worth at ~$0.90/MATIC
			"decimals": 18,
			"price_usd": 0.90,
			"value_usd": 30.00,
			"change_24h": -5.23,  # More volatile
		},
	],
	"timestamp": int(time.time()),  # Current Unix timestamp
}


class MockTradingSensor:
	def __init__(
		self, eth_address: str, infura_project_id: str, etherscan_api_key: str
	):
		self.eth_address = eth_address
		self.infura_project_id = infura_project_id
		self.etherscan_api_key = etherscan_api_key

	def get_portfolio_status(self) -> Dict[str, Any]:
		wallet_stats = get_mock_wallet_stats(
			self.eth_address, self.infura_project_id, self.etherscan_api_key
		)
		# mock = {
		# 	"eth_balance": 0.008,
		# 	"tokens": {
		# 		"0xdAC17F958D2ee523a2206206994597C13D831ec7": {
		# 			"symbol": "USDT",
		# 			"balance": 5000.0,
		# 		}
		# 	},
		# 	"timestamp": "2025-02-03T03:28:31.805820",
		# }

		return wallet_stats

	def get_metric_fn(self, metric_name: str = "wallet"):
		metrics = {
			"wallet": partial(
				get_mock_wallet_stats,
				self.eth_address,
				self.infura_project_id,
				self.etherscan_api_key,
			)
		}
		if metric_name not in metrics:
			raise ValueError(f"Unsupported metric: {metric_name}")
		return metrics[metric_name]
