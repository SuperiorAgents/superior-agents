from textwrap import dedent
from typing import Dict, List

FE_DATA_MARKETING_DEFAULTS = {
	"model": "deepseek_v3_or",
	"role": "terse, funny, curious, philosophical",
	"time": "24h",
	"metric_name": "followers",
	"research_tools": [
		"Twitter",
		"CoinGecko",
		"DuckDuckGo",
	],
	"notifications": ["twitter"],
	"twitter_access_token": "",
	"prompts": {},
}

FE_DATA_TRADING_DEFAULTS = {
	"model": "deepseek_v3_or",
	"role": "terse, funny, curious, philosophical",
	"network": "ethereum",
	"time": "24h",
	"metric_name": "wallet",
	"research_tools": [
		"CoinGecko",
		"DuckDuckGo",
	],
	"prompts": {},
	"notifications": ["twitter"],
	"trading_instruments": ["spot"],
}


SERVICE_TO_PROMPT = {
	"Twitter": "Twitter (env vars TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_BEARER_TOKEN, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET)",
	# "CoinMarketCap": "CoinMarketCap (env vars ??)",
	"CoinGecko": dedent("""
		<CoinGeckoTrendingCoins>
		curl -X GET "https://pro-api.coingecko.com/api/v3/search/trending?x_cg_pro_api_key={{COINGECKO_API_KEY}}" # To find trending coins
		{{
			"type": "object",
			"required": [
				"coins"
			],
			"properties": {{
				"coins": {{
					"type": "array",
					"description": "List of trending cryptocurrencies",
					"items": {{
						"type": "object",
						"required": [
							"item"
						],
						"properties": {{
							"item": {{
								"type": "object",
								"required": [
									"id",
									"symbol",
									"market_cap_rank",
									"slug",
									"platforms"
								],
								"properties": {{
									"id": {{
										"type": "string",
										"description": "Unique identifier for the coin"
									}},
									"symbol": {{
										"type": "string",
										"description": "Trading symbol"
									}},
									"market_cap_rank": {{
										"type": "integer",
										"description": "Ranking by market cap"
									}},
									"slug": {{
										"type": "string",
										"description": "URL-friendly identifier"
									}},
									"platforms": {{
										"type": "object",
										"description": "Available blockchain platforms and contract addresses",
										"additionalProperties": {{
											"type": "string",
											"description": "Contract address on the platform"
										}}
									}},
									"data": {{
										"type": "object",
										"properties": {{
											"price": {{
												"type": "number",
												"description": "Current price in USD"
											}},
											"price_change_percentage_24h": {{
												"type": "object",
												"description": "24-hour price changes",
												"properties": {{
													"usd": {{
														"type": "number",
														"description": "24h change in USD"
													}}
												}}
											}},
											"market_cap": {{
												"type": "string",
												"description": "Market capitalization"
											}},
											"total_volume": {{
												"type": "string",
												"description": "24h trading volume"
											}}
										}}
									}}
								}}
							}}
						}}
					}}
				}}
			}}
		}}
		```
		</CoinGeckoTrendingCoins>
		<CoinGeckoSearch>
		curl -X GET "https://pro-api.coingecko.com/api/v3/search?query={{ASSUMED_TOKEN_SYMBOL}}&x_cg_pro_api_key={{COINGECKO_API_KEY}} # To find address given the token symbol
		```return-json-schema
		{{
			"$schema": "http://json-schema.org/draft-07/schema#",
			"title": "CoinGecko Search Data Schema",
			"type": "object",
			"required": ["coins"],
			"properties": {{
				"coins": {{
					"type": "array",
					"description": "Search results for cryptocurrencies",
					"items": {{
						"type": "object",
						"required": ["id", "symbol", "market_cap_rank"],
						"properties": {{
							"id": {{
								"type": "string",
								"description": "Unique identifier for the coin"
							}},
							"name": {{
								"type": "string",
								"description": "Name of the cryptocurrency"
							}},
							"symbol": {{
								"type": "string",
								"description": "Trading symbol"
							}},
							"market_cap_rank": {{
								"type": ["integer", "null"],
								"description": "Ranking by market cap, null if unranked"
							}},
							"platforms": {{
								"type": "object",
								"description": "Available blockchain platforms and contract addresses",
								"additionalProperties": {{
									"type": "string",
									"description": "Contract address on the platform"
								}}
							}}
						}}
					}}
				}}
			}}
		}}
		</CoinGeckoSearch>
	"""),
	"DuckDuckGo": "DuckDuckGo (command line `ddgr`) (example usage `ddgr --json x` to search for x)",
	"Etherscan": "Etherscan (env vars ETHERSCAN_API_KEY)",
	# "Arbiscan": "Arbiscan (env vars ??)",
	# "Basescan": "Basescan (env vars ??)",
	# "Alchemy": "Alchemy (env vars ??)",
	"Infura": "Infura (env vars INFURA_PROJECT_ID)",
}

SERVICE_TO_ENV: Dict[str, List[str]] = {
	"Twitter": [
		"TWITTER_API_KEY",
		"TWITTER_API_KEY_SECRET",
		"TWITTER_ACCESS_TOKEN",
		"TWITTER_ACCESS_TOKEN_SECRET",
		"TWITTER_BEARER_TOKEN",
	],
	"CoinGecko": [
		"COINGECKO_API_KEY",
	],
	"DuckDuckGo": [],
	"Etherscan": [
		"ETHERSCAN_API_KEY",
	],
	"Infura": [
		"INFURA_PROJECT_ID",
	],
}
