from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id",
    "strategy_id",
    "agent_id",
    "summarized_desc",
    "full_desc",
    "strategy_result",
    "parameters",
    "created_at",
]


class StrategyParams(BaseModel):
    agent_id:        Optional[str] = Field(None)
    summarized_desc: Optional[str] = Field(None)
    full_desc:       Optional[str] = Field(None)
    parameters:      Optional[str] = Field(None)
    strategy_result: Optional[str] = Field(None)


class StrategyUpdateParams(BaseModel):
    strategy_id:     Optional[str] = Field(None)
    agent_id:        Optional[str] = Field(None)
    summarized_desc: Optional[str] = Field(None)
    full_desc:       Optional[str] = Field(None)
    parameters:      Optional[str] = Field(None)
    strategy_result: Optional[str] = Field(None)

