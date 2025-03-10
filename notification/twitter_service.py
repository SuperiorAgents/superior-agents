import os
import re
import tweepy
import logging

from typing   import Dict, List, Optional, Set
from datetime import datetime, timezone
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Tweet(BaseModel):
    id: str
    text: str
    created_at: datetime
    user_screen_name: str
    user_id: str
    is_retweet: bool
    is_quote: bool
    mentioned_users: List[str]
    hashtags: List[str]
    urls: List[str]
    media_urls: List[str]
    quoted_tweet: Optional[Dict] = None
    retweeted_tweet: Optional[Dict] = None
    reply_to_tweet_id: Optional[str] = None
    reply_to_user_id: Optional[str] = None


class TwitterService:
    def __init__(self, bot_username: str):
        """Initialize Twitter service with credentials from environment variables."""
        self.bot_username = bot_username
        self.seen_tweets: Set[str] = set()

        # Initialize Twitter API v1.1 with credentials from environment
        auth = tweepy.OAuthHandler(
            os.getenv("TWITTER_API_KEY"), os.getenv("TWITTER_API_SECRET")
        )
        auth.set_access_token(
            os.getenv("TWITTER_ACCESS_TOKEN"), os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        )
        self.api = tweepy.API(auth, wait_on_rate_limit=True)

        # Initialize Twitter API v2 client
        self.client = tweepy.Client(
            bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
            consumer_key=os.getenv("TWITTER_API_KEY"),
            consumer_secret=os.getenv("TWITTER_API_SECRET"),
            access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
            access_token_secret=os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
            wait_on_rate_limit=True,
        )

        # Get user ID for the bot
        try:
            user = self.client.get_user(username=bot_username)
            logger.info(f"User ID: {user}")
            self.user_id = user.data.id
        except Exception as e:
            logger.error(f"Error getting user ID: {str(e)}")
            self.user_id = None

        logger.info(f"Initialized Twitter service for bot: {bot_username}")

    def _process_tweet(self, tweet) -> Tweet:
        """Process a tweet object and extract relevant information."""
        # Extract mentioned users
        mentioned_users = [
            user["screen_name"] for user in tweet.entities.get("user_mentions", [])
        ]

        # Extract hashtags
        hashtags = [tag["text"] for tag in tweet.entities.get("hashtags", [])]

        # Extract URLs
        urls = [url["expanded_url"] for url in tweet.entities.get("urls", [])]

        # Extract media URLs
        media_urls = []
        if hasattr(tweet, "extended_entities") and "media" in tweet.extended_entities:
            for media in tweet.extended_entities["media"]:
                if media["type"] == "photo":
                    media_urls.append(media["media_url_https"])
                elif media["type"] == "video":
                    # Get highest quality video URL
                    variants = media["video_info"]["variants"]
                    video_variants = [
                        v for v in variants if v["content_type"] == "video/mp4"
                    ]
                    if video_variants:
                        highest_bitrate = max(
                            video_variants, key=lambda x: x.get("bitrate", 0)
                        )
                        media_urls.append(highest_bitrate["url"])

        # Handle quoted tweets
        quoted_tweet = None
        if hasattr(tweet, "quoted_status"):
            quoted_tweet = {
                "id": tweet.quoted_status.id_str,
                "text": (
                    tweet.quoted_status.full_text
                    if hasattr(tweet.quoted_status, "full_text")
                    else tweet.quoted_status.text
                ),
                "user_screen_name": tweet.quoted_status.user.screen_name,
            }

        # Handle retweets
        retweeted_tweet = None
        if hasattr(tweet, "retweeted_status"):
            retweeted_tweet = {
                "id": tweet.retweeted_status.id_str,
                "text": (
                    tweet.retweeted_status.full_text
                    if hasattr(tweet.retweeted_status, "full_text")
                    else tweet.retweeted_status.text
                ),
                "user_screen_name": tweet.retweeted_status.user.screen_name,
            }

        return Tweet(
            id=tweet.id_str,
            text=tweet.full_text if hasattr(tweet, "full_text") else tweet.text,
            created_at=tweet.created_at.replace(tzinfo=timezone.utc),
            user_screen_name=tweet.user.screen_name,
            user_id=tweet.user.id_str,
            is_retweet=hasattr(tweet, "retweeted_status"),
            is_quote=hasattr(tweet, "quoted_status"),
            mentioned_users=mentioned_users,
            hashtags=hashtags,
            urls=urls,
            media_urls=media_urls,
            quoted_tweet=quoted_tweet,
            retweeted_tweet=retweeted_tweet,
            reply_to_tweet_id=tweet.in_reply_to_status_id_str,
            reply_to_user_id=tweet.in_reply_to_user_id_str,
        )

    def get_mentions(
        self, count: int = 10, since_id: Optional[str] = None
    ) -> List[Tweet]:
        """Get recent mentions of the bot account using Twitter API v2 (limited to 10 most recent tweets).

        Rate limit: 180 requests per 15 minutes
        """
        try:
            if not self.user_id:
                logger.error("User ID not available")
                return []

            # Get mentions using v2 endpoint
            response = self.client.get_users_mentions(
                id=self.user_id,
                max_results=min(count, 5),  # Ensure we never get more than 10 tweets
                since_id=since_id,
                tweet_fields=[
                    "created_at",
                    "entities",
                    "referenced_tweets",
                    "author_id",
                ],
                expansions=[
                    "referenced_tweets.id",
                    "referenced_tweets.id.author_id",
                    "author_id",
                ],
                user_fields=["username"],
            )

            if not response.data:
                return []

            # Create a map of user IDs to usernames from the includes
            user_map = {}
            if hasattr(response, "includes") and "users" in response.includes:
                for user in response.includes["users"]:
                    user_map[user.id] = user.username

            tweets = []
            for tweet_data in response.data:
                # Convert v2 tweet format to our Tweet model
                entities = (
                    tweet_data.entities if hasattr(tweet_data, "entities") else {}
                )

                # Extract mentions, hashtags, and urls from entities
                mentioned_users = [
                    user["username"] for user in entities.get("mentions", [])
                ]
                hashtags = [tag["tag"] for tag in entities.get("hashtags", [])]
                urls = [url["expanded_url"] for url in entities.get("urls", [])]

                # Handle referenced tweets (quotes and retweets)
                referenced_tweets = (
                    tweet_data.referenced_tweets
                    if hasattr(tweet_data, "referenced_tweets")
                    else []
                )
                quoted_tweet = None
                retweeted_tweet = None

                for ref in referenced_tweets or []:
                    if ref.type == "quoted":
                        quoted_tweet = {
                            "id": ref.id,
                            "text": ref.text if hasattr(ref, "text") else "",
                            "user_screen_name": "",  # We would need additional API calls to get this
                        }
                    elif ref.type == "retweeted":
                        retweeted_tweet = {
                            "id": ref.id,
                            "text": ref.text if hasattr(ref, "text") else "",
                            "user_screen_name": "",  # We would need additional API calls to get this
                        }

                # Get the username from the user map
                user_screen_name = user_map.get(
                    tweet_data.author_id, str(tweet_data.author_id)
                )

                tweet = Tweet(
                    id=str(tweet_data.id),
                    text=tweet_data.text,
                    created_at=tweet_data.created_at.replace(tzinfo=timezone.utc),
                    user_screen_name=user_screen_name,
                    user_id=str(tweet_data.author_id),
                    is_retweet=(
                        any(ref.type == "retweeted" for ref in referenced_tweets)
                        if referenced_tweets
                        else False
                    ),
                    is_quote=(
                        any(ref.type == "quoted" for ref in referenced_tweets)
                        if referenced_tweets
                        else False
                    ),
                    mentioned_users=mentioned_users,
                    hashtags=hashtags,
                    urls=urls,
                    media_urls=[],  # Media requires additional API calls in v2
                    quoted_tweet=quoted_tweet,
                    retweeted_tweet=retweeted_tweet,
                    reply_to_tweet_id=None,  # Would need additional processing
                    reply_to_user_id=None,  # Would need additional processing
                )
                tweets.append(tweet)

            return tweets

        except Exception as e:
            logger.error(f"Error getting mentions: {str(e)}")
            return []

    def get_own_timeline(
        self, count: int = 10, since_id: Optional[str] = None
    ) -> List[Tweet]:
        """Get recent tweets from bot's own timeline using Twitter API v2 (limited to 10 most recent tweets).

        Rate limit: 5 requests per 15 minutes
        """
        try:
            if not self.user_id:
                logger.error("User ID not available")
                return []

            # Get timeline using v2 endpoint
            response = self.client.get_users_tweets(
                id=self.user_id,
                max_results=min(count, 5),  # Ensure we never get more than 10 tweets
                since_id=since_id,
                tweet_fields=[
                    "created_at",
                    "entities",
                    "referenced_tweets",
                    "author_id",
                ],
                expansions=["referenced_tweets.id", "referenced_tweets.id.author_id"],
                user_fields=["username"],
            )

            if not response.data:
                return []

            tweets = []
            for tweet_data in response.data:
                # Convert v2 tweet format to our Tweet model
                entities = (
                    tweet_data.entities if hasattr(tweet_data, "entities") else {}
                )

                # Extract mentions, hashtags, and urls from entities
                mentioned_users = [
                    user["username"] for user in entities.get("mentions", [])
                ]
                hashtags = [tag["tag"] for tag in entities.get("hashtags", [])]
                urls = [url["expanded_url"] for url in entities.get("urls", [])]

                # Handle referenced tweets (quotes and retweets)
                referenced_tweets = (
                    tweet_data.referenced_tweets
                    if hasattr(tweet_data, "referenced_tweets")
                    else []
                )
                quoted_tweet = None
                retweeted_tweet = None

                for ref in referenced_tweets or []:
                    if ref.type == "quoted":
                        quoted_tweet = {
                            "id": ref.id,
                            "text": ref.text if hasattr(ref, "text") else "",
                            "user_screen_name": "",  # We would need additional API calls to get this
                        }
                    elif ref.type == "retweeted":
                        retweeted_tweet = {
                            "id": ref.id,
                            "text": ref.text if hasattr(ref, "text") else "",
                            "user_screen_name": "",  # We would need additional API calls to get this
                        }

                tweet = Tweet(
                    id=str(tweet_data.id),
                    text=tweet_data.text,
                    created_at=tweet_data.created_at.replace(tzinfo=timezone.utc),
                    user_screen_name=self.bot_username,
                    user_id=str(tweet_data.author_id),
                    is_retweet=(
                        any(ref.type == "retweeted" for ref in referenced_tweets)
                        if referenced_tweets
                        else False
                    ),
                    is_quote=(
                        any(ref.type == "quoted" for ref in referenced_tweets)
                        if referenced_tweets
                        else False
                    ),
                    mentioned_users=mentioned_users,
                    hashtags=hashtags,
                    urls=urls,
                    media_urls=[],  # Media requires additional API calls in v2
                    quoted_tweet=quoted_tweet,
                    retweeted_tweet=retweeted_tweet,
                    reply_to_tweet_id=None,  # Would need additional processing
                    reply_to_user_id=None,  # Would need additional processing
                )
                tweets.append(tweet)

            return tweets

        except Exception as e:
            logger.error(f"Error getting own timeline: {str(e)}")
            return []

    def extract_trading_signals(self, tweet: Tweet) -> Optional[Dict]:
        """Extract trading-related signals from tweet content."""
        text = tweet.text.lower()
        signals = {}

        # Price patterns (e.g., "$BTC 50000" or "BTC/USD 50000")
        price_pattern = r"\$?([a-z]{2,5})[/-]?(?:usd)?\s*[\$]?\s*([\d,.]+)k?"
        matches = re.finditer(price_pattern, text)
        for match in matches:
            symbol, price = match.groups()
            # check if price is real number
            if not price.replace(",", "").replace(".", "").isdigit():
                continue
            # Convert price to float, handling "k" notation
            price = price.replace(",", "")
            if "k" in price.lower():
                price = float(price.lower().replace("k", "")) * 1000
            else:
                price = float(price)
            signals[symbol.upper()] = price
        # Trading keywords
        bullish_keywords = [
            "buy",
            "long",
            "bullish",
            "support",
            "breakout",
            "accumulate",
        ]
        bearish_keywords = [
            "sell",
            "short",
            "bearish",
            "resistance",
            "breakdown",
            "dump",
        ]
        if any(keyword in text for keyword in bullish_keywords):
            signals["sentiment"] = "bullish"
        elif any(keyword in text for keyword in bearish_keywords):
            signals["sentiment"] = "bearish"
        return signals if signals else None

    def extract_market_events(self, tweet: Tweet) -> Optional[Dict]:
        """Extract market-related events from tweet content."""
        text = tweet.text.lower()
        events = {}

        # Event keywords
        event_keywords = {
            "listing": r"(?:listed|listing|lists) on (\w+)",
            "partnership": r"partners? with (\w+)",
            "launch": r"(?:launch|releases?|announces?) (\w+)",
            "hack": r"(?:hack|exploit|breach|attack)",
            "regulation": r"(?:sec|regulation|regulatory|law|compliance)",
        }

        for event_type, pattern in event_keywords.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                if event_type not in events:
                    events[event_type] = []
                if len(match.groups()) > 0:
                    events[event_type].append(match.group(1))
                else:
                    events[event_type].append(True)

        return events if events else None

    def check_rate_limit(self):
        """Check current rate limit status"""
        try:
            data = self.api.rate_limit_status()
            # Check mentions timeline endpoint limits
            mentions_limit = data["resources"]["statuses"][
                "/statuses/mentions_timeline"
            ]

            logger.info(f"Rate Limit Status:")
            logger.info(f"Remaining calls: {mentions_limit['remaining']}")
            logger.info(
                f"Limit resets at: {datetime.fromtimestamp(mentions_limit['reset']).replace(tzinfo=timezone.utc)}"
            )

            return mentions_limit["remaining"] > 0

        except Exception as e:
            logger.error(f"Error checking rate limit: {str(e)}")
            return False


if __name__ == "__main__":
    # Test the Twitter service with environment variables
    try:
        twitter = TwitterService(bot_username="testing bot")

        # Check rate limit
        rate_limit_ok = twitter.check_rate_limit()
        print(f"Rate limit check: {'OK' if rate_limit_ok else 'NOT OK'}")

        # Test getting mentions
        mentions = twitter.get_mentions(count=5)
        print(f"\nLatest {len(mentions)} mentions:")
        for tweet in mentions:
            print(f"- {tweet.user_screen_name}: {tweet.text}")

        # Test getting own timeline
        timeline = twitter.get_own_timeline(count=5)
        print(f"\nLatest {len(timeline)} tweets from timeline:")
        for tweet in timeline:
            print(f"- {tweet.text}")

    except Exception as e:
        print(f"Error testing Twitter service: {str(e)}")

