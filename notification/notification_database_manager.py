import json
import logging
from datetime import datetime
import os
from typing import List, Optional, Dict, Any, Union
import sqlite3
import httpx
from models import NotificationCreate, NotificationUpdate, NotificationResponse
from dotenv import load_dotenv
import requests
from hashlib import sha256
import uuid

load_dotenv()
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationDatabaseManager:
    def __init__(self, db_path: str):
        """Initialize SQLite database connection and create tables if they don't exist.

        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize database tables and seed data from SQL files."""
        # Create tables
        with open("./00001_init.sql", "r") as f:
            init_script = f.read()

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.executescript(init_script)
            conn.commit()
    
    async def create_notification(self, source: str, short_desc: str, long_desc: str, notification_date: str, 
                                 relative_to_scraper_id: Optional[str] = None, bot_username: str = "") -> str:
        """
        Create a new notification in the database.

        Args:
            source (str): The source of the notification (e.g., 'twitter', 'rss')
            short_desc (str): A brief description of the notification
            long_desc (str): A detailed description of the notification
            notification_date (str): The date of the notification in ISO format
            relative_to_scraper_id (Optional[str]): ID relating to the scraper source (e.g., tweet ID)
            bot_username (str): Username of the bot that created the notification

        Returns:
            str: The ID of the created notification

        Raises:
            Exception: If the notification creation fails
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            notification_id = str(uuid.uuid4())
            payload = {
                "notification_id": notification_id,
                "source": source,
                "short_desc": short_desc,
                "long_desc": long_desc,
                "notification_date": notification_date,
                "relative_to_scraper_id": relative_to_scraper_id,
                "bot_username": bot_username
            }
            for_hashing : str = payload["short_desc"]
            for_hashing += payload["relative_to_scraper_id"]

            payload["unique_hash"] = sha256(for_hashing.encode('utf-8')).hexdigest()
            columns = ', '.join(payload.keys())
            values  = ', '.join(['?' for _ in payload.values()])

            try:
                # Check if the record exists with the same relative_to_scraper_id or long_desc
                if payload.get('unique_hash'):
                    check_query = "SELECT id FROM sup_notifications WHERE unique_hash = ?"
                    cursor.execute(check_query, [payload.get('unique_hash')])
                else:
                    check_query = "SELECT id FROM sup_notifications WHERE relative_to_scraper_id = ? OR long_desc = ?"
                    cursor.execute(check_query, [payload.get('relative_to_scraper_id'), payload.get('long_desc')])
                
                existing = cursor.fetchone()

                if not existing:
                    # Insert new record
                    query = f"INSERT INTO sup_notifications ({columns}) VALUES ({values})"
                    cursor.execute(query, list(payload.values()))
                
                return notification_id
            except Exception as e:
                raise

    
    async def create_notifications_batch(self, notifications: List[Dict[str, Any]]) -> List[str]:
        """
        Create multiple notifications in a single batch request.
        
        Args:
            notifications (List[Dict[str, Any]]): List of notification dictionaries with the following keys:
                - source: Source of the notification
                - short_desc: Brief description
                - long_desc: Detailed description
                - notification_date: Date in ISO format
                - relative_to_scraper_id (optional): ID relating to scraper
                - bot_username (optional): Bot username
                
        Returns:
            List[str]: List of created notification IDs

        Raises:
            Exception: If the batch creation fails
        """
        notification_ids = []
        for notification in notifications:
            # Call the single insert function for each notification
            notification_id = await self.create_notification(
                notification['source'],
                notification["short_desc"],
                notification["long_desc"],
                notification["notification_date"],
                notification["relative_to_scraper_id"],
                notification["bot_username"]
            )
            notification_ids.append(notification_id)
        return notification_ids
          
    async def close(self):
        """
        Close the HTTP client connection.
        Should be called when the database manager is no longer needed.
        """
        if self.client:
            await self.client.aclose()

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
                bot_username="test_bot"
            )
            print(f"Created notification with ID: {notification_id}")
                        
            # Create batch notifications
            batch_notifications = [
                {
                    "source": "test_batch",
                    "short_desc": f"Batch test {i}",
                    "long_desc": f"This is a batch test notification {i}",
                    "notification_date": datetime.utcnow().isoformat(),
                    "bot_username": "test_bot"
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