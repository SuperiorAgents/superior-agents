from typing import Dict, Any, Callable


class MarketingSensorInterface:
	"""
	Interface for any MarketingSensor that provides Twitter-based marketing metrics.
	"""

	def get_count_of_followers(self) -> int:
		"""
		Returns the number of Twitter followers.
		"""
		...

	def get_count_of_likes(self) -> int:
		"""
		Returns the number of liked tweets by the user.
		"""
		...

	def get_metric_fn(self, metric_name: str = "followers") -> Callable[[], int]:
		"""
		Returns a callable that fetches a specific marketing metric.
		"""
		...


class TradingSensorInterface:
	"""
	Interface for any TradingSensor-like object that can provide wallet metrics
	and portfolio status.
	"""

	def get_portfolio_status(self) -> Dict[str, Any]:
		"""
		Returns the current status of the wallet portfolio.
		"""
		...

	def get_metric_fn(
		self, metric_name: str = "wallet"
	) -> Callable[[], Dict[str, Any]]:
		"""
		Returns a callable that fetches a metric by name.
		"""
		...
