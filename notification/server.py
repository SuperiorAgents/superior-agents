import os
import asyncio
import logging

from dotenv                        import load_dotenv
from typing                        import List, Optional, Dict
from fastapi                       import FastAPI, HTTPException, Header, Request
from datetime                      import datetime
from fastapi.middleware.cors       import CORSMiddleware
from notification_database_manager import NotificationDatabaseManager

from models import (
    NotificationCreate,
    NotificationUpdate,
    NotificationGet,
    NotificationResponse,
    NotificationBatchCreate,
)

from scrapers import (
    TwitterMentionsScraper,
    TwitterFeedScraper,
    CoinMarketCapScraper,
    CoinGeckoScraper,
    RedditScraper,
    ScraperManager,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


# Validate required environment variables
def get_env_var(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise ValueError(f"Missing required environment variable: {var_name}")
    return value


# Initialize FastAPI app
app = FastAPI(title="Notification Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
notification_manager = NotificationDatabaseManager()
scraper_manager = ScraperManager(notification_manager)

# Initialize scrapers based on available credentials
try:
    # Get Twitter credentials
    twitter_creds = {
        "api_key": get_env_var("TWITTER_API_KEY"),
        "api_secret": get_env_var("TWITTER_API_SECRET"),
        "access_token": get_env_var("TWITTER_ACCESS_TOKEN"),
        "access_token_secret": get_env_var("TWITTER_ACCESS_TOKEN_SECRET"),
        "bot_username": get_env_var("TWITTER_BOT_USERNAME"),
    }

    # Initialize Twitter scrapers
    twitter_mentions_scraper = TwitterMentionsScraper(**twitter_creds)
    twitter_feed_scraper = TwitterFeedScraper(**twitter_creds)

    # Add Twitter scrapers to manager
    scraper_manager.add_scraper(twitter_mentions_scraper)
    scraper_manager.add_scraper(twitter_feed_scraper)
    logger.info("Twitter scrapers initialized successfully")

except ValueError as e:
    logger.warning(f"Twitter scrapers not initialized: {str(e)}")
except Exception as e:
    logger.error(f"Error initializing Twitter scrapers: {str(e)}")

# Initialize CoinMarketCap scraper
try:
    coinmarketcap_scraper = CoinMarketCapScraper()
    scraper_manager.add_scraper(coinmarketcap_scraper)
    logger.info("CoinMarketCap scraper initialized successfully")
except Exception as e:
    logger.error(f"Error initializing CoinMarketCap scraper: {str(e)}")

# Initialize CoinGecko scraper
try:
    tracked_currencies = [
        "bitcoin",
        "ethereum",
        "binancecoin",
        "ripple",
        "cardano",
        "solana",
        "polkadot",
        "dogecoin",
    ]
    coingecko_scraper = CoinGeckoScraper(
        tracked_currencies=tracked_currencies,
        price_change_threshold=float(os.getenv("PRICE_CHANGE_THRESHOLD", "5.0")),
    )
    scraper_manager.add_scraper(coingecko_scraper)
    logger.info("CoinGecko scraper initialized successfully")
except Exception as e:
    logger.error(f"Error initializing CoinGecko scraper: {str(e)}")

# Initialize Reddit scraper
try:
    reddit_scraper = RedditScraper(
        client_id=get_env_var("REDDIT_CLIENT_ID"),
        client_secret=get_env_var("REDDIT_CLIENT_SECRET"),
        user_agent="SuperiorAgentsBot/1.0",
        subreddits=["cryptocurrency", "bitcoin", "ethereum", "CryptoMarkets"],
    )
    scraper_manager.add_scraper(reddit_scraper)
    logger.info("Reddit scraper initialized successfully")
except ValueError as e:
    logger.warning(f"Reddit scraper not initialized: {str(e)}")
except Exception as e:
    logger.error(f"Error initializing Reddit scraper: {str(e)}")

# API key for authentication
API_DB_API_KEY = os.getenv("API_DB_API_KEY")


async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_DB_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key


@app.on_event("startup")
async def startup_event():
    """Start the periodic scraping on server startup."""
    # Start periodic scraping in the background (every hour)
    asyncio.create_task(scraper_manager.start_periodic_scraping())


@app.post("/api_v1/notification/create")
async def create_notification(
    notification: NotificationCreate, x_api_key: str = Header(...)
):
    """Create a new notification."""
    await verify_api_key(x_api_key)

    try:
        notification_id = await notification_manager.create_notification(
            source=notification.source,
            short_desc=notification.short_desc,
            long_desc=notification.long_desc,
            notification_date=notification.notification_date,
            relative_to_scraper_id=notification.relative_to_scraper_id,
            bot_username=notification.bot_username,
        )
        return {"status": "success", "data": {"notification_id": notification_id}}
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.post("/api_v1/notification/update")
async def update_notification(
    notification: NotificationUpdate, x_api_key: str = Header(...)
):
    """Update an existing notification."""
    await verify_api_key(x_api_key)

    try:
        success = await notification_manager.update_notification(notification)
        if not success:
            return {"status": "error", "msg": "Notification not found"}

        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating notification: {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.post("/api_v1/notification/get")
async def get_notification(request: NotificationGet, x_api_key: str = Header(...)):
    """Get notification(s)."""
    await verify_api_key(x_api_key)

    try:
        # If ID is provided, get specific notification
        if request.id:
            notification = await notification_manager.get_notification(request.id)
            if not notification:
                return {"status": "error", "msg": "Notification not found"}
            return {"status": "success", "data": notification}

        # If no ID provided, get all notifications
        notifications = await notification_manager.get_all_notifications()
        return {"status": "success", "data": notifications}

    except Exception as e:
        logger.error(f"Error getting notification(s): {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.get("/notifications/{agent_type}/pending")
async def get_pending_notifications(agent_type: str):
    """Get pending notifications for a specific agent type."""
    try:
        # For now, just return all notifications
        notifications = await notification_manager.get_all_notifications()
        return {"notifications": notifications}
    except Exception as e:
        logger.error(f"Error getting pending notifications: {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.post("/notifications/{notification_id}/processed")
async def mark_notification_processed(
    notification_id: str, result: Optional[dict] = None
):
    """Mark a notification as processed."""
    try:
        # Update the notification with processed status
        success = await notification_manager.update_notification(
            {
                "notification_id": notification_id,
                "processed": True,
                "processed_at": datetime.utcnow().isoformat(),
                "result": result,
            }
        )
        if success:
            return {"status": "success"}
        else:
            return {
                "status": "error",
                "msg": "Notification not found or could not be updated",
            }
    except Exception as e:
        logger.error(f"Error marking notification as processed: {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.get("/notifications/{notification_id}/status")
async def get_notification_status(notification_id: str):
    """Get the status of a specific notification."""
    try:
        notification = await notification_manager.get_notification(notification_id)
        if notification:
            return {
                "status": "success",
                "data": {
                    "notification_id": notification_id,
                    "processed": getattr(notification, "processed", False),
                    "processed_at": getattr(notification, "processed_at", None),
                    "created_at": notification.created,
                },
            }
        else:
            return {"status": "error", "msg": "Notification not found"}
    except Exception as e:
        logger.error(f"Error getting notification status: {str(e)}")
        return {"status": "error", "msg": str(e)}


@app.post("/api_v1/notification/create_batch")
async def create_notifications_batch(
    batch: NotificationBatchCreate, x_api_key: str = Header(...)
):
    """
    Create multiple notifications in a single batch request.

    Args:
        batch: Batch of notifications to create
    """
    await verify_api_key(x_api_key)

    try:
        # Convert Pydantic models to dictionaries
        notifications = [notification.dict() for notification in batch.notifications]

        notification_ids = await notification_manager.create_notifications_batch(
            notifications
        )
        return {"status": "success", "data": {"notification_ids": notification_ids}}
    except Exception as e:
        logger.error(f"Error creating notifications batch: {str(e)}")
        return {"status": "error", "msg": str(e)}


# Scraper control endpoints
@app.post("/scrapers/run")
async def trigger_scraping(x_api_key: str = Header(...)):
    """Manually trigger a scraping cycle."""
    await verify_api_key(x_api_key)

    try:
        await scraper_manager.run_scraping_cycle()
        return {"status": "success", "message": "Scraping cycle completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

