from dataclasses import dataclass
from typing import Any, Dict, List, TypedDict, Optional
from datetime import datetime

# Database schema reference:
# CREATE TABLE strategies (
#     id CHAR(36) PRIMARY KEY,
#     agent_id CHAR(36) NOT NULL,
#     summarized_desc TEXT,
#     full_desc TEXT,
#     parameters JSON,
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#     INDEX idx_agent_created (agent_id, created_at)
# );


class TokenData(TypedDict):
	symbol: str | Any
	balance: float


class WalletStats(TypedDict):
	wallet_address: str
	eth_balance: float
	eth_balance_reserved: float
	eth_balance_available: float
	eth_price_usd: float
	tokens: Dict[str, TokenData]
	total_value_usd: float
	timestamp: str


@dataclass
class NotificationData:
	"""
	Data class representing a notification received by the agent.

	This class encapsulates information about notifications from various sources,
	including their descriptions, source, and timing information.

	Attributes:
	    notification_id (str): Unique identifier for the notification
	    source (str): The source of the notification (e.g., "Twitter", "Price Alert")
	    short_desc (str): Brief description of the notification
	    long_desc (str): Detailed description of the notification
	    notification_date (str): Date when the notification was generated
	    created (str): Timestamp when the notification was created in the system
	"""

	notification_id: str
	source: str
	short_desc: str
	long_desc: str
	notification_date: str
	created: str


class StrategyDataParameters(TypedDict):
	"""
	Type definition for parameters associated with a trading strategy.

	This class defines the structure of parameters that describe a trading strategy,
	including the APIs used, trading instruments, metrics, and results.

	Attributes:
	    apis (List[str]): List of APIs used in the strategy
	    trading_instruments (List[str]): List of trading instruments used
	    metric_name (str): Name of the metric being tracked
	    start_metric_state (str): State of the metric at the start
	    end_metric_state (str): State of the metric at the end
	    summarized_state_change (str): Summary of how the metric changed
	    summarized_code (str): Summary of the code used in the strategy
	    code_output (str): Output produced by the strategy code
	    prev_strat (str): Reference to a previous strategy, if any
	    wallet_address (Optional[str]): Ethereum wallet address
	    wallet_value (Optional[float]): Current wallet value in USD
	    wallet_value_1h (Optional[float]): Wallet value from 1 hour ago
	    wallet_value_12h (Optional[float]): Wallet value from 12 hours ago
	    wallet_value_24h (Optional[float]): Wallet value from 24 hours ago
	"""

	apis: List[str]
	trading_instruments: List[str]
	metric_name: str
	start_metric_state: str | WalletStats
	end_metric_state: str | WalletStats
	summarized_state_change: str
	summarized_code: str
	code_output: str
	prev_strat: str
	wallet_address: Optional[str]
	notif_str: str


@dataclass
class StrategyData:
	"""
	Data class representing a complete trading strategy.

	This class encapsulates all information about a trading strategy,
	including its identifiers, descriptions, parameters, and results.

	Attributes:
	    strategy_id (str): Unique identifier for the strategy
	    agent_id (str): Identifier of the agent that created the strategy
	    summarized_desc (str): Brief description of the strategy
	    full_desc (str): Detailed description of the strategy
	    parameters (StrategyDataParameters): Parameters associated with the strategy
	    strategy_result (str): Result or outcome of the strategy
	"""

	strategy_id: str
	agent_id: str
	summarized_desc: str
	full_desc: str
	parameters: str | StrategyDataParameters
	strategy_result: str
	created_at: datetime | str


@dataclass
class StrategyInsertData:
	"""
	Data class for inserting a new strategy into the system.

	This class provides a structure for creating a new strategy with optional fields,
	allowing for partial strategy information to be provided during creation.

	Attributes:
	    summarized_desc (str | None): Brief description of the strategy
	    full_desc (str | None): Detailed description of the strategy
	    parameters (StrategyDataParameters | None): Parameters associated with the strategy
	    strategy_result (str | None): Result or outcome of the strategy
	"""

	summarized_desc: str | None = None
	full_desc: str | None = None
	parameters: StrategyDataParameters | None = None
	strategy_result: str | None = None
