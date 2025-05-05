from pydantic import BaseModel, Field
from typing   import Any, Dict, List, Optional, Union, Literal

RESULT_COLS = [
    "id",
    "notification_id",
    "bot_username",
    "relative_to_scraper_id",
    "source",
    "short_desc",
    "long_desc",
    "notification_date",
    "created",
]


class NotificationsParams(BaseModel):
    bot_username:           Optional[str] = Field(None)
    relative_to_scraper_id: Optional[str] = Field(None)
    source:                 Optional[str] = Field(None)
    short_desc:             Optional[str] = Field(None)
    long_desc:              Optional[str] = Field(None)
    notification_date:      Optional[str] = Field(None)


class NotificationsUpdateParams(BaseModel):
    bot_username:           Optional[str] = Field(None)
    notification_id:        Optional[str] = Field(None)
    relative_to_scraper_id: Optional[str] = Field(None)
    source:                 Optional[str] = Field(None)
    short_desc:             Optional[str] = Field(None)
    long_desc:              Optional[str] = Field(None)
    notification_date:      Optional[str] = Field(None)


class NotificationsUpdateParamsv2(BaseModel):
    bot_username:           Optional[str]       = Field(None)
    notification_id:        Optional[str]       = Field(None)
    relative_to_scraper_id: Optional[str]       = Field(None)
    source:                 Optional[str]       = Field(None)
    short_desc:             Optional[str]       = Field(None)
    long_desc:              Optional[str]       = Field(None)
    notification_date:      Optional[str]       = Field(None)
    sources:                Optional[List[str]] = Field(None)
    limit:                  Optional[int]       = 800


class NotificationsUpdateParamsv3(BaseModel):
    sources: Optional[List[str]] = Field(None)
    limit:   Optional[int]       = 800


class NotificationsBatchParams(BaseModel):
    notifications: List[NotificationsParams] = Field(...)

