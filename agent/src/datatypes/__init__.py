from dataclasses import dataclass
from typing import Any, Dict

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


@dataclass
class NotificationData:
	notification_id: str
	source: str
	short_desc: str
	long_desc: str
	notification_date: str
	created: str
	

@dataclass
class StrategyData:
	strategy_id: str
	agent_id: str
	summarized_desc: str
	full_desc: str
	parameters: Dict[str, Any]
	strategy_result: str


@dataclass
class StrategyInsertData:
	summarized_desc: str | None = None
	full_desc: str | None = None
	parameters: Dict[str, Any] | None = None
	strategy_result: str | None = None
