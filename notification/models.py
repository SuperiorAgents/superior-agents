from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class NotificationCreate(BaseModel):
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    relative_to_scraper_id: Optional[str] = None

class NotificationBatchCreate(BaseModel):
    notifications: List[NotificationCreate]

class NotificationUpdate(BaseModel):
    id: str
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    relative_to_scraper_id: Optional[str] = None

class NotificationGet(BaseModel):
    id: Optional[int] = None

class NotificationResponse(BaseModel):
    id: int
    notification_id: Optional[str] = None
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    created: str
    relative_to_scraper_id: Optional[str] = None 