#!/usr/bin/env python3
import asyncio
import logging
import sys
import os
import signal
import time
import subprocess

from datetime import datetime
from pathlib  import Path
from typing   import Optional
from crontab  import CronTab

from scrapers import (
    ScraperManager,
    TwitterMentionsScraper,
    TwitterFeedScraper,
    CoinMarketCapScraper,
    CoinGeckoScraper,
    RedditScraper,
    RSSFeedScraper,
)

from vault_service                 import VaultService
from notification_database_manager import NotificationDatabaseManager
from dotenv                        import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
log_dir = Path(__file__).parent / "logs"
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(
            log_dir / f"cron_worker_{datetime.now().strftime('%Y%m%d')}.log"
        ),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def handle_shutdown(signum, frame):
    """
    Handle shutdown signals (SIGTERM, SIGINT).
    Performs cleanup and exits gracefully.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    logger.info("Received shutdown signal, cleaning up...")
    sys.exit(0)


def is_process_running() -> bool:
    """
    Check if another instance of the cron worker is running.

    Returns:
        bool: True if another instance is running, False otherwise
    """
    scraper_type: str = os.getenv("SCRAPER", "all")
    try:
        # Build search pattern
        pattern = f"./cron_worker.py"
        
        # Run pgrep command
        result = subprocess.run(
            ["pgrep", "-f", pattern],
            capture_output=True,
            text=True
        )
        
        # Check results
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            valid_pids = []
            for pid in pids:
                try:
                    pid_int = int(pid)
                    # Verify it's not our own process
                    if pid_int != os.getpid():
                        valid_pids.append(pid_int)
                except ValueError:
                    continue
            
            if valid_pids:
                logger.warning(f"Found existing processes for {scraper_type}: {valid_pids}")
                return True
        return False
        
    except Exception as e:
        logger.error(f"Error checking running processes: {str(e)}")
        return False

class CronManager:
    def __init__(self, notification_dir: str):
        """
        Initialize cron manager.

        Args:
            notification_dir (str): Directory containing notification service files
        """
        self.notification_dir = notification_dir
        self.cron = CronTab(user=True)
        self.venv_python = str(Path(notification_dir) / "venv" / "bin" / "python")

    def _create_job(self, name: str, interval: int, scraper: str) -> None:
        """
        Create a single long-running daemon job.

        Args:
            name (str): Name of the cron job
            interval (int): Interval in seconds between job runs
            scraper (str): Type of scraper to run
        """
        self.cron.remove_all(comment=f"notification_{name}")
        
        job = self.cron.new(
            command=f"cd {self.notification_dir} && SCRAPER={scraper} {self.venv_python} ./cron_worker.py",
            comment=f"notification_{name}"
        )
        job.every_reboot()

    def setup_jobs(self, intervals: dict) -> None:
        """
        Setup all cron jobs with specified intervals.

        Args:
            intervals (dict): Dictionary mapping scraper types to their intervals
        """
        # Verify virtual environment exists
        if not os.path.isfile(self.venv_python):
            raise FileNotFoundError(
                f"Virtual environment Python not found at {self.venv_python}. "
                "Please create and activate the virtual environment first."
            )

        # Setup scraper jobs
        self._create_job("twitter", intervals["twitter"], "twitter")
        self._create_job("coingecko", intervals["coingecko"], "coingecko")
        self._create_job("coinmarketcap", intervals["cmc"], "coinmarketcap")
        self._create_job("reddit", intervals["reddit"], "reddit")
        self._create_job("rss", intervals["rss"], "rss")

        # Setup log rotation job
        self.cron.remove_all(comment="notification_log_rotation")
        log_job = self.cron.new(
            command=f'find {self.notification_dir}/logs -name "cron_worker_*.log" -mtime +7 -delete',
            comment="notification_log_rotation",
        )
        log_job.every().day()

        # Add PID cleanup job
        self.cron.remove_all(comment="notification_pid_cleanup")
        pid_cleanup_job = self.cron.new(
            command=f'find {PID_DIR} -name "*.pid" -mtime +1 -delete',
            comment="notification_pid_cleanup",
        )
        pid_cleanup_job.every().day()

        # Write to crontab
        self.cron.write()

    def remove_all_jobs(self) -> None:
        """Remove all notification-related cron jobs."""
        self.cron.remove_all(comment=lambda c: c and c.startswith("notification_"))
        self.cron.write()

    def list_jobs(self) -> None:
        """List all notification-related cron jobs."""
        for job in self.cron:
            if job.comment and job.comment.startswith("notification_"):
                print(f"{job.comment}:")
                print(f"  Schedule: {job.slices}")
                print(f"  Command: {job.command}")
                print()


class CronNotificationWorker:
    def __init__(self, env_path: str = ".env"):
        """
        Initialize cron notification worker.

        Args:
            env_path (str): Path to environment file (default: ".env")
        """
        # Initialize components
        load_dotenv(dotenv_path=env_path)
        self.notification_manager = NotificationDatabaseManager()
        self.scraper_manager = ScraperManager(self.notification_manager)

        # Initialize vault service for credentials
        self.vault = VaultService()
        self.secrets = self.vault.get_all_secrets()

    @staticmethod
    def setup_cron_jobs(notification_dir: str) -> None:
        """Setup cron jobs for all scrapers."""
        try:
            # Load environment variables
            env_path = os.path.join(notification_dir, ".env")
            load_dotenv(env_path)

            # Get intervals from environment
            intervals = {
                "twitter": int(os.getenv("TWITTER_SCRAPING_INTERVAL", "60")),
                "coingecko": int(os.getenv("COINGECKO_SCRAPING_INTERVAL", "60")),
                "cmc": int(os.getenv("CMC_SCRAPING_INTERVAL", "60")),
                "reddit": int(os.getenv("REDDIT_SCRAPING_INTERVAL", "60")),
                "rss": int(os.getenv("RSS_SCRAPING_INTERVAL", "60")),
            }

            # Setup cron jobs
            cron_manager = CronManager(notification_dir)
            cron_manager.setup_jobs(intervals)

            logger.info("Cron jobs setup successfully")
            logger.info("Current cron jobs:")
            cron_manager.list_jobs()

        except Exception as e:
            logger.error(f"Error setting up cron jobs: {str(e)}")
            raise

    async def initialize_scrapers(self):
        """Initialize all scrapers with appropriate credentials."""
        try:
            # Get the specific scraper to run from environment variable
            target_scraper = os.getenv("SCRAPER", "all").lower()
            logger.info(f"Initializing scraper(s): {target_scraper}")

            # Get bot username from environment
            bot_username = os.getenv("TWITTER_BOT_USERNAME", "Superior_Agents")

            # Initialize Twitter scrapers if requested
            if target_scraper in ["all", "twitter"]:
                twitter_creds = {
                    "api_key": os.getenv("TWITTER_API_KEY"),
                    "api_secret": os.getenv("TWITTER_API_SECRET"),
                    "access_token": os.getenv("TWITTER_ACCESS_TOKEN"),
                    "access_token_secret": os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
                    "bot_username": bot_username,
                }

                if all(twitter_creds.values()):
                    mentions_scraper = TwitterMentionsScraper(
                        bot_username=twitter_creds["bot_username"]
                    )
                    feed_scraper = TwitterFeedScraper(
                        bot_username=twitter_creds["bot_username"]
                    )
                    self.scraper_manager.add_scraper(mentions_scraper)
                    self.scraper_manager.add_scraper(feed_scraper)
                    logger.info("Twitter scrapers initialized")
                else:
                    logger.warning(
                        "Twitter credentials not complete, skipping Twitter scrapers"
                    )

            # Initialize CoinGecko scraper if requested
            if target_scraper in ["all", "coingecko"]:
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
                    price_change_threshold=float(
                        os.getenv("PRICE_CHANGE_THRESHOLD", "5.0")
                    ),
                    bot_username="",
                )
                self.scraper_manager.add_scraper(coingecko_scraper)
                logger.info("CoinGecko scraper initialized")

            # Initialize CoinMarketCap scraper if requested
            if target_scraper in ["all", "coinmarketcap"]:
                cmc_scraper = CoinMarketCapScraper(bot_username="")
                self.scraper_manager.add_scraper(cmc_scraper)
                logger.info("CoinMarketCap scraper initialized")

            # Initialize Reddit scraper if requested
            if target_scraper in ["all", "reddit"]:
                reddit_creds = {
                    "client_id": os.getenv("REDDIT_CLIENT_ID"),
                    "client_secret": os.getenv("REDDIT_CLIENT_SECRET"),
                }

                if all(reddit_creds.values()):
                    reddit_scraper = RedditScraper(
                        client_id=reddit_creds["client_id"],
                        client_secret=reddit_creds["client_secret"],
                        user_agent="SuperiorAgentsBot/1.0",
                        subreddits=[
                            "cryptocurrency",
                            "bitcoin",
                            "ethereum",
                            "CryptoMarkets",
                        ],
                        bot_username="",
                    )
                    self.scraper_manager.add_scraper(reddit_scraper)
                    logger.info("Reddit scraper initialized")
                else:
                    logger.warning(
                        "Reddit credentials not complete, skipping Reddit scraper"
                    )

            # Initialize RSS Feed scrapers if requested
            if target_scraper in ["all", "rss"]:
                # Get topic filter from environment
                target_topic = os.getenv("TOPIC", "all").lower()

                # Define the RSS feeds to scrape
                rss_feeds = {
                    "crypto": {
                        "bitcoin_magazine": "https://bitcoinmagazine.com/feed",
                        "cointelegraph": "https://cointelegraph.com/rss",
                        "coindesk": "https://www.coindesk.com/arc/outboundfeeds/rss"
                    },
                    "politics": {
                        "nytimes_politics": "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
                        "washingtontimes": "https://www.washingtontimes.com/rss/headlines/news/politics/",
                        "politico": "https://rss.politico.com/politics-news.xml"
                    },
                    "technology": {
                        "techcrunch": "https://techcrunch.com/feed/",
                        "wired": "https://www.wired.com/feed/rss",
                        "theverge": "https://www.theverge.com/rss/index.xml",
                        "zdnet": "https://www.zdnet.com/news/rss.xml",
                        "engadget": "https://www.engadget.com/rss.xml"
                    },
                    "health": {
                        "who_news": "https://www.who.int/rss-feeds/news-english.xml",
                        "healthline": "https://www.healthline.com/rss/health-news"
                    },
                    "science": {
                        "nature": "https://www.nature.com/nature.rss",
                        "science_daily": "https://www.sciencedaily.com/rss/all.xml",
                        "scientific_american": "https://www.scientificamerican.com/platform/syndication/rss/",
                        "space": "https://www.space.com/feeds/all",
                        "phys_org": "https://phys.org/rss-feed/"
                    },
                    "animals": {
                        "live_science": "https://www.livescience.com/feeds/all",
                        "zookeeper": "https://zookeeper.com/feed/"
                    },
                    "entertainment": {
                        "variety": "https://variety.com/feed/",
                        "hollywood_reporter": "https://www.hollywoodreporter.com/feed/",
                        "deadline": "https://deadline.com/feed/",
                        "rolling_stone": "https://www.rollingstone.com/feed/"
                    },
                    "sports": {
                        "espn": "https://www.espn.com/espn/rss/news",
                        "bbc_sport": "http://feeds.bbci.co.uk/sport/rss.xml",
                        "cbs_sports": "https://www.cbssports.com/rss/headlines/",
                        "yahoo_sports": "https://sports.yahoo.com/rss/"
                    },
                    "business": {
                        "wsj_business": "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
                        "bloomberg": "https://feeds.bloomberg.com/business/news.rss"
                    },
                    "world_news": {
                        "cnn_world": "http://rss.cnn.com/rss/edition_world.rss",
                        "bbc_world": "http://feeds.bbci.co.uk/news/world/rss.xml"
                    }
                }
                
                # Initialize scrapers based on topic
                if target_topic == "all":
                    # Create scrapers for each topic
                    for topic, feeds in rss_feeds.items():
                        topic_scraper = RSSFeedScraper(
                            feed_urls=feeds,
                            bot_username="",
                            news_type=topic
                        )
                        self.scraper_manager.add_scraper(topic_scraper)
                        logger.info(f"{topic.title()} RSS Feed scraper initialized")
                else:
                    # Initialize only the requested topic
                    if target_topic in rss_feeds:
                        scraper = RSSFeedScraper(
                            feed_urls=rss_feeds[target_topic],
                            bot_username="",
                            news_type=target_topic
                        )
                        self.scraper_manager.add_scraper(scraper)
                        logger.info(f"{target_topic.title()} RSS Feed scraper initialized")
                    
        except Exception as e:
            logger.error(f"Error initializing scrapers: {str(e)}")
            raise

    async def run_single_cycle(self):
        """Run a single scraping cycle."""
        try:
            logger.info("Initializing scrapers...")
            await self.initialize_scrapers()

            logger.info("Starting scraping cycle...")
            await self.scraper_manager.run_scraping_cycle()
            logger.info("Scraping cycle completed successfully")

        except Exception as e:
            logger.error(f"Error in scraping cycle: {str(e)}")
            raise
        finally:
            # Cleanup any remaining tasks
            tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
            for task in tasks:
                task.cancel()
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

            # Close notification manager
            try:
                await self.notification_manager.close()
            except Exception as e:
                logger.error(f"Error closing notification manager: {str(e)}")

            # Close scraper clients
            for scraper in self.scraper_manager.scrapers:
                if hasattr(scraper, "client") and hasattr(scraper.client, "aclose"):
                    try:
                        await scraper.client.aclose()
                    except Exception as e:
                        logger.error(
                            f"Error closing client for {scraper.__class__.__name__}: {str(e)}"
                        )

                if hasattr(scraper, "close"):
                    try:
                        await scraper.close()
                    except Exception as e:
                        logger.error(
                            f"Error closing {scraper.__class__.__name__}: {str(e)}"
                        )


async def run_forever():
    """
    Run as a single long-lived daemon process.
    
    Continuously runs scraping cycles at specified intervals.
    Handles shutdown signals and performs cleanup.
    """
    if not is_process_running():
        logger.error("Another instance is already running. Exiting.")
        return

    # Register signal handlers
    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)
    
    try:
        worker = CronNotificationWorker()
        while True:  # Single persistent worker
            start_time = datetime.now()
            logger.info(f"Starting scraping cycle at {start_time}")
            
            try:
                await worker.run_single_cycle()
            except Exception as e:
                logger.error(f"Error in scraping cycle: {str(e)}")
            
            end_time = datetime.now()
            duration = end_time - start_time
            logger.info(f"Cycle duration: {duration}")
            
            interval = int(os.getenv("ALL_SCRAPING_INTERVAL", "60"))
            logger.info(f"Sleeping {interval} minutes")
            await asyncio.sleep(interval * 60)
    finally:
        await worker.notification_manager.close()


def main():
    """Updated main with daemon as default"""
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--single-run",
        action="store_true",
        help="Run one scraping cycle and exit (for testing)",
    )
    args = parser.parse_args()

    try:
        if args.single_run:
            # Single run mode for testing
            logger.info("Running in single-run mode")
            worker = CronNotificationWorker()
            asyncio.run(worker.run_single_cycle())
        else:
            # Default to daemon mode
            logger.info("Starting in daemon mode")
            asyncio.run(run_forever())

    except KeyboardInterrupt:
        logger.info("Shutdown requested")
        sys.exit(0)

    print("Main function completed")


if __name__ == "__main__":
    # If INSTALL_CRON environment variable is set, setup cron jobs
    if os.getenv("INSTALL_CRON"):
        notification_dir = str(Path(__file__).parent)
        CronNotificationWorker.setup_cron_jobs(notification_dir)
    else:
        main()  # Run the continuous scraping process
