import json
import logging
import os
import httpx

from datetime import datetime
from typing   import List, Optional, Dict, Any, Union
from models   import NotificationCreate, NotificationUpdate, NotificationResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationDatabaseManager:
    def __init__(self):
        """Initialize notification database manager."""
        base_url = os.getenv("API_DB_BASE_URL", "http://localhost:9020")
        api_key = os.getenv("API_DB_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.headers = {"x-api-key": api_key, "Content-Type": "application/json"}
        self.client = httpx.AsyncClient(headers=self.headers, timeout=30.0)
        # Cache for notifications to prevent duplicates
        self._notification_cache = {}

    async def create_notification(
        self,
        source: str,
        short_desc: str,
        long_desc: str,
        notification_date: str,
        relative_to_scraper_id: Optional[str] = None,
        bot_username: str = "",
    ) -> str:
        """
        Create a new notification.
        - NOTE: The API now uses a duplicate prevention mechanism on the server side.
        """
        url = f"{self.base_url}/api_v1/notification/create"

        try:
            payload = {
                "source": source,
                "short_desc": short_desc,
                "long_desc": long_desc,
                "notification_date": notification_date,
                "relative_to_scraper_id": relative_to_scraper_id,
                "bot_username": bot_username,
            }

            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success":
                notification_id = result.get("data", {}).get("notification_id")
                if notification_id:
                    logger.info(f"Created notification {notification_id}")
                    return notification_id
                raise ValueError("No notification ID in response")
            else:
                error_msg = f"Failed to create notification: {result.get('msg', 'Unknown error')}"
                logger.error(error_msg)
                raise Exception(error_msg)

        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            raise

    async def create_notifications_batch(
        self, notifications: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Create multiple notifications in a single batch request.

        Args:
            notifications: List of notification dictionaries with the following keys:
                - source
                - short_desc
                - long_desc
                - notification_date
                - relative_to_scraper_id (optional)
                - bot_username (optional)

        Returns:
            List of created notification IDs
        """
        url = f"{self.base_url}/api_v1/notification/create_batch"

        try:
            # Convert each dictionary to a NotificationCreate object to ensure proper formatting
            notification_objects = []
            for notification in notifications:
                # Create a clean dictionary with only the expected fields
                clean_notification = {
                    "source": notification["source"],
                    "short_desc": notification["short_desc"],
                    "long_desc": notification["long_desc"],
                    "notification_date": notification["notification_date"],
                }

                # Add optional fields if they exist
                if (
                    "relative_to_scraper_id" in notification
                    and notification["relative_to_scraper_id"]
                ):
                    clean_notification["relative_to_scraper_id"] = notification[
                        "relative_to_scraper_id"
                    ]

                if "bot_username" in notification and notification["bot_username"]:
                    clean_notification["bot_username"] = notification["bot_username"]

                notification_objects.append(clean_notification)

            payload = {"notifications": notification_objects}

            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success":
                notification_ids = result.get("data", {}).get("notification_ids", [])
                if notification_ids:
                    logger.info(
                        f"Created {len(notification_ids)} notifications in batch"
                    )
                    return notification_ids
                raise ValueError("No notification IDs in response")
            else:
                error_msg = f"Failed to create notifications batch: {result.get('msg', 'Unknown error')}"
                logger.error(error_msg)
                raise Exception(error_msg)

        except Exception as e:
            logger.error(f"Error creating notifications batch: {str(e)}")
            raise

    async def update_notification(
        self, notification: Union[NotificationUpdate, Dict[str, Any]]
    ) -> bool:
        """
        Update an existing notification.

        Args:
            notification: Either a NotificationUpdate object or a dictionary with notification data
                Must include notification_id
        """
        url = f"{self.base_url}/api_v1/notification/update"

        try:
            if isinstance(notification, NotificationUpdate):
                payload = {
                    "notification_id": str(notification.id),
                    "source": notification.source,
                    "short_desc": notification.short_desc,
                    "long_desc": notification.long_desc,
                    "notification_date": notification.notification_date,
                    "bot_username": notification.bot_username,
                    "relative_to_scraper_id": notification.relative_to_scraper_id,
                }
            else:
                # Ensure notification_id is present
                if "notification_id" not in notification and "id" in notification:
                    notification["notification_id"] = notification["id"]
                payload = notification

            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            result = response.json()
            success = result.get("status") == "success"
            if success:
                logger.info(f"Updated notification {payload.get('notification_id')}")
            else:
                logger.error(
                    f"Failed to update notification: {result.get('msg', 'Unknown error')}"
                )
            return success

        except Exception as e:
            logger.error(f"Error updating notification: {str(e)}")
            raise

    async def get_notification(
        self, notification_id: str
    ) -> Optional[NotificationResponse]:
        """Get a specific notification by its notification_id."""
        url = f"{self.base_url}/api_v1/notification/get"

        try:
            payload = {"notification_id": str(notification_id)}
            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success" and "data" in result:
                # The API now returns data directly instead of notification
                notification_data = result["data"]
                notification = NotificationResponse(**notification_data)
                logger.info(f"Retrieved notification {notification_id}")
                return notification
            else:
                logger.warning(f"Notification {notification_id} not found")
                return None

        except Exception as e:
            logger.error(f"Error getting notification: {str(e)}")
            raise

    async def get_all_notifications(self) -> List[NotificationResponse]:
        """Get all notifications."""
        url = f"{self.base_url}/api_v1/notification/get"

        try:
            response = await self.client.post(url, json={})
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success" and "data" in result:
                notifications = [NotificationResponse(**n) for n in result["data"]]
                logger.info(f"Retrieved {len(notifications)} notifications")
                return notifications
            return []

        except Exception as e:
            logger.error(f"Error getting all notifications: {str(e)}")
            raise

    async def get_notifications_by_filter(
        self, filter_params: Dict[str, Any]
    ) -> List[NotificationResponse]:
        """
        Get notifications by filter parameters.

        Args:
            filter_params: Dictionary of filter parameters to apply
        """
        url = f"{self.base_url}/api_v1/notification/get"

        try:
            response = await self.client.post(url, json=filter_params)
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success" and "data" in result:
                notifications = [NotificationResponse(**n) for n in result["data"]]
                logger.info(f"Retrieved {len(notifications)} notifications with filter")
                return notifications
            return []

        except Exception as e:
            logger.error(f"Error getting notifications by filter: {str(e)}")
            raise

    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()

    async def get_notifications_by_scraper_id(
        self, source_prefix: str, relative_to_scraper_id: str
    ) -> List[NotificationResponse]:
        """Get notifications by their relative_to_scraper_id and source prefix."""
        url = f"{self.base_url}/api_v1/notification/get"

        try:
            payload = {"relative_to_scraper_id": str(relative_to_scraper_id)}
            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            result = response.json()
            if result.get("status") == "success" and "data" in result:
                notifications = [NotificationResponse(**n) for n in result["data"]]
                logger.info(
                    f"Retrieved {len(notifications)} notifications for scraper ID {relative_to_scraper_id}"
                )
                return notifications
            return []

        except Exception as e:
            logger.error(f"Error getting notifications by scraper ID: {str(e)}")
            raise

    async def check_scraper_id_exists(
        self, source_prefix: str, relative_to_scraper_id: str
    ) -> bool:
        """Check if a notification with the given scraper ID exists."""
        try:
            notifications = await self.get_notifications_by_scraper_id(
                source_prefix, relative_to_scraper_id
            )
            return len(notifications) > 0
        except Exception as e:
            logger.error(f"Error checking scraper ID existence: {str(e)}")
            return False


# Example usage
if __name__ == "__main__":
    import asyncio

    async def main():
        manager = NotificationDatabaseManager()
        try:
            # Create a notification
            notification_id = await manager.create_notification(
                source="test_manager",
                short_desc="Test from manager",
                long_desc="This is a test notification from the manager",
                notification_date=datetime.utcnow().isoformat(),
                bot_username="test_bot",
            )
            print(f"Created notification with ID: {notification_id}")

            # Get the created notification
            created = await manager.get_notification(notification_id)
            print(f"Retrieved notification: {created}")

            # Update the notification
            update = NotificationUpdate(
                id=notification_id,
                source="test_manager_updated",
                short_desc="Updated from manager",
                long_desc="This notification has been updated by the manager",
                notification_date=datetime.utcnow().isoformat(),
                bot_username="test_bot",
            )
            success = await manager.update_notification(update)
            print(f"Update {'succeeded' if success else 'failed'}")

            # Create batch notifications
            batch_notifications = [
                {
                    "source": "test_batch",
                    "short_desc": f"Batch test {i}",
                    "long_desc": f"This is a batch test notification {i}",
                    "notification_date": datetime.utcnow().isoformat(),
                    "bot_username": "test_bot",
                }
                for i in range(3)
            ]
            batch_ids = await manager.create_notifications_batch(batch_notifications)
            print(f"Created batch notifications with IDs: {batch_ids}")

            # Get all notifications
            all_notifications = await manager.get_all_notifications()
            print(f"Total notifications: {len(all_notifications)}")

        except Exception as e:
            print(f"Error in example: {str(e)}")
        finally:
            await manager.close()

    asyncio.run(main())

