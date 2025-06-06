import os
import time
from datetime import datetime
from typing import Dict

import requests
from loguru import logger
from web3 import Web3

from src.datatypes import WalletStats
from dotenv import load_dotenv
from src.db import SQLiteDB

load_dotenv()

DB = SQLiteDB(db_path=os.getenv("SQLITE_PATH", "../db/superior-agents.db"))


def save_to_db(token_addr, symbol, price, metadata=""):
	token_price = DB.get_token_price(symbol=symbol)
	if not token_price:
		DB.insert_token_price(
			token_addr=token_addr, symbol=symbol, price=price, metadata=metadata
		)
	else:
		DB.update_token_price(
			token_addr=token_addr, symbol=symbol, price=price, metadata=metadata
		)


class PriceProvider:
	def __init__(self):
		self.providers = [
			{
				"name": "binance",
				"url": "https://api.binance.com/api/v3/ticker/price",
				"params": {"symbol": "ETHUSDT"},
				"params_token": lambda x: {"symbol": x.upper() + "USDT"},
				"price_path": lambda x: float(x["price"]),
			},
			{
				"name": "kraken",
				"url": "https://api.kraken.com/0/public/Ticker",
				"params": {"pair": "ETHUSD"},
				"params_token": lambda x: {"pair": x.upper() + "USD"},
				"price_path": lambda x: float(x["result"]["XETHZUSD"]["c"][0]),
				"price_path_token": lambda x: float(
					list(x["result"].values())[0]["c"][0]
				),
			},
			{
				"name": "huobi",
				"url": "https://api.huobi.pro/market/detail/merged",
				"params": {"symbol": "ethusdt"},
				"params_token": lambda x: {"symbol": x.lower() + "usdt"},
				"price_path": lambda x: float(x["tick"]["close"]),
			},
			{
				"name": "coingecko",
				"url": "https://api.coingecko.com/api/v3/simple/price",
				"params": {"ids": "ethereum", "vs_currencies": "usd"},
				"params_token": {"ids": "ethereum", "vs_currencies": "usd"},  # not used
				"price_path": lambda x: x["ethereum"]["usd"],
			},
		]
		self._cache_ttl = 60

	def _is_cache_valid(self, timestamp: float) -> bool:
		print(timestamp)
		return (
			datetime.now() - datetime.fromisoformat(timestamp)
		).total_seconds() < self._cache_ttl

	def coingecko_provider_by_contract_address(
		self, token_address: str, symbol: str, max_retries: int = 3
	) -> Dict[str, float]:
		"""Get token prices from CoinGecko with retry mechanism"""
		base_delay = 1.0

		for attempt in range(max_retries):
			try:
				response = requests.get(
					"https://api.coingecko.com/api/v3/simple/token_price/ethereum",
					params={
						"contract_addresses": token_address,
						"vs_currencies": "usd",
					},
					timeout=10,
				)
				response.raise_for_status()

				data = response.json()
				if data and token_address.lower() in data:
					price = float(data[token_address.lower()]["usd"])
					save_to_db(
						token_addr=token_address,
						symbol=symbol,
						price=price,
						metadata="coingecko",
					)
					return price
					break

			except Exception as e:
				if attempt == max_retries - 1:
					print(f"Failed to get price for token {token_address}: {e}")
					raise Exception(
						f"Failed to get price for token {token_address}: {e}"
					)
				delay = base_delay * (2**attempt)
				time.sleep(delay)

		raise Exception(
			"coingecko_provider_by_contract_address: Coingecko providers failed"
		)

	def get_eth_price(self, max_retries: int = 3) -> float:
		"""Get ETH price using multiple providers with failover"""
		token_eth = DB.get_token_price(symbol="ETH")

		if token_eth:
			if self._is_cache_valid(token_eth.last_updated_at):
				return token_eth.price

		errors = []
		for provider in self.providers:
			for attempt in range(max_retries):
				try:
					print(f"Trying to get ETH price from {provider['name']}")
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
							save_to_db(
								token_addr="default_eth_contract_addr",
								symbol="ETH",
								price=price,
							)
							print(f"Successfully got ETH price from {provider['name']}")
							return price

				except Exception as e:
					logger.error(f"get_eth_price.err {e}")
					error_msg = f"{provider['name']}: {str(e)}"
					if "port=443)" in error_msg:
						logger.error(
							f"get_eth_price.err {provider['name']}: {provider['url']} doesn't work on your network, trying other provider..."
						)
						break
					errors.append(error_msg)
					print(f"Error with {error_msg}")

					if attempt < max_retries - 1:
						time.sleep(2**attempt)
					continue
		# If we have a cached price, return it as fallback
		token_eth = DB.get_token_price(symbol="ETH")
		if token_eth:
			print("Using cached price as fallback")
			return token_eth.price

		raise Exception(f"All providers failed: {'; '.join(errors)}")

	def get_token_price(self, token_address, symbol, max_retries: int = 3) -> float:
		"""Get token price using multiple providers with failover"""
		token_symbol = symbol
		token_price = DB.get_token_price(symbol=token_symbol)
		if token_price:
			if self._is_cache_valid(token_price.last_updated_at):
				return token_price.price

		errors = []
		for provider in self.providers:
			if provider["name"] == "coingecko":
				continue
			for attempt in range(max_retries):
				try:
					print(f"Trying to get token price from {provider['name']}")
					new_params = provider["params_token"](token_symbol)
					response = requests.get(
						provider["url"],
						params=new_params,
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
						price = provider.get(
							"price_path_token", provider["price_path"]
						)(data)

						if isinstance(price, (int, float)) and price > 0:
							# Update cache
							print(
								f"Successfully got token price from {provider['name']}"
							)
							save_to_db(
								token_addr=token_address,
								symbol=symbol,
								price=price,
								metadata=provider["name"],
							)
							return price

				except Exception as e:
					logger.error(f"get_token_price.err {e}")
					error_msg = f"{provider['name']}: {str(e)}"
					if "port=443)" in error_msg:
						logger.error(
							f"get_token_price.err {provider['name']}: {provider['url']} doesn't work on your network, trying other provider..."
						)
						break
					errors.append(error_msg)
					print(f"Error with {error_msg}")

					if attempt < max_retries - 1:
						time.sleep(2**attempt)
					continue

		try:  # one last attempt
			price = self.coingecko_provider_by_contract_address(
				token_address, token_symbol
			)
			return price
		except Exception as e:
			import traceback

			print(traceback.format_exc())
			print(e)

			# If we have a cached price, return it as fallback
			token_price = DB.get_token_price(symbol=symbol)
			if token_price:
				print("Using cached price as fallback")
				return token_price.price

			raise Exception(f"All providers failed: {'; '.join(errors)}")


_price_provider = PriceProvider()


def get_eth_price_v2(max_retries: int = 3) -> float:
	"""Get ETH price using multiple providers with failover"""
	base_delay = 1.0
	for attempt in range(max_retries):
		try:
			data = _price_provider.get_eth_price()
			if data:
				return float(data)
				break

		except Exception as e:
			import traceback

			print(traceback.format_exc())
			if attempt == max_retries - 1:
				print(f"Failed to get price for token eth: {e}")
			delay = base_delay * (2**attempt)
			time.sleep(delay)

	raise Exception("get_eth_price_v2: Fail getting price from rest-api")


def get_token_prices_v2(
	token_addresses: list[str], symbols, max_retries: int = 3
) -> Dict[str, float]:
	"""Get token prices from CoinGecko with retry mechanism"""
	base_delay = 1.0
	prices = {}

	for token_addr, symbol in zip(token_addresses, symbols):
		for attempt in range(max_retries):
			try:
				data = _price_provider.get_token_price(token_addr, symbol)
				if data:
					prices[token_addr] = float(data)
					break

			except Exception as e:
				if attempt == max_retries - 1:
					print(
						f"get_token_price_v2: Failed to get price for token {token_addr}: {e}"
					)
				delay = base_delay * (2**attempt)
				time.sleep(delay)

	return prices


def get_token_transactions(
	address: str, etherscan_key: str, max_retries: int = 3
) -> Dict:
	"""Get token transactions from Etherscan with retry mechanism"""
	base_delay = 1.0

	for attempt in range(max_retries):
		try:
			url = "https://api.etherscan.io/api"
			params = {
				"module": "account",
				"action": "tokentx",
				"address": address,
				"sort": "desc",
				"apikey": etherscan_key,
			}

			logger.info(
				f"Fetching token transactions from Etherscan (attempt {attempt + 1}/{max_retries})"
			)
			response = requests.get(url, params=params, timeout=10)

			if response.status_code == 429:  # Rate limit
				wait_time = 2.0 * (2**attempt)
				logger.warning(f"Rate limited by Etherscan, waiting {wait_time}s")
				time.sleep(wait_time)
				continue

			if response.status_code == 200:
				data = response.json()
				if data.get("status") == "1" and "result" in data:
					return data
				elif "message" in data:
					logger.warning(f"Etherscan API message: {data['message']}")

			response.raise_for_status()

		except Exception as e:
			if attempt == max_retries - 1:
				logger.error(f"Failed to get token transactions: {str(e)}")
				return {"status": "0", "message": str(e), "result": []}

			delay = base_delay * (2**attempt)
			logger.warning(f"Retrying in {delay}s...")
			time.sleep(delay)
			continue

	return {"status": "0", "message": "Max retries exceeded", "result": []}


def get_wallet_stats(
	address: str, infura_project_id: str, etherscan_key: str
) -> WalletStats:
	"""
	Get basic wallet statistics and token holdings for a SuperAgent account.

	This function retrieves the Ethereum address for the specified agent,
	fetches its ETH balance, and collects information about ERC-20 tokens
	held by the address using the Etherscan API.

	Args:
		address (str): Wallet address of the agent
		infura_project_id (str): Infura project ID for Web3 connection
		etherscan_key (str): API key for Etherscan

	Returns:
		Dict[str, Any]: Dictionary containing:
			- eth_balance (float): ETH balance in ether
			- eth_balance_reserved (float): ETH reserved for gas fees
			- eth_balance_available (float): ETH available for trading
			- tokens (Dict): Dictionary of token information, keyed by token address
			- timestamp (str): ISO-formatted timestamp of when the data was retrieved

	Raises:
		Exception: If the agent's Ethereum address cannot be retrieved
	"""
	w3 = Web3(Web3.HTTPProvider(f"https://mainnet.infura.io/v3/{infura_project_id}"))

	logger.info(f"Fetching wallet stats for address: {address}")

	# Get ETH balance
	eth_balance = w3.eth.get_balance(address)  # type: ignore
	eth_nonce = w3.eth.get_transaction_count(address)  # type: ignore
	eth_balance_human = float(w3.from_wei(eth_balance, "ether"))

	# Reserve ETH for gas fees (0.01 ETH)
	eth_reserve = 0.01
	eth_available = max(0.0, eth_balance_human - eth_reserve)

	# Get tokens from Etherscan
	data = get_token_transactions(address, etherscan_key)

	tokens = {}
	if "result" in data:
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
			eth_price_usd = get_eth_price_v2()
			logger.info(f"Current ETH price: ${eth_price_usd:,.2f}")

			# Calculate base portfolio value from ETH
			total_value_usd = eth_balance_human * eth_price_usd

			# Get all token prices in batch
			if tokens:
				# token_prices = get_token_prices(list(tokens.keys()))
				token_addresses = list(tokens.keys())
				symbols = [x["symbol"] for x in list(tokens.values())]
				token_prices = get_token_prices_v2(token_addresses, symbols)

				# Update token data with prices
				for token_addr, price in token_prices.items():
					if price and token_addr in tokens:
						tokens[token_addr]["price_usd"] = price
						total_value_usd += tokens[token_addr]["balance"] * price

			return {
				"wallet_address": address,
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
	else:
		if eth_balance == 0 and eth_nonce == 0:
			return {
				"wallet_address": address,
				"eth_balance": 0,
				"eth_balance_reserved": eth_reserve,
				"eth_balance_available": 0,
				"eth_price_usd": 0,
				"tokens": {},
				"total_value_usd": 0,
				"timestamp": datetime.now().isoformat(),
			}
		else:
			raise Exception("Failed to get wallet stats: No wallet address provided")
