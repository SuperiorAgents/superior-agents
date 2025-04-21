import os
import re

import inquirer

from src.db import SQLiteDB
from tests.mock_client.rag import MockRAGClient
from tests.mock_client.interface import RAGInterface
from tests.mock_sensor.trading import MockTradingSensor
from tests.mock_sensor.marketing import MockMarketingSensor
from src.sensor.interface import TradingSensorInterface, MarketingSensorInterface
from src.db import APIDB, DBInterface, SQLiteDB
from typing import Callable, List, Tuple
from src.agent.marketing import MarketingAgent, MarketingPromptGenerator
from src.agent.trading import TradingAgent, TradingPromptGenerator
from src.datatypes import StrategyData
from src.container import ContainerManager
from src.manager import fetch_fe_data
from src.helper import services_to_envs, services_to_prompts
from src.genner import get_genner
from src.genner.Base import Genner
from src.client.openrouter import OpenRouter
from src.summarizer import get_summarizer
from anthropic import Anthropic
import docker
from functools import partial
from src.flows.trading import assisted_flow as trading_assisted_flow
from src.flows.marketing import unassisted_flow as marketing_unassisted_flow
from loguru import logger

def start_marketing_agent(
    agent_type: str,
    session_id: str,
    agent_id: str,
    fe_data: dict,
    genner: Genner,
    rag: RAGInterface,
    sensor: MarketingSensorInterface,
    db: DBInterface,
    stream_fn: Callable[[str], None] = lambda x: print(x, flush=True, end=""),
):
    role = fe_data["role"]
    time_ = fe_data["time"]
    metric_name = fe_data["metric_name"]
    notif_sources = fe_data["notifications"]
    services_used = fe_data["research_tools"]

    in_con_env = services_to_envs(services_used)
    apis = services_to_prompts(services_used)

    if fe_data["model"] == "deepseek":
        fe_data["model"] = "deepseek_or"

    
    prompt_generator = MarketingPromptGenerator(fe_data["prompts"])

    container_manager = ContainerManager(
        docker.from_env(),
        "agent-executor",
        "./code",
        in_con_env=in_con_env,
    )
    
    summarizer = get_summarizer(genner)
    previous_strategies = db.fetch_all_strategies(agent_id)

    rag.save_result_batch(previous_strategies)

    agent = MarketingAgent(
        agent_id=agent_id,
        sensor=sensor,
        genner=genner,
        container_manager=container_manager,
        prompt_generator=prompt_generator,
        db=db,
        rag=rag,
    )

    flow_func = partial(
        marketing_unassisted_flow,
        agent=agent,
        session_id=session_id,
        role=role,
        time=time_,
        apis=apis,
        metric_name=metric_name,
        summarizer=summarizer,
    )

    run_cycle(
        agent,
        notif_sources,
        flow_func,
        db,
        session_id,
        agent_id,
        fe_data if agent_type == "marketing" else None,
    )


def start_trading_agent(
    agent_type: str,
    session_id: str,
    agent_id: str,
    fe_data: dict,
    genner: Genner,
    rag: RAGInterface,
    sensor: TradingSensorInterface,
    db: DBInterface,
    stream_fn: Callable[[str], None] = lambda x: print(x, flush=True, end=""),
):
    role = fe_data["role"]
    network = fe_data["network"]
    services_used = fe_data["research_tools"]
    trading_instruments = fe_data["trading_instruments"]
    metric_name = fe_data["metric_name"]
    notif_sources = fe_data["notifications"]
    time_ = fe_data["time"]

    in_con_env = services_to_envs(services_used)
    apis = services_to_prompts(services_used)
    if fe_data["model"] == "deepseek":
        fe_data["model"] = "deepseek_or"

    
    prompt_generator = TradingPromptGenerator(prompts=fe_data["prompts"])

    container_manager = ContainerManager(
        docker.from_env(),
        "agent-executor",
        "./code",
        in_con_env=in_con_env,
    )
    
    summarizer = get_summarizer(genner)
    previous_strategies = db.fetch_all_strategies(agent_id)

    rag.save_result_batch(previous_strategies)

    agent = TradingAgent(
        agent_id=agent_id,
        sensor=sensor,
        genner=genner,
        container_manager=container_manager,
        prompt_generator=prompt_generator,
        db=db,
        rag=rag,
    )

    flow_func = partial(
        trading_assisted_flow,
        agent=agent,
        session_id=session_id,
        role=role,
        network=network,
        time=time_,
        apis=apis,
        trading_instruments=trading_instruments,
        metric_name=metric_name,
        txn_service_url=os.environ['TXN_SERVICE_URL'],
        summarizer=summarizer,
    )

    run_cycle(
        agent,
        notif_sources,
        flow_func,
        db,
        session_id,
        agent_id,
        fe_data if agent_type == "marketing" else None,
    )

def run_cycle(
    agent: TradingAgent | MarketingAgent,
    notif_sources: list[str],
    flow: Callable[[StrategyData | None, str | None], None],
    db: DBInterface,
    session_id: str,
    agent_id: str,
    fe_data: dict | None = None,
):
    prev_strat = agent.db.fetch_latest_strategy(agent.agent_id)
    if prev_strat is not None:
        logger.info(f"Previous strat is {prev_strat}")
        agent.rag.save_result_batch([prev_strat])

    notif_limit = 5 if fe_data is None else 2  # trading uses 5, marketing uses 2
    current_notif = agent.db.fetch_latest_notification_str_v2(
        notif_sources, notif_limit
    )
    logger.info(f"Latest notification is {current_notif}")
    logger.info("Added the previous strat onto the RAG manager")

    flow(prev_strat=prev_strat, notif_str=current_notif)
    db.add_cycle_count(session_id, agent_id)
    
def starter_prompt():
    questions = [
        inquirer.List('name', message="What LLM model agent will run? (Use space to choose)", choices=['OpenAI (openrouter)','Gemini (openrouter)','Claude', 'Mock LLM'], default=['Gemini (openrouter)']),
        inquirer.Password('oai_api_key', message="Please enter the OpenAI API key for RAG "),
        inquirer.Password('or_api_key', message="Please enter the Openrouter API key"),
        inquirer.Password('claude_api_key', message="Please enter the Claude API key"),
        inquirer.List(name='agent_type', message="Please choose agent type?", choices=['trading', 'marketing'], default=['trading'])
    ]
    answers = inquirer.prompt(questions)
    if not answers:
        raise Exception("Please input")

    os.environ['OAI_API_KEY'] = answers['oai_api_key'] # type: ignore
    os.environ['DEEPSEEK_OPENROUTER_API_KEY'] = answers['or_api_key'] # type: ignore
    os.environ['TXN_SERVICE_URL'] = 'http://localhost:9009'
    os.environ['ANTHROPIC_API_KEY'] = answers['claude_api_key']
    fe_data = fetch_fe_data(answers['agent_type'])
    if answers['name'] == 'Mock LLM':
        fe_data['model'] = 'mock'
    or_client = OpenRouter(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ['DEEPSEEK_OPENROUTER_API_KEY'],
        include_reasoning=True,
    )
    anthropic_client = Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

    genner = get_genner(
        fe_data["model"],
        # deepseek_deepseek_client=deepseek_deepseek_client,
        or_client=or_client,
        # deepseek_local_client=deepseek_local_client,
        anthropic_client=anthropic_client,
        stream_fn=lambda token: print(token, end="", flush=True),
    )
    summarizer_genner = get_genner(
        "deepseek_v3_or", stream_fn=lambda x: None, or_client=or_client
    )
    if answers['agent_type'] == 'marketing':
        start_marketing_agent(
            agent_type=answers['agent_type'], 
            session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            fe_data=fe_data,
            genner=genner,
            db=SQLiteDB(db_path="db/superior-agents.db"),
            rag=MockRAGClient(
                session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            ),
            sensor=MockMarketingSensor()
        )
    elif answers['agent_type'] == 'trading':
        start_trading_agent(
            agent_type=answers['agent_type'], 
            session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            fe_data=fe_data,
            genner=genner,
            db=SQLiteDB(db_path="db/superior-agents.db"),
            rag=MockRAGClient(
                session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
            ),
            sensor=MockTradingSensor(
                eth_address="",infura_project_id="",etherscan_api_key=""
            )
        )

if __name__ == '__main__':
    starter_prompt()