"""
Blockchain Service for MetaPilot AI Engine v2.0.

Provides integration with blockchain networks, protocols, and data sources.
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional
import httpx
from web3 import Web3, AsyncWeb3
# Use standard Web3 without specific middleware imports for better compatibility

logger = logging.getLogger(__name__)


class BlockchainService:
    """
    Blockchain Service for MetaPilot AI Engine v2.0.
    
    Provides blockchain data access, transaction creation, and protocol interactions.
    """
    
    def __init__(self):
        """Initialize the Blockchain Service."""
        # Load configuration from environment variables
        self.ethereum_rpc_url = os.environ.get("ETHEREUM_RPC_URL", "")
        self.web3_provider_uri = os.environ.get("WEB3_PROVIDER_URI", "")
        
        # Initialize Web3 providers
        self.web3 = None
        self.async_web3 = None
        self._initialize_web3()
        
        # API keys for external services
        self.opensea_api_key = os.environ.get("OPENSEA_API_KEY", "")
        self.reservoir_api_key = os.environ.get("RESERVOIR_API_KEY", "")
        self.coingecko_api_key = os.environ.get("COINGECKO_API_KEY", "")
        
        # Initialize HTTP client for API calls
        self.http_client = httpx.AsyncClient(timeout=30.0)
        
        logger.info("BlockchainService initialized")
    
    def _initialize_web3(self):
        """Initialize Web3 providers."""
        try:
            # Initialize standard Web3 provider
            if self.web3_provider_uri:
                self.web3 = Web3(Web3.HTTPProvider(self.web3_provider_uri))
                # Connect to the provider
                logger.info("Using standard Web3 connection without custom middleware")
                logger.info(f"Web3 connected: {self.web3.is_connected()}")
            
            # Initialize AsyncWeb3 provider
            if self.ethereum_rpc_url:
                self.async_web3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(self.ethereum_rpc_url))
                logger.info("AsyncWeb3 initialized")
                
        except Exception as e:
            logger.error(f"Error initializing Web3: {str(e)}")
    
    async def get_eth_balance(self, address: str) -> float:
        """
        Get ETH balance for an address.
        
        Args:
            address: Ethereum address
            
        Returns:
            Balance in ETH
        """
        try:
            if not self.async_web3:
                raise ValueError("AsyncWeb3 not initialized")
            
            # Validate address
            if not self.async_web3.is_address(address):
                raise ValueError(f"Invalid Ethereum address: {address}")
            
            # Get balance in Wei
            balance_wei = await self.async_web3.eth.get_balance(address)
            
            # Convert to ETH
            balance_eth = self.async_web3.from_wei(balance_wei, 'ether')
            
            return float(balance_eth)
            
        except Exception as e:
            logger.error(f"Error getting ETH balance for {address}: {str(e)}")
            return 0.0
    
    async def get_token_balance(self, token_address: str, wallet_address: str) -> Dict[str, Any]:
        """
        Get ERC20 token balance for an address.
        
        Args:
            token_address: Token contract address
            wallet_address: Wallet address to check
            
        Returns:
            Dictionary with token balance and metadata
        """
        try:
            if not self.async_web3:
                raise ValueError("AsyncWeb3 not initialized")
            
            # Validate addresses
            if not self.async_web3.is_address(token_address):
                raise ValueError(f"Invalid token address: {token_address}")
            
            if not self.async_web3.is_address(wallet_address):
                raise ValueError(f"Invalid wallet address: {wallet_address}")
            
            # ERC20 ABI for balanceOf and decimals functions
            abi = [
                {
                    "constant": True,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"name": "", "type": "string"}],
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "name",
                    "outputs": [{"name": "", "type": "string"}],
                    "type": "function"
                }
            ]
            
            # Create contract instance
            contract = self.async_web3.eth.contract(address=token_address, abi=abi)
            
            # Get token data
            balance_wei = await contract.functions.balanceOf(wallet_address).call()
            decimals = await contract.functions.decimals().call()
            symbol = await contract.functions.symbol().call()
            name = await contract.functions.name().call()
            
            # Calculate balance in token units
            balance = balance_wei / (10 ** decimals)
            
            return {
                "token_address": token_address,
                "wallet_address": wallet_address,
                "balance": balance,
                "balance_wei": balance_wei,
                "decimals": decimals,
                "symbol": symbol,
                "name": name
            }
            
        except Exception as e:
            logger.error(f"Error getting token balance for {wallet_address} and token {token_address}: {str(e)}")
            return {
                "token_address": token_address,
                "wallet_address": wallet_address,
                "balance": 0,
                "error": str(e)
            }
    
    async def get_nft_balance(self, collection_address: str, wallet_address: str) -> Dict[str, Any]:
        """
        Get NFT balance for a collection and address.
        
        Args:
            collection_address: NFT collection contract address
            wallet_address: Wallet address to check
            
        Returns:
            Dictionary with NFT balance and metadata
        """
        try:
            if not self.reservoir_api_key:
                raise ValueError("Reservoir API key not configured")
            
            # Validate addresses
            if not Web3.is_address(collection_address):
                raise ValueError(f"Invalid collection address: {collection_address}")
            
            if not Web3.is_address(wallet_address):
                raise ValueError(f"Invalid wallet address: {wallet_address}")
            
            # Use Reservoir API to get NFT balance
            url = "https://api.reservoir.tools/users/tokens/v7"
            params = {
                "user": wallet_address,
                "collection": collection_address,
                "limit": 100
            }
            headers = {
                "accept": "application/json",
                "x-api-key": self.reservoir_api_key
            }
            
            response = await self.http_client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            tokens = data.get("tokens", [])
            
            return {
                "collection_address": collection_address,
                "wallet_address": wallet_address,
                "count": len(tokens),
                "tokens": tokens
            }
            
        except Exception as e:
            logger.error(f"Error getting NFT balance for {wallet_address} and collection {collection_address}: {str(e)}")
            return {
                "collection_address": collection_address,
                "wallet_address": wallet_address,
                "count": 0,
                "error": str(e)
            }
    
    async def get_token_price(self, token_id: str) -> Dict[str, Any]:
        """
        Get token price from CoinGecko.
        
        Args:
            token_id: CoinGecko token ID (e.g., 'ethereum', 'bitcoin')
            
        Returns:
            Dictionary with price data
        """
        try:
            if not self.coingecko_api_key:
                raise ValueError("CoinGecko API key not configured")
            
            url = f"https://pro-api.coingecko.com/api/v3/simple/price"
            params = {
                "ids": token_id,
                "vs_currencies": "usd,eth",
                "include_market_cap": "true",
                "include_24hr_vol": "true",
                "include_24hr_change": "true",
                "x_cg_pro_api_key": self.coingecko_api_key
            }
            
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if token_id not in data:
                raise ValueError(f"Token {token_id} not found in CoinGecko")
            
            return {
                "token_id": token_id,
                "price_data": data[token_id],
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            logger.error(f"Error getting price for token {token_id}: {str(e)}")
            return {
                "token_id": token_id,
                "error": str(e)
            }
    
    async def get_dao_proposals(self, dao_id: str) -> List[Dict[str, Any]]:
        """
        Get DAO proposals from Snapshot.
        
        Args:
            dao_id: Snapshot space ID
            
        Returns:
            List of proposals
        """
        try:
            snapshot_api_url = os.environ.get("SNAPSHOT_API_URL", "https://hub.snapshot.org/graphql")
            
            # GraphQL query for proposals
            query = """
            query Proposals($space: String!, $limit: Int!) {
              proposals(
                first: $limit,
                skip: 0,
                where: {
                  space: $space
                },
                orderBy: "created",
                orderDirection: desc
              ) {
                id
                title
                body
                choices
                start
                end
                snapshot
                state
                author
                space {
                  id
                  name
                }
                scores_total
                scores
                votes
              }
            }
            """
            
            variables = {
                "space": dao_id,
                "limit": 10
            }
            
            response = await self.http_client.post(
                snapshot_api_url,
                json={"query": query, "variables": variables}
            )
            response.raise_for_status()
            data = response.json()
            
            proposals = data.get("data", {}).get("proposals", [])
            
            return proposals
            
        except Exception as e:
            logger.error(f"Error getting proposals for DAO {dao_id}: {str(e)}")
            return []
    
    async def get_gas_prices(self) -> Dict[str, Any]:
        """
        Get current gas prices for Ethereum.
        
        Returns:
            Dictionary with gas price data
        """
        try:
            if not self.async_web3:
                raise ValueError("AsyncWeb3 not initialized")
            
            # Get latest block
            latest_block = await self.async_web3.eth.get_block('latest')
            
            # Get gas price
            gas_price = await self.async_web3.eth.gas_price
            
            # Convert to Gwei
            gas_price_gwei = self.async_web3.from_wei(gas_price, 'gwei')
            
            # Get EIP-1559 fee data
            fee_data = await self.async_web3.eth.fee_history(4, 'latest', [25, 50, 75])
            
            # Calculate base fee and priority fee estimates
            base_fee = latest_block.get('baseFeePerGas', 0)
            base_fee_gwei = self.async_web3.from_wei(base_fee, 'gwei')
            
            # Calculate priority fee estimates from fee history
            priority_fees = []
            for percentile in fee_data.get('reward', []):
                if percentile and len(percentile) > 0:
                    priority_fees.append(percentile[0])
            
            priority_fee_low = self.async_web3.from_wei(priority_fees[0], 'gwei') if len(priority_fees) > 0 else 0
            priority_fee_med = self.async_web3.from_wei(priority_fees[1], 'gwei') if len(priority_fees) > 1 else 0
            priority_fee_high = self.async_web3.from_wei(priority_fees[2], 'gwei') if len(priority_fees) > 2 else 0
            
            return {
                "gas_price_gwei": float(gas_price_gwei),
                "base_fee_gwei": float(base_fee_gwei),
                "priority_fee_low_gwei": float(priority_fee_low),
                "priority_fee_med_gwei": float(priority_fee_med),
                "priority_fee_high_gwei": float(priority_fee_high),
                "block_number": latest_block.get('number', 0),
                "block_timestamp": latest_block.get('timestamp', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting gas prices: {str(e)}")
            return {
                "error": str(e)
            }
    
    async def get_protocol_data(self, protocol_id: str, endpoint: str) -> Dict[str, Any]:
        """
        Get data from a DeFi protocol API.
        
        Args:
            protocol_id: Protocol identifier
            endpoint: API endpoint to query
            
        Returns:
            Protocol data
        """
        try:
            # Protocol API endpoints
            protocol_apis = {
                "aave": "https://aave-api-v2.aave.com",
                "compound": "https://api.compound.finance",
                "uniswap": "https://api.uniswap.org/v1",
                "curve": "https://api.curve.fi/api",
                "yearn": "https://api.yearn.finance"
            }
            
            if protocol_id not in protocol_apis:
                raise ValueError(f"Unsupported protocol: {protocol_id}")
            
            base_url = protocol_apis[protocol_id]
            url = f"{base_url}/{endpoint}"
            
            response = await self.http_client.get(url)
            response.raise_for_status()
            data = response.json()
            
            return {
                "protocol": protocol_id,
                "endpoint": endpoint,
                "data": data,
                "timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            logger.error(f"Error getting data for protocol {protocol_id} endpoint {endpoint}: {str(e)}")
            return {
                "protocol": protocol_id,
                "endpoint": endpoint,
                "error": str(e)
            }
    
    async def get_cross_chain_bridges(self) -> List[Dict[str, Any]]:
        """
        Get list of cross-chain bridges and their status.
        
        Returns:
            List of bridge data
        """
        try:
            # This would typically call a specialized API or aggregator
            # For now, we'll return a simulated list of bridges
            bridges = [
                {
                    "name": "Polygon Bridge",
                    "source_chain": "ethereum",
                    "destination_chain": "polygon",
                    "token_types": ["ERC20", "ERC721"],
                    "status": "operational",
                    "average_time_minutes": 15,
                    "fee_range_usd": {"min": 5, "max": 50}
                },
                {
                    "name": "Arbitrum Bridge",
                    "source_chain": "ethereum",
                    "destination_chain": "arbitrum",
                    "token_types": ["ERC20"],
                    "status": "operational",
                    "average_time_minutes": 10,
                    "fee_range_usd": {"min": 3, "max": 30}
                },
                {
                    "name": "Optimism Bridge",
                    "source_chain": "ethereum",
                    "destination_chain": "optimism",
                    "token_types": ["ERC20"],
                    "status": "operational",
                    "average_time_minutes": 5,
                    "fee_range_usd": {"min": 2, "max": 25}
                }
            ]
            
            return bridges
            
        except Exception as e:
            logger.error(f"Error getting cross-chain bridges: {str(e)}")
            return []
    
    async def get_market_sentiment(self, asset: str) -> Dict[str, Any]:
        """
        Get market sentiment data for an asset.
        
        Args:
            asset: Asset identifier
            
        Returns:
            Sentiment data
        """
        try:
            # This would typically call a specialized sentiment analysis API
            # For now, we'll return simulated sentiment data
            
            # In a real implementation, this would integrate with:
            # - Social media sentiment analysis
            # - News sentiment analysis
            # - Trading volume and volatility metrics
            # - Options market data
            # - Funding rates from perpetual futures
            
            sentiment_data = {
                "asset": asset,
                "overall_sentiment": "neutral",  # positive, neutral, negative
                "sentiment_score": 55,  # 0-100 scale
                "social_media": {
                    "twitter_sentiment": "slightly_positive",
                    "reddit_sentiment": "neutral",
                    "sentiment_change_24h": 2.5  # percentage points
                },
                "news": {
                    "sentiment": "neutral",
                    "article_count_24h": 12,
                    "major_headlines": [
                        "Example headline about the asset",
                        "Another example headline"
                    ]
                },
                "market_indicators": {
                    "volume_change_24h": 5.2,  # percentage
                    "volatility_index": 0.65,  # 0-1 scale
                    "funding_rate": 0.01  # percentage
                },
                "timestamp": asyncio.get_event_loop().time()
            }
            
            return sentiment_data
            
        except Exception as e:
            logger.error(f"Error getting market sentiment for {asset}: {str(e)}")
            return {
                "asset": asset,
                "error": str(e)
            }
    
    async def close(self):
        """Close HTTP client and other resources."""
        await self.http_client.aclose()
