from eth_typing import Address
from web3 import Web3
import requests
from typing import Dict, Any
from datetime import datetime


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
	eth_balance_human = w3.from_wei(eth_balance, "ether")

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

	return {
		"eth_balance": float(eth_balance_human),
		"tokens": tokens,
		"timestamp": datetime.now().isoformat(),
	}