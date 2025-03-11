import asyncio
import logging
import json
import os
import re

import tweepy
import praw
import httpx
import feedparser

from abc         import ABC, abstractmethod
from datetime    import datetime
from typing      import Dict, List, Optional, Set
from bs4         import BeautifulSoup
from pycoingecko import CoinGeckoAPI
from pydantic    import BaseModel
from dotenv      import load_dotenv
from dateutil    import parser

from models                        import NotificationCreate
from twitter_service               import TwitterService, Tweet
from notification_database_manager import NotificationDatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScrapedNotification(BaseModel):
    source: str
    short_desc: str
    long_desc: str
    notification_date: str
    relative_to_scraper_id: Optional[str] = None

class BaseScraper(ABC):
    def __init__(self, bot_username: str = ""):
        self.last_check_time: Optional[datetime] = None
        self.notification_manager = None  # Will be set by ScraperManager
        self.bot_username = bot_username
    
    @abstractmethod
    def get_source_prefix(self) -> str:
        """Get the prefix used for the source field."""
        pass
    
    @abstractmethod
    async def scrape(self) -> List[ScrapedNotification]:
        """Scrape data from the source and return a list of scraped items."""
        pass

class TwitterMentionsScraper(BaseScraper):
    def __init__(self, bot_username: str):
        super().__init__(bot_username=bot_username)
        self.twitter_service = TwitterService(bot_username=bot_username)
        self.last_mention_id: Optional[str] = None
    
    def get_source_prefix(self) -> str:
        return "twitter_mentions"
        
    def _format_tweet_content(self, tweet: Tweet) -> str:
        """Format tweet content with additional context."""
        content_parts = []
        
        # Add main tweet content
        content_parts.append(f"Tweet: {tweet.text}")
        
        # Add trading signals if present
        trading_signals = self.twitter_service.extract_trading_signals(tweet)
        if trading_signals:
            content_parts.append("\nTrading Signals:")
            if 'sentiment' in trading_signals:
                content_parts.append(f"- Sentiment: {trading_signals['sentiment']}")
            for symbol, price in trading_signals.items():
                if symbol != 'sentiment':
                    content_parts.append(f"- {symbol}: ${price:,.2f}")
        
        # Add market events if present
        market_events = self.twitter_service.extract_market_events(tweet)
        if market_events:
            content_parts.append("\nMarket Events:")
            for event_type, details in market_events.items():
                content_parts.append(f"- {event_type.title()}: {', '.join(map(str, details))}")
        
        # Add media information
        if tweet.media_urls:
            content_parts.append("\nMedia:")
            for url in tweet.media_urls:
                content_parts.append(f"- {url}")
        
        # Add quoted tweet if present
        if tweet.quoted_tweet:
            content_parts.append(f"\nQuoted Tweet from @{tweet.quoted_tweet['user_screen_name']}:")
            content_parts.append(tweet.quoted_tweet['text'])
        
        return "\n".join(content_parts)
        
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            mentions = self.twitter_service.get_mentions(since_id=self.last_mention_id)
            
            if mentions:
                self.last_mention_id = mentions[0].id  # Update last seen mention ID
                
            for tweet in mentions:
                # Skip if we already have this tweet
                if await self.check_notification_exists(tweet.id):
                    continue
                    
                scraped_data.append(ScrapedNotification(
                    source="twitter_mentions",
                    short_desc=f"New mention from @{tweet.user_screen_name}",
                    long_desc=self._format_tweet_content(tweet),
                    notification_date=tweet.created_at.isoformat(),
                    relative_to_scraper_id=tweet.id
                ))
                
        except Exception as e:
            logger.error(f"Error scraping Twitter mentions: {str(e)}")
            
        return scraped_data

class TwitterFeedScraper(BaseScraper):
    def __init__(self, bot_username: str):
        super().__init__(bot_username=bot_username)
        self.twitter_service = TwitterService(bot_username=bot_username)
        self.last_tweet_id: Optional[str] = None
    
    def get_source_prefix(self) -> str:
        return "twitter_feed"
        
    def _format_tweet_content(self, tweet: Tweet) -> str:
        """Format tweet content with additional context."""
        content_parts = []
        # Add main tweet content
        content_parts.append(f"Tweet: {tweet.text}")

        # Add hashtags if present
        if tweet.hashtags:
            content_parts.append(f"\nHashtags: {', '.join(['#' + tag for tag in tweet.hashtags])}")
        # Add trading signals if present
        trading_signals = self.twitter_service.extract_trading_signals(tweet)
        if trading_signals:
            content_parts.append("\nTrading Signals:")
            if 'sentiment' in trading_signals:
                content_parts.append(f"- Sentiment: {trading_signals['sentiment']}")
            for symbol, price in trading_signals.items():
                if symbol != 'sentiment':
                    content_parts.append(f"- {symbol}: ${price:,.2f}")

        # Add market events if present
        market_events = self.twitter_service.extract_market_events(tweet)
        if market_events:
            content_parts.append("\nMarket Events:")
            for event_type, details in market_events.items():
                content_parts.append(f"- {event_type.title()}: {', '.join(map(str, details))}")

        # Add media information
        if tweet.media_urls:
            content_parts.append("\nMedia:")
            for url in tweet.media_urls:
                content_parts.append(f"- {url}")
        
        return "\n".join(content_parts)
        
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            tweets = self.twitter_service.get_own_timeline(count=10, since_id=self.last_tweet_id)
            
            if tweets:
                self.last_tweet_id = tweets[0].id  # Update last seen tweet ID
                
            for tweet in tweets:
                # Skip if we already have this tweet
                if await self.check_notification_exists(tweet.id):
                    continue
                    
                # Extract mentioned users for short description
                mentioned = [f"@{user}" for user in tweet.mentioned_users]
                mentioned_str = f" replying to {', '.join(mentioned)}" if mentioned else ""
                
                # Create notification
                scraped_data.append(ScrapedNotification(
                    source="twitter_feed",
                    short_desc=f"New tweet{mentioned_str}",
                    long_desc=self._format_tweet_content(tweet),
                    notification_date=tweet.created_at.isoformat(),
                    relative_to_scraper_id=tweet.id
                ))
                
        except Exception as e:
            logger.error(f"Error scraping Twitter feed: {str(e)}")
            
        return scraped_data

class CoinMarketCapScraper(BaseScraper):
    def __init__(self, bot_username: str = ""):
        super().__init__(bot_username=bot_username)
        self.rss_url = "https://blog.coinmarketcap.com/feed/"
        self.client = httpx.AsyncClient(follow_redirects=True)
    
    def get_source_prefix(self) -> str:
        return "coinmarketcap"
        
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            response = await self.client.get(self.rss_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, "xml")
            if not soup.find('item'):
                soup = BeautifulSoup(response.content, "lxml")
            
            items = soup.find_all("item")
            logger.info(f"Found {len(items)} items in the RSS feed")
            
            for item in items[:10]:
                try:
                    title = item.title.text.strip()
                    description = item.description.text.strip()
                    link = item.link.text.strip()
                    pub_date = item.pubDate.text.strip()
                    
                    try:
                        pub_date_dt = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %z")
                    except ValueError:
                        pub_date_dt = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S +0000")
                    
                    if self.last_check_time and pub_date_dt.replace(tzinfo=None) <= self.last_check_time:
                        continue
                    
                    # Format the long description
                    long_desc = f"{description}\nLink: {link}"
                    
                    # Create notification
                    notification = ScrapedNotification(
                        source="coinmarketcap",
                        short_desc=title,
                        long_desc=long_desc,
                        notification_date=pub_date_dt.isoformat(),
                        relative_to_scraper_id=link
                    )
                    
                    # Add to scraped data
                    scraped_data.append(notification)
                    
                except Exception as e:
                    logger.error(f"Error processing RSS item: {str(e)}")
                    continue
                
        except Exception as e:
            logger.error(f"Error scraping CoinMarketCap RSS: {str(e)}")
            
        self.last_check_time = datetime.now()
        await self.client.aclose()
        return scraped_data

class CoinGeckoScraper(BaseScraper):
    def __init__(self, tracked_currencies: List[str], price_change_threshold: float = 5.0, bot_username: str = ""):
        super().__init__(bot_username=bot_username)
        # Get API key from environment
        self.api_key = os.getenv("COINGECKO_API_KEY", "")
        
        # Initialize HTTP client for direct API calls
        self.client = httpx.AsyncClient(
            base_url="https://pro-api.coingecko.com/api/v3" if self.api_key else "https://api.coingecko.com/api/v3",
            headers={'x-cg-pro-api-key': self.api_key} if self.api_key else {}
        )
        if self.api_key:
            logger.info("Initialized CoinGecko client with Pro API endpoint")
        else:
            logger.warning("No CoinGecko API key found in environment, using free tier")
            
        self.tracked_currencies = tracked_currencies
        self.price_change_threshold = price_change_threshold
        self.last_prices: Dict[str, float] = {}
        
    def get_source_prefix(self) -> str:
        return "coingecko"
        
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            for currency in self.tracked_currencies:
                response = await self.client.get(
                    "/simple/price",
                    params={
                        'ids': currency,
                        'vs_currencies': 'usd',
                        'include_24hr_change': 'true'
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                if not data or currency not in data:
                    continue
                
                current_price = data[currency]['usd']
                price_change = data[currency]['usd_24h_change']
                
                # Create unique ID for this price update
                price_update_id = f"{currency}_{current_price}_{price_change}"
                
                # Check if price change exceeds threshold
                if abs(price_change) >= self.price_change_threshold:
                    change_type = "increase" if price_change > 0 else "decrease"
                    
                    # Format the long description
                    long_desc = f"{currency.upper()} price {change_type}d by {abs(price_change):.2f}% in the last 24h. Current price: ${current_price:,.2f}"
                    
                    # Create notification
                    notification = ScrapedNotification(
                        source="coingecko",
                        short_desc=f"{currency.upper()} price {change_type} alert",
                        long_desc=long_desc,
                        notification_date=datetime.utcnow().isoformat(),
                        relative_to_scraper_id=price_update_id
                    )
                    
                    # Add to scraped data
                    scraped_data.append(notification)
                
                self.last_prices[currency] = current_price
                
        except Exception as e:
            logger.error(f"Error scraping CoinGecko: {str(e)}")
        
        return scraped_data

class RedditScraper(BaseScraper):
    def __init__(self, client_id: str, client_secret: str, user_agent: str, subreddits: List[str], bot_username: str = ""):
        super().__init__(bot_username=bot_username)
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        self.subreddits = subreddits
    
    def get_source_prefix(self) -> str:
        return "reddit"
    
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            for subreddit_name in self.subreddits:
                subreddit = self.reddit.subreddit(subreddit_name)
                for post in subreddit.hot(limit=10):
                    created_time = datetime.fromtimestamp(post.created_utc)
                    
                    if self.last_check_time and created_time <= self.last_check_time:
                        continue
                    
                    # Format the long description
                    long_desc = f"{post.selftext[:500]}...\nLink: https://reddit.com{post.permalink}"
                    
                    # Create notification
                    notification = ScrapedNotification(
                        source=f"reddit_{subreddit_name}",
                        short_desc=post.title,
                        long_desc=long_desc,
                        notification_date=created_time.isoformat(),
                        relative_to_scraper_id=post.id
                    )
                    
                    # Add to scraped data
                    scraped_data.append(notification)
                
        except Exception as e:
            logger.error(f"Error scraping Reddit: {str(e)}")
            
        self.last_check_time = datetime.utcnow()
        
        return scraped_data

class RSSFeedScraper(BaseScraper):
    def __init__(self, feed_urls: Dict[str, str], bot_username: str = "", news_type: str = "crypto"):
        """
        Initialize RSS Feed Scraper
        
        Args:
            feed_urls: Dictionary mapping feed names to their URLs
                       e.g. {"bitcoin_magazine": "https://bitcoinmagazine.com/feed"}
            bot_username: Username of the bot (not used for RSS feeds, but required for interface consistency)
        """
        super().__init__(bot_username)
        self.feed_urls = feed_urls
        self.news_type = news_type
        # Initialize a dictionary to store the last seen entry IDs for each feed
        self.last_entry_ids: Dict[str, Set[str]] = {feed: set() for feed in feed_urls}
        # Common user agent to mimic a regular browser
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "Accept-Language": "en-US,en;q=0.9",
        }
    
    def get_source_prefix(self) -> str:
        """Get the prefix based on news type."""
        return f"{self.news_type}_news"  # This will return e.g. "business_news"
    
    def _preprocess_feed(self, feed_content: str, feed_name: str) -> str:
        """Preprocess the feed content to fix common XML issues before parsing."""
        if feed_name == "bitcoin_magazine":
            # Fix the specific issue with mismatched tags in Bitcoin Magazine feed
            # The issue is likely with namespace declarations having extra spaces
            # Fix extra spaces before closing angle brackets in namespace declarations
            feed_content = re.sub(r'\s+>', '>', feed_content)
            
            # Fix any other common XML issues
            # Replace any self-closing tags that might be malformed
            feed_content = re.sub(r'<([^>]+)/\s+>', r'<\1/>', feed_content)
            
            # Ensure proper XML declaration
            if not feed_content.strip().startswith('<?xml'):
                feed_content = '<?xml version="1.0" encoding="UTF-8"?>\n' + feed_content
        
        return feed_content
    
    def _clean_html(self, html_content: str) -> str:
        """Remove HTML tags from content."""
        if not html_content:
            return ""
        try:
            # Check if the content is a file path (which it shouldn't be)
            if isinstance(html_content, str) and os.path.exists(html_content):
                logger.warning(f"Content appears to be a file path: {html_content}")
                return html_content

            # Ensure content is treated as markup
            if isinstance(html_content, bytes):
                html_content = html_content.decode('utf-8')
            
            # Add surrounding tags if content might be a fragment
            if not html_content.strip().startswith('<'):
                html_content = f'<div>{html_content}</div>'

            soup = BeautifulSoup(html_content, "lxml")
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text and normalize whitespace
            text = soup.get_text(separator=' ', strip=True)
            return ' '.join(text.split())
        except Exception as e:
            logger.warning(f"Error cleaning HTML content: {str(e)}")
            # Return the original content if parsing fails
            return html_content.strip() if isinstance(html_content, str) else str(html_content)

    def _format_entry_content(self, entry, feed_name: str) -> Dict[str, str]:
        """Format RSS entry content with better error handling and content extraction."""
        try:
            # Extract title with fallback
            title = entry.get("title", "No title")
            
            # Extract description/content with multiple fallbacks
            description = ""
            if hasattr(entry, 'content') and entry.content:
                description = entry.content[0].value
            elif hasattr(entry, 'summary_detail') and entry.summary_detail:
                description = entry.summary_detail.value
            elif hasattr(entry, 'summary'):
                description = entry.summary
            elif hasattr(entry, 'description'):
                description = entry.description
            
            # Clean the description HTML
            description = self._clean_html(description)
            
            # Extract link
            link = entry.get("link", "")
            
            # Extract publication date with fallbacks
            pub_date = entry.get("published", entry.get("pubDate", entry.get("updated", datetime.now().isoformat())))
            
            # Format the short description
            short_desc = f"[{feed_name.replace('_', ' ').title()}] {title}"
            
            # Format the long description
            long_desc = f"Title: {title}\n\n"
            if description:
                long_desc += f"Summary: {description}\n\n"
            long_desc += f"Source: {feed_name.replace('_', ' ').title()}\n"
            if link:
                long_desc += f"Link: {link}\n"
            long_desc += f"Published: {pub_date}"
            
            return {
                "short_desc": short_desc,
                "long_desc": long_desc,
                "pub_date": pub_date
            }
        except Exception as e:
            logger.error(f"Error formatting entry content: {str(e)}")
            # Return a minimal content dictionary if formatting fails
            return {
                "short_desc": f"[{feed_name.replace('_', ' ').title()}] New content",
                "long_desc": "Error formatting content",
                "pub_date": datetime.now().isoformat()
            }
    
    async def scrape(self) -> List[ScrapedNotification]:
        scraped_data = []
        try:
            for feed_name, feed_url in self.feed_urls.items():
                try:
                    logger.info(f"Scraping RSS feed: {feed_name} from {feed_url}")
                    
                    # Try different approaches if the site blocks direct requests
                    try:
                        # First attempt: Use httpx with headers
                        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                            response = await client.get(feed_url, headers=self.headers)
                            response.raise_for_status()  # Will raise an exception for 4XX/5XX responses
                            feed_content = response.text
                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 403:
                            logger.warning(f"Access forbidden (403) for {feed_name}. Trying alternative method...")
                            # For Bitcoin Magazine specifically, we can try an alternative feed URL or use feedparser directly
                            if feed_name == "bitcoin_magazine":
                                # Try using feedparser directly which might handle some sites better
                                feed = feedparser.parse(feed_url)
                                if not hasattr(feed, 'bozo_exception') or feed.entries:
                                    logger.info(f"Successfully parsed {feed_name} using feedparser directly")
                                    # Process entries and continue
                                    for entry in feed.entries:
                                        # Process entries as before
                                        try:
                                            # Use entry id or link as unique identifier
                                            entry_id = entry.get("id", entry.get("link", ""))
                                            
                                            # Skip if no valid ID
                                            if not entry_id:
                                                continue
                                            
                                            # Skip if we've seen this entry before
                                            if entry_id in self.last_entry_ids[feed_name]:
                                                continue
                                            
                                            # Format the content
                                            content = self._format_entry_content(entry, feed_name)
                                            
                                            # Parse and standardize the publication date
                                            try:
                                                if isinstance(content["pub_date"], str):
                                                    dt = parser.parse(content["pub_date"])
                                                    content["pub_date"] = dt.isoformat()
                                            except Exception as date_error:
                                                logger.warning(f"Error parsing date for {feed_name}: {date_error}")
                                                content["pub_date"] = datetime.now().isoformat()
                                            
                                            # Create notification
                                            notification = ScrapedNotification(
                                                source=self.get_source_prefix(),
                                                short_desc=content["short_desc"],
                                                long_desc=content["long_desc"],
                                                notification_date=content["pub_date"],
                                                relative_to_scraper_id=entry_id
                                            )
                                            
                                            # Add to scraped data
                                            scraped_data.append(notification)
                                            
                                            # Add to seen entries
                                            self.last_entry_ids[feed_name].add(entry_id)
                                            
                                        except Exception as entry_error:
                                            logger.error(f"Error processing entry in feed {feed_name}: {str(entry_error)}")
                                            continue
                                    
                                    # Skip the rest of the processing for this feed
                                    continue
                                else:
                                    logger.error(f"Failed to parse {feed_name} using alternative method")
                            
                            # If we get here, we couldn't access the feed
                            logger.error(f"Could not access feed {feed_name}: Access Forbidden (403)")
                            continue
                        else:
                            # For other HTTP errors, log and skip
                            logger.error(f"HTTP error {e.response.status_code} for {feed_name}: {str(e)}")
                            continue
                    except Exception as request_error:
                        logger.error(f"Error fetching feed {feed_name}: {str(request_error)}")
                        continue
                    
                    # Preprocess the feed content to fix any XML issues
                    feed_content = self._preprocess_feed(feed_content, feed_name)
                    
                    # Parse the preprocessed feed
                    feed = feedparser.parse(feed_content, sanitize_html=True)
                    
                    # Check for bozo_exception but continue if there are entries
                    if hasattr(feed, 'bozo_exception'):
                        logger.warning(f"Warning parsing feed {feed_name}: {feed.bozo_exception}")
                        if not feed.entries:
                            logger.error(f"No entries found in feed {feed_name}, skipping")
                            continue
                    
                    # Process entries
                    for entry in feed.entries:
                        try:
                            # Use entry id or link as unique identifier
                            entry_id = entry.get("id", entry.get("link", ""))
                            
                            # Skip if no valid ID
                            if not entry_id:
                                continue
                            
                            # Skip if we've seen this entry before
                            if entry_id in self.last_entry_ids[feed_name]:
                                continue
                            
                            # Format the content
                            content = self._format_entry_content(entry, feed_name)
                            
                            # Parse and standardize the publication date
                            try:
                                if isinstance(content["pub_date"], str):
                                    dt = parser.parse(content["pub_date"])
                                    content["pub_date"] = dt.isoformat()
                            except Exception as date_error:
                                logger.warning(f"Error parsing date for {feed_name}: {date_error}")
                                content["pub_date"] = datetime.now().isoformat()
                            
                            # Create notification
                            notification = ScrapedNotification(
                                source=self.get_source_prefix(),
                                short_desc=content["short_desc"],
                                long_desc=content["long_desc"],
                                notification_date=content["pub_date"],
                                relative_to_scraper_id=entry_id
                            )
                            
                            # Add to scraped data
                            scraped_data.append(notification)
                            
                            # Add to seen entries
                            self.last_entry_ids[feed_name].add(entry_id)
                            
                        except Exception as entry_error:
                            logger.error(f"Error processing entry in feed {feed_name}: {str(entry_error)}")
                            continue
                    
                    # Limit the size of the seen entries set
                    self.last_entry_ids[feed_name] = set(list(self.last_entry_ids[feed_name])[-1000:])
                    
                except Exception as feed_error:
                    logger.error(f"Error scraping RSS feed {feed_name}: {str(feed_error)}")
                    continue
            
        except Exception as e:
            logger.error(f"Error in RSS scraping: {str(e)}")
        
        return scraped_data

class ScraperManager:
    def __init__(self, notification_manager: NotificationDatabaseManager):
        self.notification_manager = notification_manager
        self.scrapers: List[BaseScraper] = []
        
    def add_scraper(self, scraper: BaseScraper):
        """Add a scraper to the manager."""
        scraper.notification_manager = self.notification_manager  # Set the notification manager
        self.scrapers.append(scraper)
    
    async def run_scraping_cycle(self):
        """Run one cycle of scraping from all sources."""
        for scraper in self.scrapers:
            try:
                scraped_items = await scraper.scrape()
                
                if not scraped_items:
                    continue
                
                # Prepare batch notifications
                batch_notifications = []
                
                for item in scraped_items:
                    # Add to batch
                    batch_notifications.append({
                        "source": item.source,
                        "short_desc": item.short_desc,
                        "long_desc": item.long_desc,
                        "notification_date": item.notification_date,
                        "relative_to_scraper_id": item.relative_to_scraper_id,
                        "bot_username": scraper.bot_username
                    })
                
                # Create notifications in batch if there are any
                if batch_notifications:
                    logger.info(f"Creating batch of {len(batch_notifications)} notifications from {scraper.__class__.__name__}")
                    try:
                        notification_ids = await self.notification_manager.create_notifications_batch(batch_notifications)
                        logger.info(f"Successfully created {len(notification_ids)} notifications in batch")
                    except Exception as e:
                        logger.error(f"Error creating batch notifications: {str(e)}")
                        # Fallback to individual creation if batch fails
                        logger.info("Falling back to individual notification creation")
                        for notification in batch_notifications:
                            try:
                                await self.notification_manager.create_notification(
                                    source=notification["source"],
                                    short_desc=notification["short_desc"],
                                    long_desc=notification["long_desc"],
                                    notification_date=notification["notification_date"],
                                    relative_to_scraper_id=notification["relative_to_scraper_id"],
                                    bot_username=notification["bot_username"]
                                )
                                
                            except Exception as individual_error:
                                logger.error(f"Error creating individual notification: {str(individual_error)}")
                
            except Exception as e:
                logger.error(f"Error in scraping cycle for {scraper.__class__.__name__}: {str(e)}")
                
    async def start_periodic_scraping(self, interval_seconds: int = 3600):  # Default 1 hour
        """Start periodic scraping with the specified interval."""
        while True:
            await self.run_scraping_cycle()
            await asyncio.sleep(interval_seconds)

# Example usage
if __name__ == "__main__":
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Test the scrapers
    try:
        # Test CoinMarketCap scraper
        # print("\nTesting CoinMarketCap RSS Feed Scraper...")
        
        # async def test_cmc():
        #     cmc_scraper = CoinMarketCapScraper()
        #     try:
        #         news = await cmc_scraper.scrape()
        #         print(f"\nLatest {len(news)} CoinMarketCap news items:")
        #         for item in news:
        #             print(f"- {item.short_desc}")
        #             print(f"  {item.long_desc[:200]}...")  # Show first 200 chars of description
        #     finally:
        #         await cmc_scraper.client.aclose()
        
        # asyncio.run(test_cmc())
        
        # Test RSS Feed scraper
        print("\nTesting RSS Feed Scraper...")
        
        async def test_rss():
            rss_feeds = {
                # "bitcoin_magazine": "https://bitcoinmagazine.com/feed",
                # "cointelegraph": "https://cointelegraph.com/rss",
                "coindesk": "https://www.coindesk.com/arc/outboundfeeds/rss"
            }
            # Get bot username from environment (not used for RSS feeds, but included for consistency)
            bot_username = os.getenv("TWITTER_BOT_USERNAME", "")
            rss_scraper = RSSFeedScraper(feed_urls=rss_feeds, bot_username=bot_username)
            
            news = await rss_scraper.scrape()
            print(f"\nLatest {len(news)} RSS feed items:")
            for item in news:
                source = item.source.split('_', 1)[1] if '_' in item.source else item.source
                print(f"- [{source}] {item.short_desc}")
                print(f"  {item.long_desc[:200]}...")  # Show first 200 chars of description
        
        asyncio.run(test_rss())
        
        # # Test Reddit scraper
        # print("\nTesting Reddit Scraper...")
        # reddit_scraper = RedditScraper(
        #     client_id=os.getenv("REDDIT_CLIENT_ID", ""),
        #     client_secret=os.getenv("REDDIT_CLIENT_SECRET", ""),
        #     user_agent="SuperiorAgentsBot/1.0",
        #     subreddits=[
        #         "cryptocurrency",
        #         "bitcoin",
        #         "ethereum",
        #         "CryptoMarkets"
        #     ]
        # )
        # reddit_posts = asyncio.run(reddit_scraper.scrape())
        # print(f"\nLatest {len(reddit_posts)} Reddit posts:")
        # for post in reddit_posts:
        #     print(f"- [{post.source}] {post.short_desc}")
        #     print(f"  {post.long_desc[:200]}...")  # Show first 200 chars of content
            
    except Exception as e:
        print(f"Error testing scrapers: {str(e)}") 
