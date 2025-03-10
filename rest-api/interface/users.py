from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id", 
    "user_id", 
    "username", 
    "email", 
    "wallet_address",
]


class UserParams(BaseModel):
    username:       Optional[str] = Field(None)
    email:          Optional[str] = Field(None)
    wallet_address: Optional[str] = Field(None)


class UserUpdateParams(BaseModel):
    user_id:        Optional[str] = Field(None)
    username:       Optional[str] = Field(None)
    email:          Optional[str] = Field(None)
    wallet_address: Optional[str] = Field(None)
