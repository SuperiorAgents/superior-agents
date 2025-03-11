import sys
from typing import Callable, List

from loguru import logger
from result import UnwrapError
from src.agent.marketing import MarketingAgent
from src.datatypes import StrategyData, StrategyInsertData


def unassisted_flow(
    agent: MarketingAgent,
    session_id: str,
    role: str,
    time: str,
    apis: List[str],
    metric_name: str,
    prev_strat: StrategyData | None,
    notif_str: str | None,
    summarizer: Callable[[List[str]], str],
):
    """
    Execute an unassisted marketing workflow with the marketing agent.

    This function orchestrates the complete marketing workflow, including research,
    strategy formulation, and marketing code execution. It handles retries for
    failed steps and saves the results to the database.

    Args:
        agent (MarketingAgent): The marketing agent to use
        session_id (str): Identifier for the current session
        role (str): Role of the agent (e.g., "influencer")
        time (str): Time frame for the marketing goal
        apis (List[str]): List of APIs available to the agent
        metric_name (str): Name of the metric to track
        prev_strat (StrategyData | None): Previous strategy, if any
        notif_str (str | None): Notification string to process
        summarizer (Callable[[List[str]], str]): Function to summarize text

    Returns:
        None: This function doesn't return a value but logs its progress
    """
    agent.reset()
    logger.info("Reset agent")
    logger.info("Starting on assisted trading flow")

    start_metric_state = str(agent.sensor.get_metric_fn(metric_name)())

    try:
        assert notif_str is not None
        related_strategies = agent.rag.relevant_strategy_raw(notif_str)

        assert len(related_strategies) != 0
        most_related_strat = related_strategies[0]

        rag_summary = most_related_strat.summarized_desc
        rag_before_metric_state = most_related_strat.parameters["start_metric_state"]
        rag_after_metric_state = most_related_strat.parameters["end_metric_state"]
        logger.info(f"Using related RAG summary {rag_summary}")
    except (AssertionError, Exception) as e:
        if isinstance(e, Exception):
            logger.warning(f"Error retrieving RAG strategy: {str(e)}")

        rag_summary = "Unable to retrieve a relevant strategy from RAG handler..."
        rag_before_metric_state = (
            "Unable to retrieve a relevant strategy from RAG handler..."
        )
        rag_after_metric_state = (
            "Unable to retrieve a relevant strategy from RAG handler..."
        )
        logger.info("Not using any strategy from a RAG...")

    logger.info(f"Using metric: {metric_name}")
    logger.info(f"Current state of the metric: {start_metric_state}")
    agent.chat_history = agent.prepare_system(
        role=role, time=time, metric_name=metric_name, metric_state=start_metric_state
    )
    logger.info("Initialized system prompt")

    logger.info("Attempt to generate research code...")
    research_code = ""
    research_code_output = ""
    research_code_success = False
    err_acc = ""
    regen = False
    for i in range(3):
        try:
            if regen:
                research_code, new_ch = agent.gen_better_code(
                    research_code, err_acc
                ).unwrap()
            else:
                if not prev_strat:
                    research_code, new_ch = agent.gen_research_code_on_first(
                        apis
                    ).unwrap()
                else:
                    research_code, new_ch = agent.gen_research_code(
                        notifications_str=notif_str if notif_str else "Fresh",
                        prev_strategy=prev_strat.summarized_desc if prev_strat else "",
                        rag_summary=rag_summary,
                        before_metric_state=rag_before_metric_state,
                        after_metric_state=rag_after_metric_state,
                    ).unwrap()

            logger.info(f"Response: {new_ch.get_latest_response()}")

            # Temporarily avoid new chat to reduce cost
            # agent.chat_history += new_ch
            agent.db.insert_chat_history(session_id, new_ch)

            logger.info("Running the research code in conatiner...")
            code_execution_result = agent.container_manager.run_code_in_con(
                research_code, "trader_research_code"
            )
            research_code_output, _ = code_execution_result.unwrap()

            research_code_success = True
            break
        except UnwrapError as e:
            e = e.result.err()
            if regen:
                logger.error(f"Regen failed on research code generation..., err: \n{e}")
            else:
                logger.error(f"Failed on first research code generation..., err: \n{e}")
            regen = True
            err_acc += f"\n{str(e)}"

    if not research_code_success:
        logger.info(
            "Failed generating research after 3 times... Stopping this cycle..."
        )
        return
    logger.info("Succeeded in generating research...")
    logger.info(f"Research :\n{research_code_output}")

    logger.info("Attempt to generate strategy...")
    strategy_success = False
    err_acc = ""
    regen = False
    for i in range(3):
        try:
            if regen:
                logger.info("Regenning on strategy..")

            strategy_output, new_ch = agent.gen_strategy(
                notifications_str=notif_str if notif_str else "Fresh",
                research_output_str=research_code_output,
                metric_name=metric_name,
                time=time,
            ).unwrap()

            logger.info(f"Response: {new_ch.get_latest_response()}")
            # Temporarily avoid new chat to reduce cost
            # agent.chat_history += new_ch
            agent.db.insert_chat_history(session_id, new_ch)

            strategy_success = True
            break
        except UnwrapError as e:
            e = e.result.err()
            if regen:
                logger.error(f"Regen failed on strategy generation, err: \n{e}")
            else:
                logger.error(f"Failed on first strategy generation, err: \n{e}")
            regen = True
            err_acc += f"\n{str(e)}"

    if not strategy_success:
        logger.info(
            "Failed generating strategy after 3 times... Stopping this cycle..."
        )
        return

    logger.info("Succeeded generating strategy")
    logger.info(f"Strategy :\n{strategy_output}")

    logger.info("Generating some marketing code")
    marketing_code = ""
    marketing_code_output = ""
    marketing_code_success = False
    err_acc = ""
    regen = False
    for i in range(3):
        try:
            if regen:
                logger.info("Regenning on marketing code...")
                marketing_code, new_ch = agent.gen_better_code(
                    marketing_code, err_acc
                ).unwrap()
            else:
                marketing_code, new_ch = agent.gen_marketing_code(
                    strategy_output=strategy_output,
                    apis=apis,
                ).unwrap()

                logger.info(f"Response: {new_ch.get_latest_response()}")

            # No appending old chat
            # agent.chat_history += new_ch
            agent.db.insert_chat_history(session_id, new_ch)

            logger.info("Running the marketing code in conatiner...")
            code_execution_result = agent.container_manager.run_code_in_con(
                marketing_code, "marketing_market_on_daily"
            )
            marketing_code_output, reflected_code = code_execution_result.unwrap()

            marketing_code_success = True

            break
        except UnwrapError as e:
            e = e.result.err()
            if regen:
                logger.error(f"Regen failed on marketing code, err: \n{e}")
            else:
                logger.error(f"Failed on first marketing code, err: \n{e}")
            regen = True
            err_acc += f"\n{str(e)}"

    if not marketing_code_success:
        logger.info("Failed generating output of marketing code after 3 times...")
    else:
        logger.info("Succeeded generating output of marketing code!")
        logger.info(f"Output: \n{marketing_code_output}")

    end_metric_state = str(agent.sensor.get_metric_fn(metric_name)())
    summarized_state_change = summarizer(
        [
            f"This is the start state {start_metric_state}",
            f"This is the end state {end_metric_state}",
            "Summarize the state changes of the above",
        ]
    )
    logger.info("Summarizing state change...")
    logger.info(f"Summarized state change: \n{summarized_state_change}")
    summarized_code = summarizer(
        [
            marketing_code_output,
            "Summarize the code",
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
                "trading_instruments": [],
                "metric_name": metric_name,
                "start_metric_state": start_metric_state,
                "end_metric_state": end_metric_state,
                "summarized_state_change": summarized_state_change,
                "summarized_code": summarized_code,
                "code_output": marketing_code_output,
                "prev_strat": prev_strat.summarized_desc if prev_strat else "",
            },
            strategy_result="failed" if not strategy_success else "success",
        ),
    )
    logger.info("Saved, quitting and preparing for next run...")
