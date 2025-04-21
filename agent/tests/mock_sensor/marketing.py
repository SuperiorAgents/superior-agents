from functools import partial
from loguru import logger


class MockMarketingSensor:
	def __init__(self, followers: int = 100, likes: int = 250):
		"""
		MockMarketingSensor simulates Twitter metrics.

		Args:
			followers (int): Mock follower count.
			likes (int): Mock like count.
		"""
		self._followers = followers
		self._likes = likes

	def get_count_of_followers(self) -> int:
		logger.debug("MockMarketingSensor.get_count_of_followers called")
		return self._followers

	def get_count_of_likes(self) -> int:
		logger.debug("MockMarketingSensor.get_count_of_likes called")
		return self._likes

	def get_metric_fn(self, metric_name: str = "followers"):
		metrics = {
			"followers": partial(self.get_count_of_followers),
			"likes": partial(self.get_count_of_likes),
		}

		if metric_name not in metrics:
			raise ValueError(f"Unsupported metric: {metric_name}")

		return metrics[metric_name]
