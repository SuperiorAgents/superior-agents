from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = ['id','session_id','agent_id','started_at','ended_at','status']

class AgentSessionsParams(BaseModel):
    session_id: Optional[str] = Field(None)
    agent_id: Optional[str] = Field(None)
    started_at: Optional[str] = Field(None)
    ended_at: Optional[str] = Field(None)
    status: Optional[str] = Field(None)

class AgentSessionsUpdateParams(BaseModel):
    session_id: Optional[str] = Field(None)
    agent_id: Optional[str] = Field(None)
    started_at: Optional[str] = Field(None)
    ended_at: Optional[str] = Field(None)
    status: Optional[str] = Field(None)