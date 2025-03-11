from datetime import datetime, timedelta
from functools import partial
from math import e

from duckduckgo_search import DDGS
from src.twitter import TweepyTwitterClient, TweetData
from loguru import logger
from result import Ok, Err, Result, UnwrapError
from typing import List

from src.datatypes.marketing import NewsData

MOCK_TIME = datetime(2025, 1, 31, 10, 0, 0)
MOCK_TWEETS = [
	TweetData(
		id="1750812345678901234",
		text="Just loaded up on more $SOL 🚀 Paper hands can't see the vision. We're going to MOON soon! #DiamondHands #Solana",
		created_at=(MOCK_TIME - timedelta(minutes=15)).isoformat(),
		author_id="8675309111",
		author_username="cryptomoonboy",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901235",
		text="1/5 Why $ETH is still undervalued: A thread 🧵\nThe merge was just the beginning. Layer 2 scaling is changing everything...",
		created_at=(MOCK_TIME - timedelta(hours=1)).isoformat(),
		author_id="8675309222",
		author_username="eth_maxi_chad",
		thread_id="1750812345678901235",
	),
	TweetData(
		id="1750812345678901236",
		text="WAGMI fam! Just deployed my first NFT collection on OpenSea. Whitelist spots available for true believers 👀 #NFTs #web3",
		created_at=(MOCK_TIME - timedelta(hours=2)).isoformat(),
		author_id="8675309333",
		author_username="nft_degen_life",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901237",
		text="If you're not staking your $BTC with 100x leverage, do you even crypto? NFA but bears are about to get rekt 📈",
		created_at=(MOCK_TIME - timedelta(hours=3)).isoformat(),
		author_id="8675309444",
		author_username="leverage_king",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901238",
		text="This is financial advice: Buy high, sell low 🤡 Just kidding! But seriously, accumulate $BTC under 100k while you still can!",
		created_at=(MOCK_TIME - timedelta(hours=4)).isoformat(),
		author_id="8675309555",
		author_username="satoshi_disciple",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901239",
		text="🚨 ALPHA LEAK 🚨\nNew DeFi protocol launching next week. Already got my nodes set up. Early adopters will make it.",
		created_at=(MOCK_TIME - timedelta(hours=5)).isoformat(),
		author_id="8675309666",
		author_username="defi_alpha_leaks",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901240",
		text="Remember when they said crypto was dead? Look at us now! Stack sats and ignore the FUD. Time in the market > timing the market 💎",
		created_at=(MOCK_TIME - timedelta(hours=6)).isoformat(),
		author_id="8675309777",
		author_username="hodl_guru",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901241",
		text="GM future millionaires! Daily reminder to zoom out on the $BTC chart and touch grass. We're still so early! ☀️",
		created_at=(MOCK_TIME - timedelta(hours=7)).isoformat(),
		author_id="8675309888",
		author_username="crypto_mindset",
		thread_id=None,
	),
	TweetData(
		id="1750812345678901242",
		text="Why I sold my house to buy $PEPE: A thread 🐸\nNo one understands memecoins like me. This is financial advice.",
		created_at=(MOCK_TIME - timedelta(hours=8)).isoformat(),
		author_id="8675309999",
		author_username="meme_coin_chad",
		thread_id="1750812345678901242",
	),
	TweetData(
		id="1750812345678901243",
		text="Just finished my 69th YouTube video on why $BTC will hit 1 million by EOY. Like and subscribe for more hopium! 🚀",
		created_at=(MOCK_TIME - timedelta(hours=9)).isoformat(),
		author_id="8675309000",
		author_username="crypto_influencer_420",
		thread_id=None,
	),
]
MOCK_NUMBER = 27


class MarketingSensor:
	def __init__(self, twitter_client: TweepyTwitterClient, ddgs: DDGS):
		self.twitter_client = twitter_client
		self.ddgs = ddgs

	def get_count_of_followers(self) -> int:
		try:
			count = self.twitter_client.get_count_of_followers().unwrap()
		except UnwrapError as e:
			e = e.result.err()
			logger.error(
				f"MarketingSensor.get_count_of_followers: Failed getting follower number from twitter, err: \n{e}\ndefaulting..."
			)
			return 27

		return count

	def get_count_of_likes(self) -> int:
		try:
			count = self.twitter_client.get_count_of_me_likes().unwrap()
		except UnwrapError as e:
			e = e.result.err()
			logger.error(
				f"MarketingSensor.get_count_of_likes: Failed getting follower number from twitter, err: \n{e}\ndefaulting..."
			)
			return 27 * 4

		return count

	def get_metric_fn(self, metric_name: str = "followers"):
		metrics = {
			"followers": partial(self.get_count_of_followers),
			"likes": partial(self.get_count_of_likes),
		}

		if metric_name not in metrics:
			raise ValueError(f"Unsupported metric: {metric_name}")

		return metrics[metric_name]