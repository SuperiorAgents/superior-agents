from functools import lru_cache
from eth_typing import Address
from web3 import Web3
import requests
from typing import Dict, Any
from datetime import datetime
import time


class PriceProvider:
	def __init__(self):
		self.providers = [
			{
				"name": "coingecko",
				"url": "https://api.coingecko.com/api/v3/simple/price",
				"params": {"ids": "ethereum", "vs_currencies": "usd"},
				"price_path": lambda x: x["ethereum"]["usd"],
			},
			{
				"name": "binance",
				"url": "https://api.binance.com/api/v3/ticker/price",
				"params": {"symbol": "ETHUSDT"},
				"price_path": lambda x: float(x["price"]),
			},
			{
				"name": "kraken",
				"url": "https://api.kraken.com/0/public/Ticker",
				"params": {"pair": "ETHUSD"},
				"price_path": lambda x: float(x["result"]["XETHZUSD"]["c"][0]),
			},
			{
				"name": "huobi",
				"url": "https://api.huobi.pro/market/detail/merged",
				"params": {"symbol": "ethusdt"},
				"price_path": lambda x: float(x["tick"]["close"]),
			},
		]
		self._cache = {}
		self._cache_ttl = 60  # Cache valid for 60 seconds

	def _is_cache_valid(self, timestamp: float) -> bool:
		return time.time() - timestamp < self._cache_ttl

	@lru_cache(maxsize=1)
	def get_eth_price(self, max_retries: int = 3) -> float:
		"""Get ETH price using multiple providers with failover"""

		# Check cache first
		if "eth_price" in self._cache:
			price, timestamp = self._cache["eth_price"]
			if self._is_cache_valid(timestamp):
				return price

		errors = []
		for provider in self.providers:
			for attempt in range(max_retries):
				try:
					response = requests.get(
						provider["url"],
						params=provider["params"],
						headers={"Accept": "application/json"},
						timeout=10,
					)

					if response.status_code == 429:  # Rate limit
						wait_time = 2.0 * (2**attempt)
						print(
							f"Rate limited by {provider['name']}, waiting {wait_time}s"
						)
						time.sleep(wait_time)
						continue

					if response.status_code == 200:
						data = response.json()
						price = provider["price_path"](data)

						if isinstance(price, (int, float)) and price > 0:
							# Update cache
							self._cache["eth_price"] = (price, time.time())
							return price

				except Exception as e:
					error_msg = f"{provider['name']}: {str(e)}"
					errors.append(error_msg)
					print(f"Error with {error_msg}")

					if attempt < max_retries - 1:
						time.sleep(2**attempt)
					continue

		# If we have a cached price, return it as fallback
		if "eth_price" in self._cache:
			print("Using cached price as fallback")
			return self._cache["eth_price"][0]

		raise Exception(f"All providers failed: {'; '.join(errors)}")


_price_provider = PriceProvider()


def get_eth_price(max_retries: int = 3) -> float:
	"""Get ETH price using multiple providers with failover"""
	return _price_provider.get_eth_price(max_retries)


def get_token_prices(
	token_addresses: list[str], max_retries: int = 3
) -> Dict[str, float]:
	"""Get token prices from CoinGecko with retry mechanism"""
	base_delay = 1.0
	prices = {}

	for token_addr in token_addresses:
		for attempt in range(max_retries):
			try:
				response = requests.get(
					"https://api.coingecko.com/api/v3/simple/token_price/ethereum",
					params={"contract_addresses": token_addr, "vs_currencies": "usd"},
					timeout=10,
				)
				response.raise_for_status()

				data = response.json()
				if data and token_addr.lower() in data:
					prices[token_addr] = float(data[token_addr.lower()]["usd"])
					break

			except Exception as e:
				if attempt == max_retries - 1:
					print(f"Failed to get price for token {token_addr}: {e}")
				delay = base_delay * (2**attempt)
				time.sleep(delay)

	return prices


def get_wallet_stats(
	address: str, infura_project_id: str, etherscan_key: str
) -> Dict[str, Any]:
	"""
	Get basic wallet stats and token holdings
	Returns a dict with ETH balance and token information
	"""
	w3 = Web3(Web3.HTTPProvider(f"https://mainnet.infura.io/v3/{infura_project_id}"))

	# Convert wallet address to checksum
	address = w3.to_checksum_address(address)

	# Get ETH balance
	eth_balance = w3.eth.get_balance(address)  # type: ignore
	eth_balance_human = float(w3.from_wei(eth_balance, "ether"))

	# Reserve ETH for gas fees (0.01 ETH)
	eth_reserve = 0.01
	eth_available = max(0.0, eth_balance_human - eth_reserve)

	# Get tokens from Etherscan
	url = f"https://api.etherscan.io/api?module=account&action=tokentx&address={address}&sort=desc&apikey={etherscan_key}"
	response = requests.get(url)
	data = response.json()

	tokens = {}
	if data.get("status") == "1" and "result" in data:
		token_txns = data["result"]
		if isinstance(token_txns, list):
			for tx in token_txns:
				if isinstance(tx, dict):
					# Convert token address to checksum format
					try:
						token_addr = w3.to_checksum_address(
							tx.get("contractAddress", "")
						)
						if token_addr and token_addr not in tokens:
							# Simple contract to get balance
							contract = w3.eth.contract(
								address=token_addr,
								abi=[
									{
										"constant": True,
										"inputs": [
											{"name": "_owner", "type": "address"}
										],
										"name": "balanceOf",
										"outputs": [
											{"name": "balance", "type": "uint256"}
										],
										"type": "function",
									}
								],
							)

							balance = contract.functions.balanceOf(address).call()
							decimal = int(tx.get("tokenDecimal", "18"))
							if balance > 0:
								tokens[token_addr] = {
									"symbol": tx.get("tokenSymbol", "UNKNOWN"),
									"balance": balance / (10**decimal),
								}
					except Exception as e:
						print(
							f"Error processing token {tx.get('contractAddress')}: {str(e)}"
						)
						continue

		# Gets real-time ETH price from CoinGecko
		try:
			# Get ETH price with retries
			eth_price_usd = get_eth_price()
			print(f"Current ETH price: ${eth_price_usd:,.2f}")

			# Calculate base portfolio value from ETH
			total_value_usd = eth_balance_human * eth_price_usd

			# Get all token prices in batch
			if tokens:
				token_prices = get_token_prices(list(tokens.keys()))

				# Update token data with prices
				for token_addr, price in token_prices.items():
					if price and token_addr in tokens:
						tokens[token_addr]["price_usd"] = price
						total_value_usd += tokens[token_addr]["balance"] * price

			return {
				"eth_balance": eth_balance_human,
				"eth_balance_reserved": eth_reserve,
				"eth_balance_available": eth_available,
				"eth_price_usd": eth_price_usd,
				"tokens": tokens,
				"total_value_usd": total_value_usd,
				"timestamp": datetime.now().isoformat(),
			}

		except Exception as e:
			raise Exception(f"Failed to get wallet stats: {e}")
