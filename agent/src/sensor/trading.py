from typing import Any, Dict
from src.wallet import get_wallet_stats
from src.datatypes.trading import PortfolioStatus
from functools import partial

from decimal import Decimal
import time

# Mock portfolio data for testing or when real data is unavailable
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


class TradingSensor:
    """Sensor for monitoring and retrieving trading-related metrics."""

    def __init__(
        self,
        agent_id: str,
        infura_project_id: str,
        etherscan_api_key: str,
        vault_base_url: str,
        vault_api_key: str,
        txn_service_url: str,
    ):
        """
        Initialize the trading sensor with necessary credentials and endpoints.

        Args:
                agent_id (str): Identifier for the agent
                infura_project_id (str): Project ID for Infura API access
                etherscan_api_key (str): API key for Etherscan
                vault_base_url (str): Base URL for the vault service
                vault_api_key (str): API key for the vault service
                txn_service_url (str): URL for the transaction service
        """
        self.agent_id = agent_id
        self.infura_project_id = infura_project_id
        self.etherscan_api_key = etherscan_api_key

        self.vault_base_url = vault_base_url
        self.vault_api_key = vault_api_key

        self.txn_service_url = txn_service_url

    def get_portfolio_status(self) -> Dict[str, Any]:
        """
        Retrieve the current portfolio status for the agent.

        Returns:
                Dict[str, Any]: Dictionary containing wallet statistics including:
                        - eth_balance (float): ETH balance in ether
                        - tokens (Dict): Dictionary of token information
                        - timestamp (str): ISO-formatted timestamp
        """
        wallet_stats = get_wallet_stats(
            agent_id=self.agent_id,
            infura_project_id=self.infura_project_id,
            etherscan_key=self.etherscan_api_key,
            vault_base_url=self.vault_base_url,
            vault_api_key=self.vault_api_key,
            txn_service_url=self.txn_service_url,
        )

        return wallet_stats

    def get_metric_fn(self, metric_name: str = "wallet"):
        """
        Get a function that retrieves a specific metric.

        Args:
                metric_name (str, optional): Name of the metric to retrieve. Defaults to "wallet".

        Returns:
                Callable: Function that retrieves the specified metric

        Raises:
                ValueError: If an unsupported metric name is provided
        """
        metrics = {
            "wallet": partial(
                get_wallet_stats,
                agent_id=self.agent_id,
                infura_project_id=self.infura_project_id,
                etherscan_key=self.etherscan_api_key,
                vault_base_url=self.vault_base_url,
                vault_api_key=self.vault_api_key,
                txn_service_url=self.txn_service_url,
            )
        }
        if metric_name not in metrics:
            raise ValueError(f"Unsupported metric: {metric_name}")
        return metrics[metric_name]
