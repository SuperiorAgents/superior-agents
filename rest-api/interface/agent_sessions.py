from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

# List of columns to be returned from database queries for agent sessions
# id:               Primary key of the session
# session_id:       Unique identifier for the session
# agent_id:         ID of the agent running the session
# started_at:       Timestamp when session started
# ended_at:         Timestamp when session ended (if ended)
# status:           Current status of session (running/stopped)
# fe_data:          Frontend-specific data
# trades_count:     Number of trades made in session
# cycle_count:      Number of cycles completed
# will_end_at:      Scheduled end time of session (for auto-termination)
# session_interval: Amount of time for the agent to wait for new cycle
RESULT_COLS = [
    "id",
    "session_id",
    "agent_id",
    "started_at",
    "ended_at",
    "status",
    "fe_data",
    "trades_count",
    "cycle_count",
    "will_end_at",
    "session_interval",
]


class AgentSessionsParams(BaseModel):
    session_id:   Optional[str] = Field(None)
    agent_id:     Optional[str] = Field(None)
    started_at:   Optional[str] = Field(None)
    ended_at:     Optional[str] = Field(None)
    status:       Optional[str] = Field(None)
    fe_data:      Optional[str] = Field(None)
    trades_count: Optional[str] = Field(None)
    cycle_count:  Optional[str] = Field(None)


class AgentSessionsUpdateParams(BaseModel):
    session_id:   Optional[str] = Field(None)
    agent_id:     Optional[str] = Field(None)
    started_at:   Optional[str] = Field(None)
    ended_at:     Optional[str] = Field(None)
    status:       Optional[str] = Field(None)
    fe_data:      Optional[str] = Field(None)
    trades_count: Optional[str] = Field(None)
    cycle_count:  Optional[str] = Field(None)
