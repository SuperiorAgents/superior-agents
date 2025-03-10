from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id",
    "snapshot_id",
    "agent_id",
    "total_value_usd",
    "assets",
    "snapshot_time",
]


class WalletSnapshotsParams(BaseModel):
    agent_id:        Optional[str] = Field(None)
    total_value_usd: Optional[float] = Field(None)
    assets:          Optional[str] = Field(None)


class WalletSnapshotsUpdateParams(BaseModel):
    snapshot_id:     Optional[str] = Field(None)
    agent_id:        Optional[str] = Field(None)
    total_value_usd: Optional[float] = Field(None)
    assets:          Optional[str] = Field(None)
