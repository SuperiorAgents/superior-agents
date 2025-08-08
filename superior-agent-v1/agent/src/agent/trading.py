import re
from textwrap import dedent
from typing import Dict, List, Set, Tuple
from datetime import datetime
from src.db import DBInterface

from result import Err, Ok, Result

from src.container import ContainerManager
from src.genner.Base import Genner
from src.client.rag import RAGClient
from src.sensor.trading import TradingSensor
from src.types import ChatHistory, Message


class TradingPromptGenerator:
	"""
	Generator for creating prompts used in trading agent workflows.

	This class is responsible for generating various prompts used by the trading agent,
	including system prompts, research code prompts, strategy prompts, and trading code prompts.
	It handles the substitution of placeholders in prompt templates with actual values.
	"""

	def __init__(self, prompts: Dict[str, str]):
		"""
		Initialize with custom prompts for each function.

		This constructor sets up the prompt generator with either custom prompts
		or default prompts if none are provided. It validates that all required
		prompts are present and properly formatted.

		Args:
		    prompts (Dict[str, str]): Dictionary containing custom prompts for each function
		"""
		if prompts:
			prompts = self.get_default_prompts()
		self._validate_prompts(prompts)
		self.prompts = self.get_default_prompts()

	def _instruments_to_curl_prompt(
		self,
		instruments: List[str],
		txn_service_url: str,
		agent_id: str,
		session_id: str,
	):
		"""
		Convert trading instruments to curl command prompts.

		This method generates curl command examples for each trading instrument,
		which can be included in prompts to show how to interact with the transaction service.

		Args:
		        instruments (List[str]): List of trading instrument types
		        txn_service_url (str): URL of the transaction service
		        agent_id (str): ID of the agent
		        session_id (str): ID of the session

		Returns:
		        str: String containing curl command examples for the specified instruments

		Raises:
		        KeyError: If an unsupported trading instrument is provided
		"""
		try:
			# TODO calling spot is not correct, should call it swap
			mapping = {
				# 	"swap_solana": dedent(f"""
				# 	# Swap solana
				# 	curl -X 'POST' \
				# 	'http://{txn_service_url}/api/v1/swap' \
				# 	-H 'accept: application/json' \
				# 	-H 'Content-Type: application/json' \
				# 	-d '{
				# 		"chainId": "<",
				# 		"tokenIn": "string",
				# 		"chainOut": "string",
				# 		"tokenOut": "string",
				# 		"amountIn": "string",
				# 		"slippage": 0.5
				# 	}'
				# """),
				"spot": dedent(f"""
                curl -X POST "http://{txn_service_url}/api/v1/swap" \\
                -H "Content-Type: application/json" \\
                -H "x-superior-agent-id: {agent_id}" \\
                -H "x-superior-session-id: {session_id}" \\
                -d '{{
                    "tokenIn": "<token_in_address>: str",
                    "tokenOut": "<token_out_address>: str",
                    "normalAmountIn": "<amount>: str",
                    "slippage": "<slippage>: float"
                }}'
            """),
				"futures": dedent(f"""
                # Futures
                curl -X POST "http://{txn_service_url}/api/v1/futures/position" \\
                -H "Content-Type: application/json" \\
                -d '{{
                    "market": "<market_symbol>",
                    "side": "<long|short>",
                    "leverage": "<leverage_multiplier>",
                    "size": "<position_size>",
                    "stop_loss": "<optional_stop_loss_price>",
                    "take_profit": "<optional_take_profit_price>"
                }}'
            """),
				"options": dedent(f"""
                # Options
                curl -X POST "http://{txn_service_url}/api/v1/options/trade" \\
                -H "Content-Type: application/json" \\
                -d '{{
                    "underlying": "<asset_symbol>",
                    "option_type": "<call|put>",
                    "strike_price": "<strike_price>",
                    "expiry": "<expiry_timestamp>",
                    "amount": "<contracts_amount>",
                    "side": "<buy|sell>"
                }}'
            """),
				"defi": dedent(f"""
                # Defi
                curl -X POST "http://{txn_service_url}/api/v1/defi/interact" \\
                -H "Content-Type: application/json" \\
                -d '{{
                    "protocol": "<protocol_name>",
                    "action": "<deposit|withdraw|stake|unstake>",
                    "asset": "<asset_address>",
                    "amount": "<amount>",
                    "pool_id": "<optional_pool_id>",
                    "slippage": "<slippage_tolerance>"
                }}'
            """),
			}
			instruments_str = [mapping[instrument] for instrument in instruments]
			return "\n".join(instruments_str)
		except KeyError as e:
			raise KeyError(
				f"Expected trading_instruments to be in ['spot', 'defi', 'futures', 'options'], {e}"
			)

	@staticmethod
	def _metric_to_metric_prompt(metric_name="wallet"):
		"""
		Convert a metric name to a human-readable description.

		This static method maps metric names to more descriptive phrases
		that can be used in prompts.

		Args:
		        metric_name (str, optional): Name of the metric. Defaults to "wallet".

		Returns:
		        str: Human-readable description of the metric

		Raises:
		        KeyError: If an unsupported metric name is provided
		"""
		try:
			mapping = {"wallet": "your money in a crypto wallet"}

			return mapping[metric_name]
		except KeyError as e:
			raise KeyError(f"Expected to metric_name to be in ['wallet'], {e}")

	def _extract_default_placeholders(self) -> Dict[str, Set[str]]:
		"""
		Extract placeholders from default prompts to use as required placeholders.

		This method analyzes the default prompts to identify all placeholders
		(text surrounded by curly braces) that need to be replaced when generating
		actual prompts.

		Returns:
		        Dict[str, Set[str]]: Dictionary mapping prompt names to sets of placeholders
		"""
		placeholder_pattern = re.compile(r"{([^}]+)}")
		return {
			prompt_name: {
				f"{{{p}}}" for p in placeholder_pattern.findall(prompt_content)
			}
			for prompt_name, prompt_content in self.get_default_prompts().items()
		}

	def _validate_prompts(self, prompts: Dict[str, str]) -> None:
		"""
		Validate prompts for required and unexpected placeholders.

		This method checks that all provided prompts contain the required
		placeholders and don't contain any unexpected ones. It ensures that
		the prompts will work correctly when placeholders are substituted.

		Args:
		        prompts (Dict[str, str]): Dictionary of prompt name to prompt content

		Raises:
		        ValueError: If prompts are missing required placeholders or contain unexpected ones
		"""
		required_placeholders = self._extract_default_placeholders()

		# Check all required prompts exist
		missing_prompts = set(required_placeholders.keys()) - set(prompts.keys())
		if missing_prompts:
			raise ValueError(f"Missing required prompts: {missing_prompts}")

		# Extract placeholders using regex
		placeholder_pattern = re.compile(r"{([^}]+)}")

		# Check each prompt for missing and unexpected placeholders
		for prompt_name, prompt_content in prompts.items():
			if prompt_name not in required_placeholders:
				continue

			# Get actual placeholders in the prompt
			actual_placeholders = {
				f"{{{p}}}" for p in placeholder_pattern.findall(prompt_content)
			}
			required_set = required_placeholders[prompt_name]

			# Check for missing placeholders
			missing = required_set - actual_placeholders
			if missing:
				raise ValueError(
					f"Missing required placeholders in {prompt_name}: {missing}"
				)

			# Check for unexpected placeholders
			unexpected = actual_placeholders - required_set
			if unexpected:
				raise ValueError(
					f"Unexpected placeholders in {prompt_name}: {unexpected}"
				)

	def generate_system_prompt(
		self,
		role: str,
		time: str,
		metric_name: str,
		metric_state: str,
		network: str,
	) -> str:
		"""
		Generate a system prompt for the trading agent.

		This method creates a system prompt that sets the context for the agent,
		including its role, current date, goal, and portfolio state.

		Args:
		        role (str): The role of the agent (e.g., "trader")
		        time (str): Time frame for the trading goal
		        metric_name (str): Name of the metric to maximize
		        metric_state (str): Current state of the metric/portfolio
		        network (str): Blockchain network being used

		Returns:
		        str: Formatted system prompt
		"""
		now = datetime.now()
		today_date = now.strftime("%Y-%m-%d")

		# Parse the metric state to extract available balance
		try:
			metric_data = eval(metric_state)
			if isinstance(metric_data, dict) and "eth_balance_available" in metric_data:
				# Use available balance instead of total balance
				metric_state = str(
					{
						**metric_data,
						"eth_balance": metric_data[
							"eth_balance_available"
						],  # Show only available balance
					}
				)
		except (ValueError, TypeError):
			pass  # Keep original metric_state if parsing fails

		return self.prompts["system_prompt"].format(
			role=role,
			today_date=today_date,
			metric_name=metric_name,
			time=time,
			network=network,
			metric_state=metric_state,
		)

	def generate_research_code_first_time_prompt(self, apis: List[str], network: str):
		"""
		Generate a prompt for the first-time research code generation.

		This method creates a prompt for generating research code when the agent
		has no prior context or history to work with.

		Args:
		        apis (List[str]): List of APIs available to the agent

		Returns:
		        str: Formatted prompt for first-time research code generation
		"""
		apis_str = ",\n".join(apis) if apis else self._get_default_apis_str()

		return self.prompts["research_code_prompt_first"].format(
			apis_str=apis_str, network=network
		)

	def generate_research_code_prompt(
		self,
		notifications_str: str,
		apis: List[str],
		prev_strategy: str,
		rag_summary: str,
		before_metric_state: str,
		after_metric_state: str,
	):
		"""
		Generate a prompt for research code generation with context.

		This method creates a prompt for generating research code when the agent
		has prior context, including notifications, previous strategies, and RAG results.

		Args:
		        notifications_str (str): String containing recent notifications
		        apis (List[str]): List of APIs available to the agent
		        prev_strategy (str): Description of the previous strategy
		        rag_summary (str): Summary from retrieval-augmented generation
		        before_metric_state (str): State of the metric before strategy execution
		        after_metric_state (str): State of the metric after strategy execution

		Returns:
		    str: Formatted prompt for research code generation
		"""
		apis_str = ",\n".join(apis) if apis else self._get_default_apis_str()
		return self.prompts["research_code_prompt"].format(
			notifications_str=notifications_str,
			apis_str=apis_str,
			prev_strategy=prev_strategy,
			rag_summary=rag_summary,
			before_metric_state=before_metric_state,
			after_metric_state=after_metric_state,
		)

	def generate_strategy_prompt(
		self, notifications_str: str, research_output_str: str, network: str
	) -> str:
		"""
		Generate a prompt for strategy formulation.

		This method creates a prompt for generating a trading strategy based on
		notifications and research output.

		Args:
		        notifications_str (str): String containing recent notifications
		        research_output_str (str): Output from the research code
		        network (str): Blockchain network to operate on

		Returns:
		        str: Formatted prompt for strategy formulation
		"""
		return self.prompts["strategy_prompt"].format(
			notifications_str=notifications_str,
			research_output_str=research_output_str,
			network=network,
		)

	def generate_address_research_code_prompt(
		self,
	) -> str:
		"""
		Generate a prompt for researching token addresses.

		This method creates a prompt for generating code that will look up
		token contract addresses using the CoinGecko API.

		Returns:
		        str: Formatted prompt for address research code generation
		"""
		return self.prompts["address_research_code_prompt"].format()

	def generate_trading_code_prompt(
		self,
		strategy_output: str,
		address_research: str,
		trading_instruments: List[str],
		metric_state: str,
		agent_id: str,
		txn_service_url: str,
		session_id: str,
	) -> str:
		"""
		Generate a prompt for trading code generation.

		This method creates a prompt for generating code that will implement
		a trading strategy, including token addresses and trading instruments.

		Args:
		        strategy_output (str): Output from the strategy formulation
		        address_research (str): Results from token address research
		        apis (List[str]): List of APIs available to the agent
		        trading_instruments (List[str]): List of available trading instruments
		        agent_id (str): ID of the agent
		        txn_service_url (str): URL of the transaction service
		        session_id (str): ID of the current session

		Returns:
		        str: Formatted prompt for trading code generation
		"""
		trading_instruments_str = self._instruments_to_curl_prompt(
			instruments=trading_instruments,
			agent_id=agent_id,
			txn_service_url=txn_service_url,
			session_id=session_id,
		)

		return self.prompts["trading_code_prompt"].format(
			strategy_output=strategy_output,
			address_research=address_research,
			trading_instruments_str=trading_instruments_str,
			metric_state=metric_state,
		)

	def generate_trading_code_non_address_prompt(
		self,
		strategy_output: str,
		apis: List[str],
		trading_instruments: List[str],
		agent_id: str,
		txn_service_url: str,
		session_id: str,
	):
		"""
		Generate a prompt for trading code without address research.

		This method creates a prompt for generating code that will implement
		a trading strategy without requiring token address research.

		Args:
		        strategy_output (str): Output from the strategy formulation
		        apis (List[str]): List of APIs available to the agent
		        trading_instruments (List[str]): List of available trading instruments
		        agent_id (str): ID of the agent
		        txn_service_url (str): URL of the transaction service
		        session_id (str): ID of the current session

		Returns:
		        str: Formatted prompt for trading code generation without address research
		"""
		trading_instruments_str = self._instruments_to_curl_prompt(
			instruments=trading_instruments,
			agent_id=agent_id,
			txn_service_url=txn_service_url,
			session_id=session_id,
		)
		apis_str = ",\n".join(apis) if apis else self._get_default_apis_str()
		apis_str += "\n"
		apis_str += trading_instruments_str

		return self.prompts["trading_code_non_address_prompt"].format(
			strategy_output=strategy_output,
			apis_str=apis_str,
			trading_instruments_str=trading_instruments_str,
		)

	def regen_code(self, previous_code: str, errors: str) -> str:
		"""
		Generate a prompt for code regeneration after errors.

		This method creates a prompt for regenerating code that encountered errors
		during execution, providing the original code and error messages.

		Args:
		        previous_code (str): The code that encountered errors
		        errors (str): Error messages from code execution

		Returns:
		        str: Formatted prompt for code regeneration
		"""
		return self.prompts["regen_code_prompt"].format(
			errors=errors, previous_code=previous_code
		)

	@staticmethod
	def _get_default_apis_str() -> str:
		"""
		Get a string representation of default APIs.

		This static method returns a comma-separated string of default APIs
		that can be used when no specific APIs are provided.

		Returns:
		        str: Comma-separated string of default APIs
		"""
		default_apis = [
			"Coingecko (env variables COINGECKO_API_KEY)",
			"Twitter (env variables TWITTER_API_KEY, TWITTER_API_KEY_SECRET)",
			"DuckDuckGo (using the command line `ddgr`)",
		]
		return ",\n".join(default_apis)

	@staticmethod
	def get_default_prompts() -> Dict[str, str]:
		"""Get the complete set of default prompts that can be customized."""
		return {
			"system_prompt": dedent("""
			You are a {role} crypto trader.
			Today's date is {today_date}.
			Your goal is to maximize {metric_name} within {time}.
			Your current portfolio on {network} network is: {metric_state}.
			Note: Do not trade ETH. This is reserved to pay gas fees. Trade WETH instead.
		""").strip(),
			#
			#
			#
			"research_code_prompt_first": dedent("""
			You know nothing about your environment. 
			Please write code using the format below to research the state of the market.
			You have access to the following APIs:
			<APIs>
			{apis_str}
			</APIs>
			You are to print for everything, and raise every error or unexpected behavior of the program so we can catch them.
			```python
			from dotenv import load_dotenv
			import ...

			load_dotenv()

			def main():
				....
			
			main()
			```
		""").strip(),
			#
			#
			#
			"research_code_prompt": dedent("""
			Here is what is going on in your environment right now : 
			<LatestNotification>
			{notifications_str}
			</LatestNotification>
			You have access to these APIs:
			<APIs>
			{apis_str}
			</APIs>
			Your current strategy is: 
			<PrevStrategy>
			{prev_strategy}
			</PrevStrategy>
			For reference, in the past when you encountered a similar situation you reasoned as follows:
			<RAG>
			{rag_summary}
			</RAG>
			The result of this was:
			<BeforeStrategyExecution>
			{before_metric_state}
			</BeforeStrategyExecution>
			<AfterStrategyExecution>
			{after_metric_state}
			</AfterStrategyExecution>
			You are to print for everything, and raise every error or unexpected behavior of the program.
			Please write code using format below to research the state of the market and how best to react to it.
			```python
			from dotenv import load_dotenv
			import ...

			load_dotenv()

			def main():
				....
			
			main()
			```
		""").strip(),
			#
			#
			#
			"strategy_prompt": dedent("""
			You just learnt the following information: 
			<LatestNotification>
			{notifications_str}
			</LatestNotifications>
			<ResearchOutput>
			{research_output_str}
			</ResearchOutput>
			You have access to the following APIs:
			<APIs>
			{apis_str}
			</APIs>
			Decide whether to trade any of the current coins you have on the {network} network, to hold and wait or to do something else using the tools you have. 
			Reason through your decision process below, formulating a strategy. Sketch out the code you would use to implement your strategy.
		""").strip(),
			#
			#
			#
			"address_research_code_prompt": dedent("""
			Please generate some code to get the address of any tokens mentioned above.
			For native tokens on EVM chains (like ethereum, polygon, arbitrum, optimism, etc...) just use burn address 0x0000000000000000000000000000000000000000 or wrapped token like wrapped WETH https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
			Use the CoinGecko API to find the token contract addresses if you do not know them.
			(curl -X GET "https://pro-api.coingecko.com/api/v3/search?query={{ASSUMED_TOKEN_SYMBOL}}&x_cg_pro_api_key={{COINGECKO_API_KEY}}) # To find token symbols
			```json-schema
			{{
			"type": "object",
			"properties": {{
				"coins": {{
					"type": "array",
					"items": {{
						"type": "object",
						"properties": {{
							"id": {{
								"type": "string",
								"description": "Unique identifier for the coin in CoinGecko's system"
							}},
							"name": {{
								"type": "string",
								"description": "Display name of the cryptocurrency"
							}},
							"api_symbol": {{
								"type": "string",
								"description": "Symbol used in API references"
							}},
							"symbol": {{
								"type": "string",
								"description": "Trading symbol of the cryptocurrency"
							}},
							"market_cap_rank": {{
								"type": ["integer", "null"],
								"description": "Ranking by market capitalization, null if not ranked"
							}},
							"thumb": {{
								"type": "string",
								"format": "uri",
								"description": "URL to thumbnail image of coin logo"
							}},
							"large": {{
								"type": "string",
								"format": "uri",
								"description": "URL to large image of coin logo"
							}}
						}},
						"required": ["id", "name", "api_symbol", "symbol", "thumb", "large"]
					}}
				}},
				"exchanges": {{
					"type": "array",
					"description": "List of related exchanges",
					"items": {{
						"type": "object"
					}}
				}},
				"icos": {{
					"type": "array",
					"description": "List of related ICOs",
					"items": {{
						"type": "object"
					}}
				}},
				"categories": {{
					"type": "array",
					"description": "List of related categories",
					"items": {{
						"type": "object"
					}}
				}},
				"nfts": {{
					"type": "array",
					"description": "List of related NFTs",
					"items": {{
						"type": "object"
					}}
				}}
			}},
			"required": ["coins", "exchanges", "icos", "categories", "nfts"]
			}}
			```
			(curl -X GET "https://pro-api.coingecko.com/api/v3/coins/{{COINGECKO_COIN_ID}}?x_cg_pro_api_key={{COINGECKO_API_KEY}}") # To find the address of the symbols
			```json-schema
			{{
				"type": "object",
				"properties": {{
					"id": {{ 
						"type": "string", 
						"description": "CoinGecko unique identifier" 
					}},
					"symbol": {{ 
						"type": "string", 
						"description": "Token trading symbol (lowercase)" 
					}},
					"name": {{ 
						"type": "string", 
						"description": "Token name" 
					}},
					"asset_platform_id": {{ 
						"type": ["string", "null"], 
						"description": "Platform ID if token is on another chain, null if native chain" 
					}},
					"platforms": {{ 
						"type": "object", 
						"description": "Blockchain platforms where token exists with contract addresses, keys are platform IDs, values are addresses"
					}},
					"detail_platforms": {{
						"type": "object",
						"description": "Detailed platform info including decimal places and contract addresses",
						"patternProperties": {{
							"^.*$": {{
								"type": "object",
								"properties": {{
									"decimal_place": {{ "type": ["integer", "null"] }},
									"contract_address": {{ "type": "string" }}
								}}
							}}
						}}
					}}
				}},
				"required": ["id", "platforms"]
			}}
			```
			You are to print for everything, and raise every error or unexpected behavior of the program.
			You are to generate code in the the format below:
			```python
			from dotenv import load_dotenv
			import ...

			load_dotenv()

			def main():
				....
			
			main()
			```
			Please generate the code, and make sure the output are short and concise, you only need to show list of token and its address.
		""").strip(),
			#
			#
			#
			"trading_code_prompt": dedent("""
			Please help debug any code in the following text. Write only the debugged code. If you can't find any code, just say so.
			Text:
			<Strategy>
			{strategy_output}
			</Strategy>
			Here are some token contract addresses that may help you:
			<AddressResearch>
			{address_research}
			</AddressResearch>
			If the code requires a crypto trade to be made, you are to use curl to interact with our API:
			<TradingInstruments>
			{trading_instruments_str}
			</TradingInstruments>
			Make sure you print every step you take in the code for your task.
			Account for everything, and for every failure of the steps, you are to raise exceptions.
			Dont bother try/catching the error, its better to just crash the program if something unexpected happens
			Format the code as follows:
			```python
			import ...

			def main():
			....

			main()

			```
			Please generate the code.
		""").strip(),
			#
			#
			#
			"regen_code_prompt": dedent("""
				Given this errors
				<Errors>
				{errors}
				</Errors>
				And the code it's from
				<Code>
				{latest_response}
				</Code>
				You are to print for everything, and raise every error or unexpected behavior of the program.
				You are to generate new code that does not change or stray from the original code.
				You are to generate code that fixes the error, in this format.
				```python
				from dotenv import load_dotenv
				import ...

				load_dotenv()

				def main():
					....
				
				main()
				```
				Please generate the code that fixes the problem.
		""").strip(),
		}


class TradingAgent:
	"""
	Agent responsible for executing trading strategies based on market data and notifications.

	This class orchestrates the entire trading workflow, including system preparation,
	research code generation, strategy formulation, and trading code execution.
	It integrates with various components like RAG, database, sensors, and code execution
	to create a complete trading agent.
	"""

	def __init__(
		self,
		agent_id: str,
		rag: RAGClient,
		db: DBInterface,
		sensor: TradingSensor,
		genner: Genner,
		container_manager: ContainerManager,
		prompt_generator: TradingPromptGenerator,
	):
		"""
		Initialize the trading agent with all required components.

		Args:
		    agent_id (str): Unique identifier for this agent
		    rag (RAGClient): Client for retrieval-augmented generation
		    db (DBInterface): Database client for storing and retrieving data
		    sensor (TradingSensor): Sensor for monitoring trading-related metrics
		    genner (Genner): Generator for creating code and strategies
		    container_manager (ContainerManager): Manager for code execution in containers
		    prompt_generator (TradingPromptGenerator): Generator for creating prompts
		"""
		self.agent_id = agent_id
		self.db = db
		self.rag = rag
		self.sensor = sensor
		self.genner = genner
		self.container_manager = container_manager
		self.prompt_generator = prompt_generator

		self.chat_history = ChatHistory()

	def reset(self) -> None:
		"""
		Reset the agent's chat history.

		This method clears any existing conversation history to start fresh.
		"""
		self.chat_history = ChatHistory()

	def prepare_system(
		self, role: str, time: str, metric_name: str, metric_state: str, network: str
	) -> ChatHistory:
		"""
		Prepare the system prompt for the agent.

		This method generates the initial system prompt that sets the context
		for the agent's operation, including its role, time context, and metrics.

		Args:
		    role (str): The role of the agent (e.g., "trader")
		    time (str): Current time information
		    metric_name (str): Name of the metric to track
		    metric_state (str): Current state of the metric
		    network (str): Blockchain network to operate on

		Returns:
		    ChatHistory: Chat history with the system prompt
		"""
		ctx_ch = ChatHistory(
			Message(
				role="system",
				content=self.prompt_generator.generate_system_prompt(
					role=role,
					time=time,
					metric_name=metric_name,
					network=network,
					metric_state=metric_state,
				),
			)
		)

		return ctx_ch

	def gen_research_code_on_first(
		self, apis: List[str], network: str
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate research code for the first time.

		This method creates research code when the agent has no prior context,
		using only the available APIs.

		Args:
		    apis (List[str]): List of APIs available to the agent

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with code and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.generate_research_code_first_time_prompt(
					apis=apis,
					network=network,
				),
			)
		)

		gen_result = self.genner.generate_code(self.chat_history + ctx_ch)
		if gen_result.is_err():
			# Return error along with chat history
			return Err(
				f"TradingAgent.gen_research_code_on_first, err: \n{gen_result.unwrap_err()}"
			), ctx_ch

		processed_codes, raw_response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

		if processed_codes is None or not processed_codes:
			return Err(
				"TradingAgent.gen_research_code_on_first: No code could be extracted."
			), ctx_ch

		return Ok(processed_codes[0]), ctx_ch

	def gen_research_code(
		self,
		notifications_str: str,
		apis: List[str],
		prev_strategy: str,
		rag_summary: str,
		before_metric_state: str,
		after_metric_state: str,
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate research code with context.

		This method creates research code when the agent has prior context,
		including notifications, previous strategies, and RAG results.

		Args:
		    notifications_str (str): String containing recent notifications
		    apis (List[str]): List of APIs available to the agent
		    prev_strategy (str): Description of the previous strategy
		    rag_summary (str): Summary from retrieval-augmented generation
		    before_metric_state (str): State of the metric before strategy execution
		    after_metric_state (str): State of the metric after strategy execution

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with code and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.generate_research_code_prompt(
					notifications_str=notifications_str,
					apis=apis,
					prev_strategy=prev_strategy,
					rag_summary=rag_summary,
					before_metric_state=before_metric_state,
					after_metric_state=after_metric_state,
				),
			)
		)

		gen_result = self.genner.generate_code(self.chat_history + ctx_ch)
		if gen_result.is_err():
			# Return error along with chat history
			return Err(
				f"TradingAgent.gen_research_code, err: \n{gen_result.unwrap_err()}"
			), ctx_ch

		processed_codes, raw_response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

		if processed_codes is None or not processed_codes:
			return Err(
				"TradingAgent.gen_research_code: No code could be extracted."
			), ctx_ch

		return Ok(processed_codes[0]), ctx_ch

	def gen_strategy(
		self,
		notifications_str: str,
		research_output_str: str,
		network: str,
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate a trading strategy.

		This method formulates a trading strategy based on notifications
		and research output.

		Args:
		    notifications_str (str): String containing recent notifications
		    research_output_str (str): Output from the research code
		    network (str): Blockchain network to operate on

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with strategy and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.generate_strategy_prompt(
					notifications_str=notifications_str,
					research_output_str=research_output_str,
					network=network,
				),
			)
		)

		gen_result = self.genner.ch_completion(self.chat_history + ctx_ch)

		if err := gen_result.err():
			return Err(f"TradingAgent.gen_strategy, err: \n{err}"), ctx_ch

		response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=response))

		return Ok(response), ctx_ch

	def gen_account_research_code(
		self, strategy_output: str
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate code for researching token addresses.

		This method creates code that will look up token contract addresses
		using the CoinGecko API.

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with code and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.generate_address_research_code_prompt(),
			)
		)

		gen_result = self.genner.generate_code(self.chat_history + ctx_ch)
		if gen_result.is_err():
			# Return error along with chat history
			return Err(
				f"TradingAgent.gen_account_research_code, err: \n{gen_result.unwrap_err()}"
			), ctx_ch

		processed_codes, raw_response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

		if processed_codes is None or not processed_codes:
			return Err(
				"TradingAgent.gen_account_research_code: No code could be extracted."
			), ctx_ch

		return Ok(processed_codes[0]), ctx_ch

	def gen_trading_code(
		self,
		strategy_output: str,
		address_research: str,
		trading_instruments: List[str],
		metric_state: str,
		agent_id: str,
		txn_service_url: str,
		session_id: str,
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate code for implementing a trading strategy.

		This method creates code that will implement a trading strategy,
		including token addresses and trading instruments.

		Args:
		    strategy_output (str): Output from the strategy formulation
		    address_research (str): Results from token address research
		    apis (List[str]): List of APIs available to the agent
		    trading_instruments (List[str]): List of available trading instruments
		    agent_id (str): ID of the agent
		    txn_service_url (str): URL of the transaction service
		    session_id (str): ID of the current session

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with code and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.generate_trading_code_prompt(
					strategy_output=strategy_output,
					address_research=address_research,
					trading_instruments=trading_instruments,
					metric_state=metric_state,
					agent_id=agent_id,
					txn_service_url=txn_service_url,
					session_id=session_id,
				),
			)
		)

		gen_result = self.genner.generate_code(self.chat_history + ctx_ch)
		if gen_result.is_err():
			# Return error along with chat history
			return Err(
				f"TradingAgent.gen_trading_code, err: \n{gen_result.unwrap_err()}"
			), ctx_ch

		processed_codes, raw_response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

		if processed_codes is None or not processed_codes:
			return Err(
				"TradingAgent.gen_trading_code: No code could be extracted."
			), ctx_ch

		return Ok(processed_codes[0]), ctx_ch

	def gen_better_code(
		self, research_code: str, errors: str
	) -> Tuple[Result[str, str], ChatHistory]:
		"""
		Generate improved code after errors.

		This method regenerates code that encountered errors during execution,
		using the original code and error messages to create a fixed version.

		Args:
		    prev_code (str): The code that encountered errors
		    errors (str): Error messages from code execution

		Returns:
		    Result[Tuple[str, ChatHistory], str]: Success with improved code and chat history,
		        or error message
		"""
		ctx_ch = ChatHistory(
			Message(
				role="user",
				content=self.prompt_generator.regen_code(
					research_code,
					errors,
				),
			)
		)

		gen_result = self.genner.generate_code(self.chat_history + ctx_ch)
		if gen_result.is_err():
			# Return error along with chat history
			return Err(
				f"TradingAgent.gen_better_code, err: \n{gen_result.unwrap_err()}"
			), ctx_ch

		processed_codes, raw_response = gen_result.unwrap()
		ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

		if processed_codes is None or not processed_codes:
			return Err(
				"TradingAgent.gen_better_code: No code could be extracted."
			), ctx_ch

		return Ok(processed_codes[0]), ctx_ch
