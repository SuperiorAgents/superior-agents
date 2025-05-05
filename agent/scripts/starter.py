import os
import re
import requests
import tweepy
import inquirer
import time

from src.db import SQLiteDB
from src.client.rag import RAGClient
from tests.mock_client.rag import MockRAGClient
from tests.mock_client.interface import RAGInterface
from tests.mock_sensor.trading import MockTradingSensor
from tests.mock_sensor.marketing import MockMarketingSensor
from src.sensor.marketing import MarketingSensor
from src.sensor.trading import TradingSensor
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
from src.constants import SERVICE_TO_PROMPT, SERVICE_TO_ENV
from src.constants import FE_DATA_MARKETING_DEFAULTS, FE_DATA_TRADING_DEFAULTS
from src.manager import fetch_default_prompt
from dotenv import load_dotenv
from src.twitter import TweepyTwitterClient

load_dotenv()

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

    rag.save_result_batch_v4(previous_strategies)

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

    rag.save_result_batch_v4(previous_strategies)

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
        agent.rag.save_result_batch_v4([prev_strat])

    notif_limit = 5 if fe_data is None else 2  # trading uses 5, marketing uses 2
    current_notif = agent.db.fetch_latest_notification_str_v2(
        notif_sources, notif_limit
    )
    logger.info(f"Latest notification is {current_notif}")
    logger.info("Added the previous strat onto the RAG manager")

    flow(prev_strat=prev_strat, notif_str=current_notif)
    db.add_cycle_count(session_id, agent_id)

def setup_marketing_sensor() -> MarketingSensorInterface:
    TWITTER_API_KEY = os.environ['TWITTER_API_KEY']
    TWITTER_API_KEY_SECRET = os.environ['TWITTER_API_KEY_SECRET']
    TWITTER_ACCESS_TOKEN = os.environ['TWITTER_ACCESS_TOKEN']
    TWITTER_ACCESS_TOKEN_SECRET = os.environ['TWITTER_ACCESS_TOKEN_SECRET']
    auth = tweepy.OAuth1UserHandler(
        consumer_key=TWITTER_API_KEY,
        consumer_secret=TWITTER_API_KEY_SECRET,
        access_token=TWITTER_ACCESS_TOKEN, 
        access_token_secret=TWITTER_ACCESS_TOKEN_SECRET
    )

    twitter_client = TweepyTwitterClient(
        client=tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_KEY_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_TOKEN_SECRET,
            wait_on_rate_limit=True  # Add rate limit handling
        ),
        api_client=tweepy.API(auth),
    )
    sensor = MarketingSensor(twitter_client)
    return sensor

def extra_research_tools_questions(answer_research_tools):
    questions_rt = []
    var_rt = []
    for research_tool in answer_research_tools:
        for env in SERVICE_TO_ENV[research_tool]:
            if not os.getenv(env):
                var_rt.append(env)
                questions_rt.append(inquirer.Text(name=env, message=f'Please enter value for this variable {env}'))
    answers_rt = inquirer.prompt(questions_rt)
    for env in var_rt:
        os.environ[env] = answers_rt[env]
    
def extra_model_questions(answer_model):
    model_naming = {
        'Mock LLM':'mock',
        'OpenAI (openrouter)':'openai',
        'Gemini (openrouter)':'gemini',
        'QWQ (openrouter)':'qwq',
        'Claude':'claude',
    }

    if 'Mock LLM'  in answer_model:
        logger.info("Notice: You are currently using a mock LLM. Responses are simulated for testing purposes.")
    elif 'openrouter' in answer_model and not os.getenv('OPENROUTER_API_KEY'):
        question_or_key = [
            inquirer.Password('or_api_key', message="Please enter the Openrouter API key")
        ]
        answers_or_key = inquirer.prompt(question_or_key)
        os.environ['OPENROUTER_API_KEY'] = answers_or_key['or_api_key']
    elif 'Claude' in answer_model and not os.getenv('ANTHROPIC_API_KEY'):
        question_claude_key = [
            inquirer.Password('claude_api_key', message="Please enter the Claude API key")
        ]
        answers_claude_key = inquirer.prompt(question_claude_key)
        os.environ['ANTHROPIC_API_KEY'] = answers_or_key['claude_api_key']
    return model_naming[answer_model]

def extra_sensor_questions(answers_agent_type):
    if answers_agent_type == 'trading':
        sensor = MockTradingSensor(
            eth_address="",infura_project_id="",etherscan_api_key=""
        )
        sensor_api_keys = ['INFURA_PROJECT_ID', 'ETHERSCAN_API_KEY'] 
        question_trading_sensor = [inquirer.List(
            name='sensor', message=f"Do you have these API keys {', '.join(sensor_api_keys)} ?", 
            choices=["No, I'm using Mock Sensor APIs for now", "Yes, i have these keys"]
        )]
        answer_trading_sensor = inquirer.prompt(question_trading_sensor)
        if answer_trading_sensor['sensor'] == "Yes, i have these keys":
            sensor_api_keys += ['ETHER_ADDRESS']
            sensor_api_keys = [x for x in sensor_api_keys if not os.getenv(x)]
            question_sensor_api_keys = [inquirer.Text(name=x, message=f'Please enter value for this variable {x}') for x in sensor_api_keys if not os.getenv(x)]
            answer_sensor_api_keys = inquirer.prompt(question_sensor_api_keys)
            for x in sensor_api_keys:
                os.environ[x] = answer_sensor_api_keys[x]
            sensor = TradingSensor(
                eth_address=os.environ['ETHER_ADDRESS'],
                infura_project_id=os.environ['INFURA_PROJECT_ID'],
                etherscan_api_key=os.environ['ETHERSCAN_API_KEY'],
            )
        else:
            sensor = MockTradingSensor(
                eth_address="",infura_project_id="",etherscan_api_key=""
            )
            
    elif answers_agent_type == 'marketing':
        sensor = MockMarketingSensor()
        sensor_api_keys = ["TWITTER_API_KEY","TWITTER_API_KEY_SECRET","TWITTER_ACCESS_TOKEN","TWITTER_ACCESS_TOKEN_SECRET"]
        question_marketing_sensor = [inquirer.List(
            name='sensor', message=f"Do you have these API keys {', '.join(sensor_api_keys)} ?", 
            choices=["No, I'm using Mock Sensor APIs for now", "Yes, i have these keys"]
        )]
        answer_marketing_sensor = inquirer.prompt(question_marketing_sensor)
        if answer_marketing_sensor['sensor'] == "Yes, i have these keys":
            sensor_api_keys = [x for x in sensor_api_keys if not os.getenv(x)]
            question_sensor_api_keys = [inquirer.Text(name=x, message=f'Please enter value for this variable {x}') for x in sensor_api_keys if not os.getenv(x)]
            answer_sensor_api_keys = inquirer.prompt(question_sensor_api_keys)
            for x in sensor_api_keys:
                os.environ[x] = answer_sensor_api_keys[x]
            sensor = setup_marketing_sensor()
        else: 
            sensor = MockMarketingSensor()
    return sensor

def extra_rag_questions(answer_rag, agent_type):
    if answer_rag == "Yes, i have setup the RAG":
        rag_url = 'http://localhost:8080'
        logger.info(f'Checking default address of RAG service {rag_url}')
        try:
            resp = requests.get(rag_url + "/health")
            resp.raise_for_status()
            rag = RAGClient(
                base_url='http://localhost:8080',
                session_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
                agent_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
            )
            logger.info(f'Successfully connected to the RAG service in PORT 8080')
        except Exception as e:
            print(e)
            logger.error("RAG hasn't been setup properly. Falling back to Mock RAG API")
            rag = MockRAGClient(
                session_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
                agent_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
            )
    else:
        rag = MockRAGClient(
                session_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
                agent_id='default_marketing' if agent_type == 'marketing' else 'default_trading',
            )
    return rag
            
        


def starter_prompt():
    choices_research_tools = ['Twitter', 'DuckDuckGo', 'CoinGecko']
    choices_notifications = ["animals_news",
			"business_news",
			"crypto_news",
			"entertainment_news",
			"general_news",
			"health_news",
			"politics_news",
			"science_news",
			"sports_news",
			"technology_news",
			"twitter_feed",
			"twitter_mentions",
			"world_news_news"]
    marketing_research_tools = ["DuckDuckGo"]
    questions = [
        inquirer.List('model', message="What LLM model agent will run ?", choices=[ 'Mock LLM', 'OpenAI (openrouter)','Gemini (openrouter)', 'QWQ (openrouter)','Claude'], default=['Gemini (openrouter)']),
        inquirer.Checkbox('research_tools',message="Which research tools do you want to use (use space to choose) ?",choices=[service for service in choices_research_tools]),
        inquirer.Checkbox('notifications',message="Which notifications do you want to use (use space to choose) (optional) ?",choices=[service for service in choices_notifications]),
        inquirer.List(name='agent_type', message="Please choose agent type ?", choices=['trading', 'marketing'], default=['trading']),
        inquirer.List(name='rag', message="Have you setup the RAG API (rag-api folder) ?", choices=["No, I'm using Mock RAG for now", "Yes, i have setup the RAG"]),
    ]
    answers = inquirer.prompt(questions)

    rag_client = extra_rag_questions(answers['rag'], answers['agent_type'])
    model_name = extra_model_questions(answers['model'])
    extra_research_tools_questions(answers['research_tools'])
    
    sensor = extra_sensor_questions(answers['agent_type'])

    os.environ['TXN_SERVICE_URL'] = 'http://localhost:9009'
    if answers['agent_type'] == 'marketing':
        fe_data = FE_DATA_MARKETING_DEFAULTS.copy()
    elif answers['agent_type'] == 'trading':
        fe_data = FE_DATA_TRADING_DEFAULTS.copy()

    if answers['agent_type'] == 'marketing':
        fe_data['research_tools'] = [x for x in answers['research_tools'] if x in marketing_research_tools]
    else:
        fe_data['research_tools'] = answers['research_tools']
    fe_data['prompts'] = fetch_default_prompt(fe_data,answers['agent_type'])
    fe_data['model'] = model_name
    
    or_client = OpenRouter(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv('OPENROUTER_API_KEY'),
        include_reasoning=True,
    )
    anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

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
    # modify this if you want to run this forever
    for x in range(3):
        if answers['agent_type'] == 'marketing':
            start_marketing_agent(
                agent_type=answers['agent_type'], 
                session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                fe_data=fe_data,
                genner=genner,
                db=SQLiteDB(db_path="../db/superior-agents.db"),
                rag=rag_client,
                sensor=sensor
            )
        elif answers['agent_type'] == 'trading':
            start_trading_agent(
                agent_type=answers['agent_type'], 
                session_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                agent_id='default_marketing' if answers['agent_type'] == 'marketing' else 'default_trading', 
                fe_data=fe_data,
                genner=genner,
                db=SQLiteDB(db_path="../db/superior-agents.db"),
                rag=rag_client,
                sensor=sensor
            )
        session_interval = 15
        logger.info(f"Waiting for {session_interval} seconds before starting a new cycle...")
        time.sleep(session_interval)

if __name__ == '__main__':
    starter_prompt() 
