# Notification Service

A comprehensive notification service that aggregates data from multiple sources including Twitter, Reddit, CoinGecko, CoinMarketCap, and RSS feeds. The service runs as scheduled cron jobs to collect and process information at configurable intervals.

## Requirements

- `docker` and `docker compose`

## Features

- **Multi-source Data Collection**:

  - Twitter mentions and timeline monitoring
  - Reddit cryptocurrency subreddit monitoring
  - CoinGecko price alerts
  - CoinMarketCap news updates
  - RSS feeds from crypto news sources (Bitcoin Magazine, Cointelegraph)

- **Configurable Intervals**: Each data source can be configured with its own scraping interval
- **Robust Error Handling**: Comprehensive error handling and logging
- **Resource Cleanup**: Proper cleanup of connections and resources
- **Modular Design**: Easy to add new data sources

## Quickstart

1. Navigate to the notification directory:

```bash
cd notification
```

2. Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

3. Edit `.env` with your credentials and settings (`.env` must be in the notification directory):

```env
# Research tools
# Twitter API Credentials
# Required for Twitter scraping functionality
# Get these from https://developer.twitter.com/en/portal/dashboard
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
TWITTER_BOT_USERNAME=
TWITTER_CLIENT_ID=          
TWITTER_CLIENT_SECRET=
TWITTER_BEARER_TOKEN=

# Reddit API Credentials
# Required for Reddit scraping functionality
# Get these from https://www.reddit.com/prefs/apps
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Scraping Configuration
# Scraper = all, twitter, coingecko, cmc, reddit, rss
SCRAPER=rss

# Interval between scraping cycles in minutes
# All set to 60 minutes (1 hour)
TWITTER_SCRAPING_INTERVAL=60
COINGECKO_SCRAPING_INTERVAL=60
CMC_SCRAPING_INTERVAL=60
REDDIT_SCRAPING_INTERVAL=60
RSS_SCRAPING_INTERVAL=30

# Price change threshold for crypto alerts (in percentage)
PRICE_CHANGE_THRESHOLD=5.0

# Logging Configuration
# Valid levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO 
```

4. Start the notification worker:

```bash
docker compose up --build
```


## File Structure

- `cron_worker.py`: Main worker script that runs the scraping jobs
- `notification_database_manager.py`: Database manager for notifications
- `models.py`: Data models for notifications and responses
- `scrapers.py`: Implementation of different scrapers
- `twitter_service.py`: Twitter API integration
- `install_cron.sh`: Script to install cron jobs
- `requirements.txt`: Python package dependencies

## Usage

### Running Individual Scrapers

You can run specific scrapers manually:

```bash
# Run all scrapers
./cron_worker.py

# Run specific scrapers
SCRAPER=twitter ./cron_worker.py
SCRAPER=coingecko ./cron_worker.py
SCRAPER=reddit ./cron_worker.py
SCRAPER=coinmarketcap ./cron_worker.py
SCRAPER=rss ./cron_worker.py
```

## Components

### Scrapers

- **TwitterScraper**: Monitors mentions and timeline of a specified bot account

  - Rate limits: 180 requests/15min for mentions, 5 requests/15min for timeline
  - Configurable via `TWITTER_SCRAPING_INTERVAL`

- **CoinGeckoScraper**: Monitors cryptocurrency price changes

  - Supports multiple currencies
  - Configurable price change threshold
  - Configurable via `COINGECKO_SCRAPING_INTERVAL`

- **CoinMarketCapScraper**: Fetches latest crypto news

  - RSS feed monitoring
  - Configurable via `CMC_SCRAPING_INTERVAL`

- **RedditScraper**: Monitors cryptocurrency subreddits

  - Configurable subreddit list
  - Configurable via `REDDIT_SCRAPING_INTERVAL`

- **RSSFeedScraper**: Fetches and processes RSS feeds from crypto news sources
  - Currently configured for Bitcoin Magazine and Cointelegraph
  - Easily extensible to other RSS sources
  - HTML content cleaning and formatting
  - Configurable via `RSS_SCRAPING_INTERVAL`

### Services

- **NotificationDatabaseManager**: Handles database operations for notifications

## Maintenance

### Log Rotation

Logs are automatically rotated and cleaned up:

- Daily log files: `logs/cron_worker_YYYYMMDD.log`
- Auto-deletion after 7 days


## Adding New RSS Feeds

To add new RSS feeds to the scraper:

1. Open `cron_worker.py` and locate the RSS feed initialization section
2. Add your new feed to the `rss_feeds` dictionary:
   ```python
   rss_feeds = {
       "bitcoin_magazine": "https://bitcoinmagazine.com/feed",
       "cointelegraph": "https://cointelegraph.com/rss",
       "your_new_source": "https://your-new-source.com/rss"
   }
   ```
3. Restart the scraper or wait for the next scheduled run
