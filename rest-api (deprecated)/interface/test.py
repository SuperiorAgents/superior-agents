from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "data_id", 
    "agent_id", 
    "what_date",
]


class TestParams(BaseModel):
    agent_id:  Optional[str] = Field(None)
    what_date: Optional[str] = Field(None)


class TestUpdateParams(BaseModel):
    agent_id:  Optional[str] = Field(None)
    what_date: Optional[str] = Field(None)
