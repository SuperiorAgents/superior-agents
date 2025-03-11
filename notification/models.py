from datetime import datetime
from typing   import Optional, List
from pydantic import BaseModel


class NotificationCreate(BaseModel):
    """
    Model for creating a new notification.

    Attributes:
        source (str): Source of the notification (e.g., 'twitter', 'rss')
        short_desc (str): Brief description of the notification
        long_desc (str): Detailed description of the notification
        notification_date (str): Date of the notification in ISO format
        bot_username (Optional[str]): Username of the bot that created the notification
        relative_to_scraper_id (Optional[str]): ID relating to the scraper source (like tweet ID, RSS link, etc.)
    """
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    relative_to_scraper_id: Optional[str] = None

class NotificationBatchCreate(BaseModel):
    """
    Model for creating multiple notifications in a batch.

    Attributes:
        notifications (List[NotificationCreate]): List of notifications to create
    """
    notifications: List[NotificationCreate]

class NotificationUpdate(BaseModel):
    """
    Model for updating an existing notification.

    Attributes:
        id (str): ID of the notification to update
        source (str): Updated source of the notification
        short_desc (str): Updated brief description
        long_desc (str): Updated detailed description
        notification_date (str): Updated date in ISO format
        bot_username (Optional[str]): Updated bot username
        relative_to_scraper_id (Optional[str]): Updated scraper-specific ID (like tweet ID, RSS link, etc.)
    """
    id: str
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    relative_to_scraper_id: Optional[str] = None


class NotificationGet(BaseModel):
    """
    Model for retrieving a notification.

    Attributes:
        id (Optional[int]): ID of the notification to retrieve. If None, retrieves all notifications.
    """
    id: Optional[int] = None

class NotificationResponse(BaseModel):
    """
    Model for notification response data.

    Attributes:
        id (int): Internal database ID
        notification_id (Optional[str]): External notification ID
        source (str): Source of the notification
        short_desc (str): Brief description
        long_desc (str): Detailed description
        notification_date (str): Date in ISO format
        bot_username (Optional[str]): Bot username
        created (str): Creation timestamp
        relative_to_scraper_id (Optional[str]): Scraper-specific ID (like tweet ID, RSS link, etc.)
    """
    id: int
    notification_id: Optional[str] = None
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    bot_username: Optional[str] = None
    created: str
    relative_to_scraper_id: Optional[str] = None

