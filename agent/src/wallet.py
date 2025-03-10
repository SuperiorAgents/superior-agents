import requests

from web3     import Web3
from typing   import Dict, Any
from datetime import datetime

from typing      import Optional
from dataclasses import dataclass


@dataclass
class SuperAgentResponse:
    """
    Data class representing a response from the SuperAgent service.

    Attributes:
            address (str): The Ethereum address of the SuperAgent account
            error (Optional[str]): Error message if the request failed, None otherwise
    """

    address: str
    error: Optional[str] = None


def get_superagent_account(
    network: str,
    agent_id: str,
    api_key: str,
    base_url: str,
    txn_service_url: str,
) -> SuperAgentResponse:
    """
    Get SuperAgent account address for a given network and agent ID (agent name).

    Args:
            network (str): Network identifier (e.g., "eth")
            agent_id (str): Identifier of the agent (agent name e.g., "phi")
            api_key (str): API key for authentication
            base_url (str): Base URL for the API
            txn_service_url (str): URL for the transaction service

    Returns:
            SuperAgentResponse: Object containing the address or error message

    Note:
            The original implementation using the SuperAgent API is commented out
            and replaced with a temporary solution using the transaction service.
    """

    # Temporarily use one account from txn_service
    response = requests.get(
        f"{txn_service_url}/api/v1/addresses", headers={"x-superior-agent-id": agent_id}
    )
    if response.status_code != 200:
        return SuperAgentResponse(address="", error=str(response.text))

    return SuperAgentResponse(address=response.json()["evm"])

    # Original implementation (commented out)
    # headers = {"Content-Type": "application/json", "x-api-key": api_key}

    # payload = {
    # 	"jsonrpc": "2.0",
    # 	"method": "superAgent_getAccount",
    # 	"params": [network, agent_id],
    # 	"id": 0,
    # }

    # try:
    # 	response = requests.post(base_url, headers=headers, json=payload, timeout=30)
    # 	response.raise_for_status()

    # 	result = response.json()
    # 	if "error" in result:
    # 		return SuperAgentResponse(address="", error=str(result["error"]))

    # 	return SuperAgentResponse(address=result["result"])

    # except requests.exceptions.RequestException as e:
    # 	return SuperAgentResponse(address="", error=f"Request failed: {str(e)}")
    # except Exception as e:
    # 	return SuperAgentResponse(address="", error=f"Unexpected error: {str(e)}")


def get_wallet_stats(
    agent_id: str,
    infura_project_id: str,
    etherscan_key: str,
    vault_base_url: str,
    vault_api_key: str,
    txn_service_url: str,
) -> Dict[str, Any]:
    """
    Get basic wallet statistics and token holdings for a SuperAgent account.

    Args:
            agent_id (str): Identifier of the agent
            infura_project_id (str): Infura project ID for Web3 connection
            etherscan_key (str): API key for Etherscan
            vault_base_url (str): Base URL for the vault service
            vault_api_key (str): API key for the vault service
            txn_service_url (str): URL for the transaction service

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

    response = get_superagent_account(
        network="eth",
        agent_id=agent_id,
        api_key=vault_api_key,
        base_url=vault_base_url,
        txn_service_url=txn_service_url,
    )

    if response.error:
        raise Exception(
            f"Failed to get the eth address of agent_id {agent_id}, err: \n{response.error}"
        )

    # Convert wallet address to checksum
    address = w3.to_checksum_address(response.address)

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
        coingecko_url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        price_response = requests.get(coingecko_url)
        eth_price_usd = price_response.json()["ethereum"]["usd"]

        # Calculate total portfolio value in USD
        total_value_usd = eth_balance_human * eth_price_usd

        # For each token, get its price and add to total value
        for token_addr, token_data in tokens.items():
            # Get real-time token prices from CoinGecko
            token_price_url = f"https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses={token_addr}&vs_currencies=usd"
            token_price_response = requests.get(token_price_url)
            if token_price_response.status_code == 200:
                price_data = token_price_response.json()
                if price_data and token_addr.lower() in price_data:
                    token_price_usd = price_data[token_addr.lower()]["usd"]
                    token_data["price_usd"] = token_price_usd
                    token_value_usd = token_data["balance"] * token_price_usd
                    total_value_usd += token_value_usd

        return {
            "eth_balance": eth_balance_human,
            "eth_balance_reserved": eth_reserve,
            "eth_balance_available": eth_available,
            "eth_price_usd": eth_price_usd,
            "tokens": tokens,
            "total_value_usd": total_value_usd,
            "timestamp": datetime.now().isoformat(),
        }
