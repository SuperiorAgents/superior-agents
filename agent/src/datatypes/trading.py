from decimal import Decimal
from typing import List, TypedDict
from enum import Enum


class TokenBalance(TypedDict):
	"""
	Type definition for a token balance in a crypto portfolio.

	This class defines the structure of token balance information,
	including the token details, balance, and price information.

	Attributes:
	    token_address (str): Contract address of the token
	    symbol (str): Trading symbol of the token (e.g., "ETH", "USDT")
	    name (str): Full name of the token (e.g., "Ethereum", "Tether USD")
	    balance (Decimal): Amount of the token held
	    decimals (int): Number of decimal places used by the token
	    price_usd (float): Current price in USD
	    value_usd (float): Total value of the token balance in USD
	    change_24h (float): 24-hour price change percentage
	"""

	token_address: str
	symbol: str
	name: str
	balance: Decimal
	decimals: int
	price_usd: float
	value_usd: float
	change_24h: float


class PortfolioStatus(TypedDict):
	"""
	Type definition for the overall status of a crypto portfolio.

	This class defines the structure of a portfolio status,
	including total value, change metrics, and token balances.

	Attributes:
	    total_value_usd (float): Total portfolio value in USD
	    total_change_24h (float): Overall 24-hour change percentage
	    eth_balance (Decimal): Amount of ETH held
	    token_balances (List[TokenBalance]): List of all token balances
	    timestamp (int): Unix timestamp when the status was captured
	"""

	total_value_usd: float
	total_change_24h: float
	eth_balance: Decimal
	token_balances: List[TokenBalance]
	timestamp: int


class TradingAgentState(Enum):
	"""
	Enumeration of possible states for a trading agent.

	This enum defines the various states that a trading agent can be in,
	including success and different failure modes.

	Attributes:
	    SUCCESS (str): Agent successfully completed its operation
	    FAILED_EXECUTION (str): Agent failed during execution
	    FAILED_VALIDATION (str): Agent failed during validation
	    FAILED_INSUFFICIENT_FUNDS (str): Agent failed due to insufficient funds
	"""

	SUCCESS = "success"
	FAILED_EXECUTION = "failed_execution"
	FAILED_VALIDATION = "failed_validation"
	FAILED_INSUFFICIENT_FUNDS = "failed_insufficient_funds"
