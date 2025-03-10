from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = ["id",'notification_id','relative_to_scraper_id',"source","short_desc","long_desc","notification_date","created"]


class NotificationsParams(BaseModel):
    relative_to_scraper_id: Optional[str] = Field(None)
    source: Optional[str] = Field(None)
    short_desc: Optional[str] = Field(None)
    long_desc: Optional[str] = Field(None)
    notification_date: Optional[str] = Field(None)
    
    
class NotificationsUpdateParams(BaseModel):
    notification_id: Optional[str] = Field(None)
    relative_to_scraper_id: Optional[str] = Field(None)
    source: Optional[str] = Field(None)
    short_desc: Optional[str] = Field(None)
    long_desc: Optional[str] = Field(None)
    notification_date: Optional[str] = Field(None)