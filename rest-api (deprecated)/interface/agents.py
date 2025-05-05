from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id",
    "agent_id",
    "user_id",
    "name",
    "configuration",
    "created_at",
    "updated_at",
]


class AgentParams(BaseModel):
    user_id:       Optional[str] = Field(None)
    name:          Optional[str] = Field(None)
    configuration: Optional[str] = Field(None)


class AgentUpdateParams(BaseModel):
    agent_id:      Optional[str] = Field(None)
    user_id:       Optional[str] = Field(None)
    name:          Optional[str] = Field(None)
    configuration: Optional[str] = Field(None)
