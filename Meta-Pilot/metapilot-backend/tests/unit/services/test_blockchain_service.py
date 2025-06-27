"""
Unit tests for BlockchainService.
"""

import os
import pytest
import unittest
from unittest.mock import patch, MagicMock
import asyncio
import json

from metapilot.services.blockchain_service import BlockchainService


class TestBlockchainService(unittest.TestCase):
    """Test cases for BlockchainService."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock environment variables
        self.env_patcher = patch.dict('os.environ', {
            'ETHEREUM_RPC_URL': 'https://eth-mainnet.example.com',
            'WEB3_PROVIDER_URI': 'https://eth-mainnet.example.com',
            'OPENSEA_API_KEY': 'test_opensea_key',
            'RESERVOIR_API_KEY': 'test_reservoir_key',
            'COINGECKO_API_KEY': 'test_coingecko_key'
        })
        self.env_patcher.start()
        
        # Mock Web3
        self.web3_patcher = patch('metapilot.services.blockchain_service.Web3')
        self.mock_web3_class = self.web3_patcher.start()
        self.mock_web3 = MagicMock()
        self.mock_web3_class.return_value = self.mock_web3
        self.mock_web3_class.is_address.return_value = True
        
        # Mock AsyncWeb3
        self.async_web3_patcher = patch('metapilot.services.blockchain_service.AsyncWeb3')
        self.mock_async_web3_class = self.async_web3_patcher.start()
        self.mock_async_web3 = MagicMock()
        self.mock_async_web3_class.return_value = self.mock_async_web3
        self.mock_async_web3.is_address.return_value = True
        
        # Mock httpx
        self.httpx_patcher = patch('metapilot.services.blockchain_service.httpx')
        self.mock_httpx = self.httpx_patcher.start()
        self.mock_client = MagicMock()
        self.mock_httpx.AsyncClient.return_value = self.mock_client
        
        # Create service instance
        self.service = BlockchainService()
    
    def tearDown(self):
        """Clean up after tests."""
        self.env_patcher.stop()
        self.web3_patcher.stop()
        self.async_web3_patcher.stop()
        self.httpx_patcher.stop()
    
    def test_initialization(self):
        """Test service initialization."""
        self.assertEqual(self.service.ethereum_rpc_url, 'https://eth-mainnet.example.com')
        self.assertEqual(self.service.web3_provider_uri, 'https://eth-mainnet.example.com')
        self.assertEqual(self.service.opensea_api_key, 'test_opensea_key')
        self.assertEqual(self.service.reservoir_api_key, 'test_reservoir_key')
        self.assertEqual(self.service.coingecko_api_key, 'test_coingecko_key')
        
        # Verify Web3 initialization
        self.mock_web3_class.HTTPProvider.assert_called_once_with('https://eth-mainnet.example.com')
        self.mock_async_web3_class.AsyncHTTPProvider.assert_called_once_with('https://eth-mainnet.example.com')
    
    async def test_get_eth_balance(self):
        """Test getting ETH balance."""
        # Setup mock
        self.mock_async_web3.eth.get_balance.return_value = asyncio.Future()
        self.mock_async_web3.eth.get_balance.return_value.set_result(1000000000000000000)  # 1 ETH in Wei
        self.mock_async_web3.from_wei.return_value = 1.0
        
        # Run test
        balance = await self.service.get_eth_balance("0x1234567890123456789012345678901234567890")
        
        # Verify
        self.assertEqual(balance, 1.0)
        self.mock_async_web3.eth.get_balance.assert_called_once()
        self.mock_async_web3.from_wei.assert_called_once_with(1000000000000000000, 'ether')
    
    async def test_get_token_balance(self):
        """Test getting token balance."""
        # Setup mock contract
        mock_contract = MagicMock()
        self.mock_async_web3.eth.contract.return_value = mock_contract
        
        # Setup mock function calls
        mock_balance_of = MagicMock()
        mock_balance_of.call.return_value = asyncio.Future()
        mock_balance_of.call.return_value.set_result(1000000000000000000)  # 1 token in smallest unit
        
        mock_decimals = MagicMock()
        mock_decimals.call.return_value = asyncio.Future()
        mock_decimals.call.return_value.set_result(18)
        
        mock_symbol = MagicMock()
        mock_symbol.call.return_value = asyncio.Future()
        mock_symbol.call.return_value.set_result("TEST")
        
        mock_name = MagicMock()
        mock_name.call.return_value = asyncio.Future()
        mock_name.call.return_value.set_result("Test Token")
        
        # Setup contract functions
        mock_contract.functions.balanceOf.return_value = mock_balance_of
        mock_contract.functions.decimals.return_value = mock_decimals
        mock_contract.functions.symbol.return_value = mock_symbol
        mock_contract.functions.name.return_value = mock_name
        
        # Run test
        token_address = "0x1111111111111111111111111111111111111111"
        wallet_address = "0x2222222222222222222222222222222222222222"
        result = await self.service.get_token_balance(token_address, wallet_address)
        
        # Verify
        self.assertEqual(result["token_address"], token_address)
        self.assertEqual(result["wallet_address"], wallet_address)
        self.assertEqual(result["balance"], 1.0)
        self.assertEqual(result["balance_wei"], 1000000000000000000)
        self.assertEqual(result["decimals"], 18)
        self.assertEqual(result["symbol"], "TEST")
        self.assertEqual(result["name"], "Test Token")
        
        # Verify contract calls
        self.mock_async_web3.eth.contract.assert_called_once()
        mock_contract.functions.balanceOf.assert_called_once_with(wallet_address)
        mock_contract.functions.decimals.assert_called_once()
        mock_contract.functions.symbol.assert_called_once()
        mock_contract.functions.name.assert_called_once()
    
    async def test_get_nft_balance(self):
        """Test getting NFT balance."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "tokens": [
                {"tokenId": "1", "name": "NFT #1"},
                {"tokenId": "2", "name": "NFT #2"}
            ]
        }
        self.mock_client.get.return_value = asyncio.Future()
        self.mock_client.get.return_value.set_result(mock_response)
        
        # Run test
        collection_address = "0x3333333333333333333333333333333333333333"
        wallet_address = "0x4444444444444444444444444444444444444444"
        result = await self.service.get_nft_balance(collection_address, wallet_address)
        
        # Verify
        self.assertEqual(result["collection_address"], collection_address)
        self.assertEqual(result["wallet_address"], wallet_address)
        self.assertEqual(result["count"], 2)
        self.assertEqual(len(result["tokens"]), 2)
        
        # Verify API call
        self.mock_client.get.assert_called_once()
        args, kwargs = self.mock_client.get.call_args
        self.assertEqual(args[0], "https://api.reservoir.tools/users/tokens/v7")
        self.assertEqual(kwargs["params"]["user"], wallet_address)
        self.assertEqual(kwargs["params"]["collection"], collection_address)
        self.assertEqual(kwargs["headers"]["x-api-key"], "test_reservoir_key")
    
    async def test_get_token_price(self):
        """Test getting token price."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "ethereum": {
                "usd": 2500.0,
                "eth": 1.0,
                "usd_market_cap": 300000000000,
                "usd_24h_vol": 15000000000,
                "usd_24h_change": 2.5
            }
        }
        self.mock_client.get.return_value = asyncio.Future()
        self.mock_client.get.return_value.set_result(mock_response)
        
        # Run test
        result = await self.service.get_token_price("ethereum")
        
        # Verify
        self.assertEqual(result["token_id"], "ethereum")
        self.assertEqual(result["price_data"]["usd"], 2500.0)
        self.assertEqual(result["price_data"]["eth"], 1.0)
        
        # Verify API call
        self.mock_client.get.assert_called_once()
        args, kwargs = self.mock_client.get.call_args
        self.assertEqual(args[0], "https://pro-api.coingecko.com/api/v3/simple/price")
        self.assertEqual(kwargs["params"]["ids"], "ethereum")
        self.assertEqual(kwargs["params"]["x_cg_pro_api_key"], "test_coingecko_key")
    
    async def test_get_dao_proposals(self):
        """Test getting DAO proposals."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "data": {
                "proposals": [
                    {
                        "id": "proposal-1",
                        "title": "Test Proposal 1",
                        "body": "Proposal body",
                        "choices": ["Yes", "No"],
                        "state": "active"
                    },
                    {
                        "id": "proposal-2",
                        "title": "Test Proposal 2",
                        "body": "Proposal body",
                        "choices": ["For", "Against"],
                        "state": "closed"
                    }
                ]
            }
        }
        self.mock_client.post.return_value = asyncio.Future()
        self.mock_client.post.return_value.set_result(mock_response)
        
        # Run test
        proposals = await self.service.get_dao_proposals("test-dao")
        
        # Verify
        self.assertEqual(len(proposals), 2)
        self.assertEqual(proposals[0]["id"], "proposal-1")
        self.assertEqual(proposals[0]["title"], "Test Proposal 1")
        self.assertEqual(proposals[0]["state"], "active")
        
        # Verify API call
        self.mock_client.post.assert_called_once()
        args, kwargs = self.mock_client.post.call_args
        self.assertEqual(args[0], "https://hub.snapshot.org/graphql")
        self.assertEqual(kwargs["json"]["variables"]["space"], "test-dao")
    
    async def test_get_gas_prices(self):
        """Test getting gas prices."""
        # Setup mock
        self.mock_async_web3.eth.get_block.return_value = asyncio.Future()
        self.mock_async_web3.eth.get_block.return_value.set_result({
            "number": 15000000,
            "timestamp": 1650000000,
            "baseFeePerGas": 20000000000  # 20 Gwei
        })
        
        self.mock_async_web3.eth.gas_price.return_value = asyncio.Future()
        self.mock_async_web3.eth.gas_price.return_value.set_result(25000000000)  # 25 Gwei
        
        self.mock_async_web3.eth.fee_history.return_value = asyncio.Future()
        self.mock_async_web3.eth.fee_history.return_value.set_result({
            "reward": [
                [1000000000],  # 1 Gwei
                [2000000000],  # 2 Gwei
                [3000000000]   # 3 Gwei
            ]
        })
        
        self.mock_async_web3.from_wei.side_effect = lambda x, unit: x / 1000000000 if unit == 'gwei' else x
        
        # Run test
        result = await self.service.get_gas_prices()
        
        # Verify
        self.assertEqual(result["gas_price_gwei"], 25.0)
        self.assertEqual(result["base_fee_gwei"], 20.0)
        self.assertEqual(result["priority_fee_low_gwei"], 1.0)
        self.assertEqual(result["priority_fee_med_gwei"], 2.0)
        self.assertEqual(result["priority_fee_high_gwei"], 3.0)
        self.assertEqual(result["block_number"], 15000000)
        
        # Verify Web3 calls
        self.mock_async_web3.eth.get_block.assert_called_once_with('latest')
        self.mock_async_web3.eth.gas_price.assert_called_once()
        self.mock_async_web3.eth.fee_history.assert_called_once()
    
    async def test_get_protocol_data(self):
        """Test getting protocol data."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "markets": [
                {"symbol": "aDAI", "liquidity": 1000000, "apy": 0.03},
                {"symbol": "aUSDC", "liquidity": 2000000, "apy": 0.04}
            ]
        }
        self.mock_client.get.return_value = asyncio.Future()
        self.mock_client.get.return_value.set_result(mock_response)
        
        # Run test
        result = await self.service.get_protocol_data("aave", "markets")
        
        # Verify
        self.assertEqual(result["protocol"], "aave")
        self.assertEqual(result["endpoint"], "markets")
        self.assertEqual(len(result["data"]["markets"]), 2)
        
        # Verify API call
        self.mock_client.get.assert_called_once_with("https://aave-api-v2.aave.com/markets")
    
    async def test_get_cross_chain_bridges(self):
        """Test getting cross-chain bridges."""
        # Run test
        bridges = await self.service.get_cross_chain_bridges()
        
        # Verify
        self.assertEqual(len(bridges), 3)
        self.assertEqual(bridges[0]["name"], "Polygon Bridge")
        self.assertEqual(bridges[1]["name"], "Arbitrum Bridge")
        self.assertEqual(bridges[2]["name"], "Optimism Bridge")
    
    async def test_get_market_sentiment(self):
        """Test getting market sentiment."""
        # Run test
        sentiment = await self.service.get_market_sentiment("ethereum")
        
        # Verify
        self.assertEqual(sentiment["asset"], "ethereum")
        self.assertEqual(sentiment["overall_sentiment"], "neutral")
        self.assertEqual(sentiment["sentiment_score"], 55)
        self.assertIn("social_media", sentiment)
        self.assertIn("news", sentiment)
        self.assertIn("market_indicators", sentiment)


if __name__ == '__main__':
    unittest.main()
