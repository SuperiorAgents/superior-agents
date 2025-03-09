from dataclasses import dataclass
import datetime
from decimal import Decimal
from typing import Dict, List, Optional, TypedDict
from enum import Enum


class TokenBalance(TypedDict):
    """Type definition for a token balance in a crypto portfolio."""

    token_address: str
    symbol: str
    name: str
    balance: Decimal
    decimals: int
    price_usd: float
    value_usd: float
    change_24h: float


class PortfolioStatus(TypedDict):
    """Type definition for the overall status of a crypto portfolio."""

    total_value_usd: float
    total_change_24h: float
    eth_balance: Decimal
    token_balances: List[TokenBalance]
    timestamp: int


class TradingAgentState(Enum):
    """Enumeration of possible states for a trading agent."""

    SUCCESS = "success"
    FAILED_EXECUTION = "failed_execution"
    FAILED_VALIDATION = "failed_validation"
    FAILED_INSUFFICIENT_FUNDS = "failed_insufficient_funds"
