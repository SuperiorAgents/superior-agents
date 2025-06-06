import json
from datetime import timedelta
from textwrap import dedent
from typing import Callable, List

from loguru import logger
from result import UnwrapError
from dateutil import parser
from src.agent.trading import TradingAgent
from src.datatypes import (
	StrategyData,
	StrategyDataParameters,
	StrategyInsertData,
	WalletStats,
)
from src.helper import nanoid
from src.types import ChatHistory


def assisted_flow(
	agent: TradingAgent,
	session_id: str,
	role: str,
	network: str,
	time: str,
	apis: List[str],
	trading_instruments: List[str],
	metric_name: str,
	prev_strat: StrategyData | None,
	notif_str: str,
	txn_service_url: str,
	summarizer: Callable[[List[str]], str],
):
	"""
	Execute an assisted trading workflow with the trading agent.

	This function orchestrates the complete trading workflow, including research,
	strategy formulation, address research, and trading code execution. It handles
	retries for failed steps and saves the results to the database.

	Args:
	    agent (TradingAgent): The trading agent to use
	    session_id (str): Identifier for the current session
	    role (str): Role of the agent (e.g., "trader")
	    network (str): Blockchain network to operate on
	    time (str): Time frame for the trading goal
	    apis (List[str]): List of APIs available to the agent
	    trading_instruments (List[str]): List of available trading instruments
	    metric_name (str): Name of the metric to track
	    prev_strat (StrategyData | None): Previous strategy, if any
	    notif_str (str | None): Notification string to process
	    txn_service_url (str): URL of the transaction service
	    summarizer (Callable[[List[str]], str]): Function to summarize text

	Returns:
	    None: This function doesn't return a value but logs its progress
	"""
	agent.reset()

	for_training_chat_history = ChatHistory()

	logger.info("Reset agent")
	logger.info("Starting on assisted trading flow")

	metric_fn = agent.sensor.get_metric_fn(metric_name)
	start_metric_state = metric_fn()

	if metric_name == "wallet":
		agent.db.insert_wallet_snapshot(
			snapshot_id=f"{nanoid(4)}-{session_id}-{start_metric_state['wallet_address']}",
			agent_id=agent.agent_id,
			total_value_usd=start_metric_state["total_value_usd"],
			assets=str(start_metric_state),
		)

	if notif_str:
		logger.info(
			f"Getting relevant RAG strategies with `query`: \n{notif_str[:100].strip()}...{notif_str[-100:].strip()}"
		)
		# TOO LONG :
		# len_per_print = 500
		# for i in range(1, int(len(notif_str) / len_per_print) + 1):
		#     logger.info(f"{notif_str[i * len_per_print: (i + 1) * len_per_print]}")
	else:
		logger.info(
			"Getting relevant RAG strategies with `query`: notif_str is empty string."
		)

	related_strategies = agent.rag.relevant_strategy_raw_v4(notif_str)

	rag_result = {
		"summary": "RAG cannot be found",
		"start_metric_state": "Start metric state is missing",
		"end_metric_state": "End metric state is missing",
	}
	rag_errors = []

	if len(related_strategies) > 0:
		most_related_strat, distance = related_strategies[0]

		if distance > 0.5:
			logger.info(
				f"The distance of between fresh key `notif_str` and keys `notif_str` is too high: {distance} > 0.5, ignoring rag..."
			)
		else:
			logger.info(
				f"The distance of between fresh key `notif_str` and keys `notif_str` is acceptable: {distance} <= 0.5."
			)

			try:
				rag_result["summary"] = most_related_strat.summarized_desc
			except Exception as e:
				rag_errors.append(
					"Failed getting `summarized_desc` of RAG strategy data,"  #
					f"`most_related_strat`: \n{most_related_strat},\n"
					f"`err`: \n{e}",
				)

			try:
				if isinstance(most_related_strat.parameters, str):
					params: StrategyDataParameters = json.loads(
						most_related_strat.parameters
					)
				else:
					params = most_related_strat.parameters

				key_notif_str = params.get(
					"notif_str", "Unexpected behavior, should not be empty"
				)

				logger.info(
					f"The key `notif_str` from RAG API is  \n{key_notif_str[:100].strip()}...{key_notif_str[-100:].strip()}"
				)

				if isinstance(params["start_metric_state"], str):
					start_metric_state: WalletStats = json.loads(
						params["start_metric_state"]
					)
				else:
					start_metric_state = params["start_metric_state"]

				rag_result["start_metric_state"] = json.dumps(start_metric_state)
			except Exception as e:
				rag_errors.append(
					"Failed getting `start_metric_state` of RAG strategy data,"  #
					f"`params`: \n{params},\n"
					f"`err`: \n{e}",
				)

			try:
				timedelta_hours = {
					"1h": 1,
					"12h": 12,
					"24h": 24,
				}.get(time, 24)

				if isinstance(most_related_strat.created_at, str):
					created_at = parser.parse(most_related_strat.created_at)
				else:
					created_at = most_related_strat.created_at

				target_time = created_at + timedelta(hours=timedelta_hours)

				snapshot = agent.db.find_wallet_snapshot(
					start_metric_state["wallet_address"], target_time
				)

				if not snapshot:
					raise Exception("No snapshot found")

				rag_result["end_metric_state"] = json.dumps(snapshot["assets"])
			except Exception as e:
				rag_errors.append(
					"Failed getting `end_metric_state` of RAG strategy data,"  #
					f"`timedelta_hours`: {timedelta_hours},\n"
					f"`created_at`: {created_at}, \n"
					f"`target_time`: {target_time}, \n"
					f"`start_metric_state['wallet_address']: {start_metric_state['wallet_address']}"
					f"`err`: \n{e}"
				)
	else:
		logger.info("No related strategies found...")

	rag_summary = rag_result["summary"]
	rag_start_metric_state = rag_result["start_metric_state"]
	rag_end_metric_state = rag_result["end_metric_state"]

	if len(rag_errors) > 0:
		for error in rag_errors:
			logger.error(error)

	logger.info(f"RAG `rag_start_metric_state`: {rag_start_metric_state}")
	logger.info(f"RAG `rag_end_metric_state`: {rag_end_metric_state}")
	logger.info(f"RAG `rag_summary`: {rag_summary}")

	logger.info(f"Using metric: {metric_name}")
	logger.info(f"Current state of the metric: {start_metric_state}")

	new_ch = agent.prepare_system(
		role=role,
		time=time,
		metric_name=metric_name,
		network=network,
		metric_state=str(start_metric_state),
	)
	agent.chat_history += new_ch
	for_training_chat_history += new_ch

	logger.info("Initialized system prompt")

	logger.info("Attempt to generate research code...")
	research_code = ""
	err_acc = ""
	regen = False
	success = False
	for i in range(3):
		try:
			if regen:
				logger.info("Attempt to regenerate research code...")

				if new_ch.get_latest_instruction() == "":
					logger.warning("No instruction found on chat history")
				if new_ch.get_latest_response() == "":
					logger.warning("No response found on chat history")

				research_code_result, new_ch = agent.gen_better_code(
					research_code=new_ch.get_latest_response(),
					errors=err_acc,
				)
				research_code = research_code_result.unwrap()
			else:
				if not prev_strat:
					research_code_result, new_ch = agent.gen_research_code_on_first(
						apis=apis, network=network
					)
					research_code = research_code_result.unwrap()
				else:
					research_code_result, new_ch = agent.gen_research_code(
						notifications_str=notif_str if notif_str else "Fresh",
						prev_strategy=prev_strat.summarized_desc if prev_strat else "",
						apis=apis,
						rag_summary=rag_summary,
						before_metric_state=str(rag_start_metric_state) or "",
						after_metric_state=str(rag_end_metric_state) or "",
					)
					research_code = research_code_result.unwrap()

			# logger.info(f"Response: {new_ch.get_latest_response()}")
			# Temporarily avoid new chat to reduce cost
			# agent.chat_history += new_ch
			for_training_chat_history += new_ch

			logger.info("Running the resulting research code in conatiner...")
			code_execution_result = agent.container_manager.run_code_in_con(
				research_code, "trader_research_code"
			)
			research_code_output, _ = code_execution_result.unwrap()

			success = True
			break
		except UnwrapError as e:
			e = e.result.err()
			if regen:
				logger.error(f"Regen failed on research code generation..., err: \n{e}")
			else:
				logger.error(f"Failed on first research code generation..., err: \n{e}")
			regen = True
			err_acc += f"\n{str(e)}"

	if not success:
		logger.info(
			"Failed generating research after 3 times... Stopping this cycle..."
		)
		return
	logger.info("Succeeded in generating research...")
	logger.info(f"Research :\n{research_code_output}")

	logger.info("Attempt to generate strategy...")
	err_acc = ""
	regen = False
	success = False
	for i in range(3):
		try:
			if regen:
				logger.info("Regenning on strategy..")

			strategy_output_result, new_ch = agent.gen_strategy(
				notifications_str=notif_str if notif_str else "Fresh",
				research_output_str=research_code_output,
				network=network,
			)
			strategy_output = strategy_output_result.unwrap()

			# logger.info(f"Response: {new_ch.get_latest_response()}")
			# Temporarily avoid new chat to reduce cost
			# agent.chat_history += new_ch
			for_training_chat_history += new_ch

			success = True
			break
		except UnwrapError as e:
			e = e.result.err()
			if regen:
				logger.error(f"Regen failed on strategy generation, err: \n{e}")
			else:
				logger.error(f"Failed on first strategy generation, err: \n{e}")
			regen = True
			err_acc += f"\n{str(e)}"

	if not success:
		logger.info(
			"Failed generating strategy after 3 times... Stopping this cycle..."
		)
		return
	else:
		logger.info("Succeeded generating strategy")
		logger.info(f"Strategy :\n{strategy_output}")

	logger.info("Generating address research code...")
	address_research_code = ""
	err_acc = ""
	regen = False
	success = False
	for i in range(10):
		try:
			if regen:
				logger.info("Regenning on address research...")

				if new_ch.get_latest_instruction() == "":
					logger.warning("No instruction found on chat history")
				if new_ch.get_latest_response() == "":
					logger.warning("No response found on chat history")

				address_research_code_result, new_ch = agent.gen_better_code(
					research_code=new_ch.get_latest_response(),
					errors=err_acc,
				)
				address_research_code = address_research_code_result.unwrap()
			else:
				address_research_code_result, new_ch = agent.gen_account_research_code(
					strategy_output=strategy_output
				)
				address_research_code = address_research_code_result.unwrap()

			# logger.info(f"Response: {new_ch.get_latest_response()}")
			# Temporarily avoid new chat to reduce cost
			# agent.chat_history += new_ch
			for_training_chat_history += new_ch

			logger.info("Running the resulting address research code in conatiner...")
			code_execution_result = agent.container_manager.run_code_in_con(
				address_research_code, "trader_address_research"
			)
			address_research_output, _ = code_execution_result.unwrap()
			success = True
			break
		except UnwrapError as e:
			e = e.result.err()
			if regen:
				logger.error(f"Regen failed on address research, err: \n{e}")
			else:
				logger.error(f"Failed on first address research code, err: \n{e}")
			regen = True
			err_acc += f"\n{str(e)}"

	if not success:
		logger.info(
			"Failed generating address research code after 3 times... Stopping this cycle..."
		)
		return

	logger.info("Succeeded address research")
	logger.info(f"Address research: \n{address_research_output}")

	logger.info("Generating some trading code")
	trading_code = ""
	err_acc = ""
	code_output = ""
	success = False
	regen = False
	for i in range(3):
		try:
			if regen:
				logger.info("Regenning on trading code...")

				if new_ch.get_latest_instruction() == "":
					logger.warning("No instruction found on chat history")
				if new_ch.get_latest_response() == "":
					logger.warning("No response found on chat history")

				trading_code_result, new_ch = agent.gen_better_code(
					research_code=new_ch.get_latest_response(),
					errors=err_acc,
				)
				trading_code = trading_code_result.unwrap()
			else:
				trading_code_result, new_ch = agent.gen_trading_code(
					strategy_output=strategy_output,
					address_research=address_research_output,
					trading_instruments=trading_instruments,
					metric_state=str(start_metric_state),
					agent_id=agent.agent_id,
					txn_service_url=txn_service_url,
					session_id=session_id,
				)
				trading_code = trading_code_result.unwrap()

			# logger.info(f"Response: {new_ch.get_latest_response()}")
			# Temporarily avoid new chat to reduce cost
			# agent.chat_history += new_ch
			for_training_chat_history += new_ch

			logger.info("Running the resulting trading code in conatiner...")
			code_execution_result = agent.container_manager.run_code_in_con(
				trading_code, "trader_trading_code"
			)
			trading_code_output, _ = code_execution_result.unwrap()
			success = True
			break
		except UnwrapError as e:
			e = e.result.err()
			if regen:
				logger.error(f"Regen failed on trading code, err: \n{e}")
			else:
				logger.error(f"Failed on first trading code, err: \n{e}")
			regen = True
			err_acc += f"\n{str(e)}"

	if not success:
		logger.info("Failed generating output of trading code after 3 times...")
	else:
		logger.info("Succeeded generating output of trading code!")
		logger.info(f"Output: \n{trading_code_output}")

	agent.db.insert_chat_history(session_id, for_training_chat_history)

	end_metric_state = metric_fn()
	agent.db.insert_wallet_snapshot(
		snapshot_id=f"{nanoid(8)}-{session_id}-{start_metric_state['wallet_address']}",
		agent_id=agent.agent_id,
		total_value_usd=start_metric_state["total_value_usd"],
		assets=json.dumps(end_metric_state),
	)

	summarized_state_change = dedent(f"""
        Holdings Before: {str(start_metric_state).replace("\n", "")}
        USD Value Before: {start_metric_state["total_value_usd"]}
        Holdings After: {str(end_metric_state).replace("\n", "")}
        USD Value After: {end_metric_state["total_value_usd"]}
    """)

	summarized_code = summarizer(
		[
			trading_code,
			"Summarize the code above in points",
		]
	)
	logger.info("Summarizing code...")
	logger.info(f"Summarized code: \n{summarized_code}")

	logger.info("Saving strategy and its result...")
	agent.db.insert_strategy_and_result(
		agent_id=agent.agent_id,
		strategy_result=StrategyInsertData(
			summarized_desc=summarizer([strategy_output]),
			full_desc=strategy_output,
			parameters={
				"apis": apis,
				"trading_instruments": trading_instruments,
				"metric_name": metric_name,
				"start_metric_state": json.dumps(start_metric_state),
				"end_metric_state": json.dumps(end_metric_state),
				"summarized_state_change": summarized_state_change,
				"summarized_code": summarized_code,
				"code_output": code_output,
				"prev_strat": prev_strat.summarized_desc if prev_strat else "",
				"wallet_address": start_metric_state["wallet_address"],
				"notif_str": notif_str,
			},
			strategy_result="failed" if not success else "success",
		),
	)
	logger.info("Saved, quitting and preparing for next run...")
