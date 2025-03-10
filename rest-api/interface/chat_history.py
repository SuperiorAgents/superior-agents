from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id", 
    "history_id", 
    "session_id", 
    "message_type", 
    "content", 
    "timestamp",
]


class ChatHistoryParams(BaseModel):
    session_id:   Optional[str] = Field(None)
    message_type: Optional[str] = Field(None)
    content:      Optional[str] = Field(None)
    timestamp:    Optional[str] = Field(None)


class ChatHistoryUpdateParams(BaseModel):
    history_id:   Optional[str] = Field(None)
    session_id:   Optional[str] = Field(None)
    message_type: Optional[str] = Field(None)
    content:      Optional[str] = Field(None)
    timestamp:    Optional[str] = Field(None)
