#!/bin/bash

# Get the absolute path of the notification directory
NOTIFICATION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$NOTIFICATION_DIR/notification-venv/bin/python"

# Check if virtual environment exists
if [ ! -f "$VENV_PYTHON" ]; then
	echo "Error: Virtual environment not found at $VENV_PYTHON"
	echo "Please create and activate the virtual environment first:"
	echo "python3 -m venv notification-venv"
	echo "source notification-venv/bin/activate"
	exit 1
fi

# Load environment variables from .env
if [ -f "$NOTIFICATION_DIR/../.env" ]; then
	source "$NOTIFICATION_DIR/../.env"
elif [ -f "$NOTIFICATION_DIR/.env" ]; then
	source "$NOTIFICATION_DIR/.env"
else
	echo "Error: .env file not found inside the notification directory"
	exit 1
fi

# Set default intervals if not defined in .env
TWITTER_INTERVAL=${TWITTER_SCRAPING_INTERVAL:-60}
COINGECKO_INTERVAL=${COINGECKO_SCRAPING_INTERVAL:-60}
CMC_INTERVAL=${CMC_SCRAPING_INTERVAL:-60}
REDDIT_INTERVAL=${REDDIT_SCRAPING_INTERVAL:-60}
RSS_INTERVAL=${RSS_SCRAPING_INTERVAL:-15}
ALL_INTERVAL=${ALL_SCRAPING_INTERVAL:-15}

# Create logs directory if it doesn't exist
mkdir -p "$NOTIFICATION_DIR/logs"

# Create a temporary crontab file
TEMP_CRONTAB="/tmp/notification_crontab.txt"

# Start with a clean file
cat >"$TEMP_CRONTAB" <<EOL
# Notification Service Cron Jobs
# m h dom mon dow command

# Run Twitter scraper every $TWITTER_INTERVAL minutes
*/$TWITTER_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=twitter ${VENV_PYTHON} ./cron_worker.py

# Run CoinGecko price checks every $COINGECKO_INTERVAL minutes
*/$COINGECKO_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=coingecko ${VENV_PYTHON} ./cron_worker.py

# Run CoinMarketCap news scraper every $CMC_INTERVAL minutes
*/$CMC_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=coinmarketcap ${VENV_PYTHON} ./cron_worker.py

# Run Reddit scraper every $REDDIT_INTERVAL minutes
*/$REDDIT_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=reddit ${VENV_PYTHON} ./cron_worker.py

# Run RSS feed scraper every $RSS_INTERVAL minutes
*/$RSS_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=rss ${VENV_PYTHON} ./cron_worker.py

# Run all scrapers every $ALL_INTERVAL minutes
*/$ALL_INTERVAL * * * * cd ${NOTIFICATION_DIR} && SCRAPER=all ${VENV_PYTHON} ./cron_worker.py

# Log rotation: Delete logs older than 7 days at midnight
0 0 * * * find ${NOTIFICATION_DIR}/logs -name "*.log" -mtime +7 -delete
EOL

# Create a temporary file with the current crontab
crontab -l >/tmp/current_crontab 2>/dev/null || true

# Remove any existing notification service entries
sed -i.bak '/superior-agents\/notification/d' /tmp/current_crontab

# Add new cron jobs
cat "$TEMP_CRONTAB" >>/tmp/current_crontab

# Install the new crontab
crontab /tmp/current_crontab

# Clean up
rm /tmp/current_crontab /tmp/current_crontab.bak "$TEMP_CRONTAB"

echo "Cron jobs installed successfully with intervals:"
echo "- Twitter: every $TWITTER_INTERVAL minutes"
echo "- CoinGecko: every $COINGECKO_INTERVAL minutes"
echo "- CoinMarketCap: every $CMC_INTERVAL minutes"
echo "- Reddit: every $REDDIT_INTERVAL minutes"
echo "- RSS Feeds: every $RSS_INTERVAL minutes"
echo "- All Scrapers: every $ALL_INTERVAL minutes"
echo ""
echo "Using Python interpreter: ${VENV_PYTHON}"
echo "You can verify the installation with: crontab -l"
