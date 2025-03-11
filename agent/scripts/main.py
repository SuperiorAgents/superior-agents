import dataclasses
from datetime import datetime
import json
import os
import sys
import time
from functools import partial
from typing import Callable, List, Tuple

import requests
import tweepy
from anthropic import Anthropic
from dotenv import load_dotenv
from duckduckgo_search import DDGS
from loguru import logger
from openai import OpenAI

import docker
from src.agent.marketing import MarketingAgent, MarketingPromptGenerator
from src.agent.trading import TradingAgent, TradingPromptGenerator
from src.container import ContainerManager
from src.datatypes import StrategyData
from src.db import APIDB
from src.flows.marketing import unassisted_flow as marketing_unassisted_flow
from src.flows.trading import assisted_flow as trading_assisted_flow
from src.genner import get_genner
from src.helper import services_to_envs, services_to_prompts
from src.manager import ManagerClient
from src.client.rag import RAGClient
from src.sensor.marketing import MarketingSensor
from src.sensor.trading import TradingSensor
from src.summarizer import get_summarizer
from src.twitter import TweepyTwitterClient
from src.client.openrouter import OpenRouter

load_dotenv()

# Research tools
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY") or ""
TWITTER_API_SECRET = os.getenv("TWITTER_API_KEY_SECRET") or ""
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN") or ""
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN") or ""
TWITTER_ACCESS_TOKEN_SECRET = os.getenv("TWITTER_ACCESS_TOKEN_SECRET") or ""

RESEARCH_TWITTER_API_KEY = os.getenv("RESEARCH_TWITTER_API_KEY") or ""
RESEARCH_TWITTER_API_SECRET = os.getenv("RESEARCH_TWITTER_API_KEY_SECRET") or ""
RESEARCH_TWITTER_BEARER_TOKEN = os.getenv("RESEARCH_TWITTER_BEARER_TOKEN") or ""
RESEARCH_TWITTER_ACCESS_TOKEN = os.getenv("RESEARCH_TWITTER_ACCESS_TOKEN") or ""
RESEARCH_TWITTER_ACCESS_TOKEN_SECRET = (
    os.getenv("RESEARCH_TWITTER_ACCESS_TOKEN_SECRET") or ""
)


COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY") or ""
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY") or ""
INFURA_PROJECT_ID = os.getenv("INFURA_PROJECT_ID") or ""
ETHER_ADDRESS = os.getenv("ETHER_ADDRESS") or ""

# LLM Keys  
DEEPSEEK_OPENROUTER_API_KEY = os.getenv("DEEPSEEK_OPENROUTER_API_KEY") or ""
DEEPSEEK_DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_DEEPSEEK_API_KEY") or ""
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or ""
OAI_API_KEY = os.getenv("OAI_API_KEY") or ""

# Our services
MANAGER_SERVICE_URL = os.getenv("MANAGER_SERVICE_URL") or ""
DB_SERVICE_URL = os.getenv("DB_SERVICE_URL") or ""
DEEPSEEK_LOCAL_SERVICE_URL = os.getenv("DEEPSEEK_LOCAL_SERVICE_URL") or ""
VAULT_SERVICE_URL          = os.getenv("VAULT_SERVICE_URL") or ""
TXN_SERVICE_URL            = os.getenv("TXN_SERVICE_URL") or ""
RAG_SERVICE_URL            = os.getenv("RAG_SERVICE_URL") or ""

# Our services keys
MANAGER_SERVICE_API_KEY = os.getenv("MANAGER_SERVICE_URL") or ""
DB_SERVICE_API_KEY = os.getenv("DB_SERVICE_API_KEY") or ""
DEEPSEEK_LOCAL_API_KEY = os.getenv("DEEPSEEK_LOCAL_API_KEY") or ""
VAULT_API_KEY = os.getenv("VAULT_API_KEY") or ""
TXN_SERVICE_API_KEY = os.getenv("TXN_SERVICE_API_KEY") or ""
RAG_SERVICE_API_KEY = os.getenv("RAG_SERVICE_API_KEY") or ""

# Clients Setup
deepseek_or_client = OpenRouter(
    base_url="https://openrouter.ai/api/v1",
    api_key=DEEPSEEK_OPENROUTER_API_KEY,
    include_reasoning=True,
)
deepseek_local_client = OpenAI(
    base_url=DEEPSEEK_LOCAL_SERVICE_URL, api_key=DEEPSEEK_LOCAL_API_KEY
)
deepseek_deepseek_client = OpenAI(
    base_url="https://api.deepseek.com", api_key=DEEPSEEK_DEEPSEEK_API_KEY
)
anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
oai_client = OpenAI(api_key=OAI_API_KEY)
summarizer_genner = get_genner(
    "deepseek_v3_or", stream_fn=lambda x: None, or_client=deepseek_or_client
)

DEFAULT_HEADERS = {"x-api-key": DB_SERVICE_API_KEY, "Content-Type": "application/json"}


def setup_trading_agent_flow(
    fe_data: dict, session_id: str, agent_id: str, assisted=True
) -> Tuple[TradingAgent, List[str], Callable[[StrategyData | None, str | None], None]]:
    role = fe_data["role"]
    network = fe_data["network"]
    services_used = fe_data["research_tools"]
    trading_instruments = fe_data["trading_instruments"]
    metric_name = fe_data["metric_name"]
    notif_sources = fe_data["notifications"]
    time_ = fe_data["time"]

    in_con_env = services_to_envs(services_used)
    apis = services_to_prompts(services_used)
    db = APIDB(base_url=DB_SERVICE_URL, api_key=DB_SERVICE_API_KEY)
    if fe_data["model"] == "deepseek":
        fe_data["model"] = "deepseek_or"

    genner = get_genner(
        fe_data["model"],
        deepseek_deepseek_client=deepseek_deepseek_client,
        or_client=deepseek_or_client,
        deepseek_local_client=deepseek_local_client,
        anthropic_client=anthropic_client,
        stream_fn=lambda token: print(token, end="", flush=True),
    )
    prompt_generator = TradingPromptGenerator(prompts=fe_data["prompts"])
    sensor = TradingSensor(
        eth_address=ETHER_ADDRESS,
        infura_project_id=INFURA_PROJECT_ID,
        etherscan_api_key=ETHERSCAN_API_KEY,
    )
    container_manager = ContainerManager(
        docker.from_env(),
        "agent-executor",
        "./code",
        in_con_env=in_con_env,
    )
    summarizer = get_summarizer(summarizer_genner)
    previous_strategies = db.fetch_all_strategies(agent_id)

    rag = RAGClient(
        session_id=session_id,
        agent_id=agent_id,
    )
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
        txn_service_url=TXN_SERVICE_URL,
        summarizer=summarizer,
    )

    def wrapped_flow(prev_strat, notif_str):
        return flow_func(agent=agent, prev_strat=prev_strat, notif_str=notif_str)

    return agent, notif_sources, wrapped_flow


def setup_marketing_agent_flow(
    fe_data: dict, session_id: str, agent_id: str
) -> Tuple[
    MarketingAgent, List[str], Callable[[StrategyData | None, str | None], None]
]:
    role = fe_data["role"]
    time_ = fe_data["time"]
    metric_name = fe_data["metric_name"]
    notif_sources = fe_data["notifications"]
    services_used = fe_data["research_tools"]
    twitter_access_token = fe_data["twitter_access_token"]

    os.environ["POSTING_TWITTER_ACCESS_TOKEN"] = twitter_access_token

    in_con_env = services_to_envs(services_used)
    apis = services_to_prompts(services_used)
    db = APIDB(base_url=DB_SERVICE_URL, api_key=DB_SERVICE_API_KEY)

    auth = tweepy.OAuth1UserHandler(
        consumer_key=TWITTER_API_KEY,
        consumer_secret=TWITTER_API_SECRET,
    )
    auth.set_access_token(TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET)

    twitter_client = TweepyTwitterClient(
        client=tweepy.Client(
            bearer_token=TWITTER_BEARER_TOKEN,
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_TOKEN_SECRET,
        ),
        api_client=tweepy.API(auth),
    )

    sensor = MarketingSensor(twitter_client, DDGS())

    genner = get_genner(
        fe_data["model"],
        deepseek_deepseek_client=deepseek_deepseek_client,
        or_client=deepseek_or_client,
        deepseek_local_client=deepseek_local_client,
        anthropic_client=anthropic_client,
        # stream_fn=lambda token: manager_client.push_token(token),
        stream_fn=lambda token: print(token, end="", flush=True),
    )

    container_manager = ContainerManager(
        docker.from_env(),
        "agent-executor",
        "./code",
        in_con_env=in_con_env,
    )
    prompt_generator = MarketingPromptGenerator(fe_data["prompts"])

    previous_strategies = db.fetch_all_strategies(agent_id)

    rag = RAGClient(
        session_id=session_id,
        agent_id=agent_id,
    )
    rag.save_result_batch(previous_strategies)

    agent = MarketingAgent(
        agent_id=agent_id,
        db=db,
        sensor=sensor,
        genner=genner,
        container_manager=container_manager,
        prompt_generator=prompt_generator,
        rag=rag,
    )

    summarizer = get_summarizer(summarizer_genner)

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

    def wrapped_flow(prev_strat: StrategyData | None, notif_str: str | None):
        return flow_func(agent=agent, prev_strat=prev_strat, notif_str=notif_str)

    return agent, notif_sources, wrapped_flow


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python main.py [trading|marketing] [session_id] [agent_id]")
        exit(1)
    else:
        agent_type = sys.argv[1]
        session_id = sys.argv[2]
        agent_id = sys.argv[3]

    db = APIDB(base_url=DB_SERVICE_URL, api_key=DB_SERVICE_API_KEY)

    try:
        session = db.create_agent_session(session_id, agent_id, datetime.now().isoformat(), "running")
    except Exception as e:
        logger.error(f"Error creating agent session: {e}")

    manager_client = ManagerClient(MANAGER_SERVICE_URL, session_id)

    session = db.get_agent_session(session_id, agent_id)
    session_interval = session.get("data", {}).get("session_interval", 15)
    if session is not None:
        db.update_agent_session(session_id, agent_id, "running")
    else:
        db.create_agent_session(
            session_id=session_id,
            agent_id=agent_id,
            started_at=datetime.datetime.now().isoformat(),
            status="running",
        )

    fe_data = manager_client.fetch_fe_data(agent_type)
    db.update_agent_session(session_id, agent_id, "running", json.dumps(fe_data))
    logger.info(f"Running {agent_type} agent for session {session_id}")

    if agent_type == "trading":
        agent, notif_sources, flow = setup_trading_agent_flow(
            fe_data, session_id, agent_id
        )
        delay_between_cycle = 60

        flow(None, None)
        logger.info(f"Waiting for {session_interval} seconds before starting a new cycle...")
        time.sleep(session_interval)

        while True:
            db.add_cycle_count(session_id, agent_id)
            session = agent.db.get_agent_session(session_id, agent_id)
            if session and session.get("data", {}).get("status") == "stopping":
                agent.db.update_agent_session(session_id, agent_id, "stopped")
                sys.exit()

            prev_strat = agent.db.fetch_latest_strategy(agent.agent_id)
            assert prev_strat is not None
            logger.info(f"Previous strat is {prev_strat}")

            current_notif = agent.db.fetch_latest_notification_str_v2(
                notif_sources, limit=5
            )
            logger.info(f"Latest notification is {current_notif}")

            agent.rag.save_result_batch([prev_strat])
            logger.info("Added the previous strat onto the RAG manager")

            flow(prev_strat, current_notif)

            logger.info(f"Waiting for {session_interval} seconds before starting a new cycle...")
            time.sleep(session_interval)

    elif agent_type == "marketing":
        agent, notif_sources, flow = setup_marketing_agent_flow(
            fe_data, session_id, agent_id
        )
        delay_between_cycle = 60

        flow(None, None)
        logger.info(f"Waiting for {session_interval} seconds before starting a new cycle...")
        time.sleep(session_interval)

        while True:
            db.add_cycle_count(session_id, agent_id)
            session = agent.db.get_agent_session(session_id, agent_id)
            if session and session.get("data", {}).get("status") == "stopping":
                agent.db.update_agent_session(session_id, agent_id, "stopped")
                sys.exit()

            prev_strat = agent.db.fetch_latest_strategy(agent.agent_id)
            assert prev_strat is not None
            logger.info(f"Previous strat is {prev_strat}")

            current_notif = agent.db.fetch_latest_notification_str_v2(notif_sources, 2)
            logger.info(f"Latest notification is {current_notif}")

            agent.rag.save_result_batch([prev_strat])
            logger.info("Added the previous strat onto the RAG manager")

            flow(prev_strat, current_notif)

            logger.info(f"Waiting for {session_interval} seconds before starting a new cycle...")
            time.sleep(session_interval)
    else:
        logger.error(f"Unknown agent type: {agent_type}")
        sys.exit(1)
