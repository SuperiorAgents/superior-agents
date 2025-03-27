"""
Automates AI-driven trading and marketing workflows using LLMs and real-time data analysis. 
"""

# Standard Library
import dataclasses
import json
import os
import sys
import time

from datetime              import datetime
from functools             import partial
from typing                import Callable, List, Tuple

# Third-Party
import docker
import requests
import tweepy

from anthropic             import Anthropic
from dotenv                import load_dotenv
from duckduckgo_search     import DDGS
from loguru                import logger
from openai                import OpenAI

# Local Modules
from src.agent.marketing   import MarketingAgent, MarketingPromptGenerator
from src.agent.trading     import TradingAgent, TradingPromptGenerator
from src.client.openrouter import OpenRouter
from src.client.rag        import RAGClient
from src.container         import ContainerManager
from src.datatypes         import StrategyData
from src.db                import APIDB
from src.flows.marketing   import unassisted_flow as marketing_unassisted_flow
from src.flows.trading     import assisted_flow   as trading_assisted_flow
from src.genner            import get_genner
from src.helper            import services_to_envs, services_to_prompts
from src.manager           import ManagerClient
from src.sensor.marketing  import MarketingSensor
from src.sensor.trading    import TradingSensor
from src.summarizer        import get_summarizer
from src.twitter           import TweepyTwitterClient

load_dotenv()

# ================
# Env config
# ================
class EnvConfig:
    @property
    def twitter_config(self):
        return {
            "api_key"             : os.getenv("TWITTER_API_KEY", ""),
            "api_secret"          : os.getenv("TWITTER_API_KEY_SECRET", ""),
            "bearer_token"        : os.getenv("TWITTER_BEARER_TOKEN", ""),
            "access_token"        : os.getenv("TWITTER_ACCESS_TOKEN", ""),
            "access_secret"       : os.getenv("TWITTER_ACCESS_TOKEN_SECRET", "")
        }
    
    @property
    def crypto_config(self):
        return {
            "coingecko"           : os.getenv("COINGECKO_API_KEY", ""),
            "etherscan"           : os.getenv("ETHERSCAN_API_KEY", ""),
            "infura"              : os.getenv("INFURA_PROJECT_ID", ""),
            "eth_address"         : os.getenv("ETHER_ADDRESS", "")
        }
    
    @property
    def llm_config(self):
        return {
            "deepseek_openrouter" : os.getenv("DEEPSEEK_OPENROUTER_API_KEY", ""),
            "deepseek_api"        : os.getenv("DEEPSEEK_DEEPSEEK_API_KEY", ""),
            "anthropic"           : os.getenv("ANTHROPIC_API_KEY", ""),
            "openai"              : os.getenv("OAI_API_KEY", "")
        }
    
    @property
    def service_config(self):
        return {
            "manager_url"         : os.getenv("MANAGER_SERVICE_URL", ""),
            "db_url"              : os.getenv("DB_SERVICE_URL", ""),
            "deepseek_local"      : os.getenv("DEEPSEEK_LOCAL_SERVICE_URL", ""),
            "vault_url"           : os.getenv("VAULT_SERVICE_URL", ""),
            "txn_url"             : os.getenv("TXN_SERVICE_URL", ""),
            "rag_url"             : os.getenv("RAG_SERVICE_URL", "")
        }
    
    @property
    def service_keys(self):
        return {
            "manager"             : os.getenv("MANAGER_SERVICE_API_KEY", ""),
            "db"                  : os.getenv("DB_SERVICE_API_KEY", ""),
            "deepseek_local"      : os.getenv("DEEPSEEK_LOCAL_API_KEY", ""),
            "vault"               : os.getenv("VAULT_API_KEY", ""),
            "txn"                 : os.getenv("TXN_SERVICE_API_KEY", ""),
            "rag"                 : os.getenv("RAG_SERVICE_API_KEY", "")
        }

# ================
# Client initialization
# ================
env = EnvConfig()

# LLM Clients
deepseek_or_client       = OpenRouter(
    base_url             = "https://openrouter.ai/api/v1",
    api_key              = env.llm_config["deepseek_openrouter"],
    include_reasoning    = True,
)

deepseek_local_client    = OpenAI(
    base_url             = env.service_config["deepseek_local"],
    api_key              = env.service_keys["deepseek_local"]
)

deepseek_deepseek_client = OpenAI(
    base_url             = "https://api.deepseek.com",
    api_key              = env.llm_config["deepseek_api"]
)

anthropic_client  = Anthropic(api_key=env.llm_config["anthropic"])
oai_client        = OpenAI(api_key=env.llm_config["openai"])
summarizer_genner = get_genner("deepseek_v3_or", stream_fn=lambda x: None, or_client=deepseek_or_client)

# ================
# Cpre Class
# ================
class AgentFlowFactory:
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.db         = APIDB(base_url=env.service_config["db_url"], api_key=env.service_keys["db"])
        self.summarizer = get_summarizer(summarizer_genner)
        
    def create_agent_flow(self, fe_data: dict, session_id: str, agent_id: str) -> tuple:
        common                          = self._init_common_components(fe_data, agent_id)
        agent_class, sensor, prompt_gen = self._get_agent_components(fe_data)
        rag                             = RAGClient(session_id=session_id, agent_id=agent_id)
        rag.save_result_batch(common["prev_strategies"])
        
        agent = agent_class(
            agent_id          = agent_id,
            sensor            = sensor,
            genner            = common["genner"],
            container_manager = common["container_mgr"],
            prompt_generator  = prompt_gen,
            db                = self.db,
            rag               = rag,
        )
        
        flow_func = self._build_flow_function(
            agent      = agent,
            fe_data    = fe_data,
            session_id = session_id,
            common     = common
        )
        
        return agent, fe_data["notifications"], flow_func

    def _init_common_components(self, fe_data, agent_id):
        services = fe_data["research_tools"]
        
        return {
            "container_mgr": ContainerManager(
                docker.from_env(),
                "agent-executor",
                "./code",
                in_con_env = services_to_envs(services)
            ),
            "genner"          : self._create_genner(fe_data),
            "prev_strategies" : self.db.fetch_all_strategies(agent_id),
            "apis"            : services_to_prompts(services)
        }

    def _create_genner(self, fe_data):
        model_map = {
            "deepseek"  : "deepseek_or",
            "anthropic" : "anthropic",
            "openai"    : "openai"
        }
        model = model_map.get(fe_data["model"], fe_data["model"])
        
        return get_genner(
            model,
            deepseek_deepseek_client = deepseek_deepseek_client,
            or_client                = deepseek_or_client,
            deepseek_local_client    = deepseek_local_client,
            anthropic_client         = anthropic_client,
            stream_fn                = lambda token: print(token, end="", flush=True),
        )

    def _get_agent_components(self, fe_data):
        if self.agent_type == "trading":
            return (
                TradingAgent,
                TradingSensor(
                    eth_address       = env.crypto_config["eth_address"],
                    infura_project_id = env.crypto_config["infura"],
                    etherscan_api_key = env.crypto_config["etherscan"]
                ),
                TradingPromptGenerator(fe_data["prompts"])
            )
            
        elif self.agent_type == "marketing":
            return (
                MarketingAgent,
                self._create_marketing_sensor(),
                MarketingPromptGenerator(fe_data["prompts"])
            )
            
        raise ValueError(f"Unknown agent type: {self.agent_type}")

    def _create_marketing_sensor(self):
        """Creating Marketing Sensors"""
        auth = tweepy.OAuth1UserHandler(
            consumer_key        = env.twitter_config["api_key"],
            consumer_secret     = env.twitter_config["api_secret"],
            access_token        = env.twitter_config["access_token"], 
            access_token_secret = env.twitter_config["access_secret"]
        )
        
        return MarketingSensor(
            twitter_client = TweepyTwitterClient(
                client = tweepy.Client(
                    consumer_key        = env.twitter_config["api_key"],
                    consumer_secret     = env.twitter_config["api_secret"],
                    access_token        = env.twitter_config["access_token"],
                    access_token_secret = env.twitter_config["access_secret"],
                    wait_on_rate_limit  = True
                ),
                api_client=tweepy.API(auth)
            ),
            search_client=DDGS()
        )

    def _build_flow_function(self, agent, fe_data, session_id, common):
        """Build Process Function"""
        base_params = {
            "agent"       : agent,
            "session_id"  :  session_id,
            "role"        : fe_data["role"],
            "time"        : fe_data["time"],
            "apis"        : common["apis"],
            "metric_name" : fe_data["metric_name"],
            "summarizer"  : self.summarizer
        }
        
        if self.agent_type == "trading":
            flow = trading_assisted_flow
            base_params.update({
                "network"             : fe_data["network"],
                "trading_instruments" : fe_data["trading_instruments"],
                "txn_service_url"     : env.service_config["txn_url"]
            })
        else:
            flow = marketing_unassisted_flow
            
        return partial(flow, **base_params)


def main_loop(agent_type: str, session_id: str, agent_id: str):
    """Main loop logic"""
    # Initialize
    db      = APIDB(base_url=env.service_config["db_url"], api_key=env.service_keys["db"])
    manager = ManagerClient(env.service_config["manager_url"], session_id)
    
    try:
        session = db.create_agent_session(
            session_id = session_id,
            agent_id   = agent_id,
            started_at = datetime.now().isoformat(),
            status     = "running"
        )
    except Exception as e:
        logger.error(f"Session creation failed: {e}")
        raise
    
    # Get front-end configuration
    fe_data = manager.fetch_fe_data(agent_type)
    db.update_agent_session(session_id, agent_id, "running", json.dumps(fe_data))
    
    # Create agent process
    factory                    = AgentFlowFactory(agent_type)
    agent, notif_sources, flow = factory.create_agent_flow(fe_data, session_id, agent_id)
    
    flow(prev_strat = None, notif_str=None)

    session_interval = session.get("data", {}).get("session_interval", 15)
    logger.info(f"Launch{agent_type}Agent Loop, Interval: {session_interval}s")
    
    while True:
        try:
            db.add_cycle_count(session_id, agent_id)
            
            # Check for stoppage
            session = agent.db.get_agent_session(session_id, agent_id)
            if session.get("data", {}).get("status") == "stopping":
                agent.db.update_agent_session(session_id, agent_id, "stopped")
                logger.info("Receive stop signal, terminate process")
                sys.exit()

            prev_strat    = agent.db.fetch_latest_strategy(agent.agent_id)
            current_notif = agent.db.fetch_latest_notification_str_v2(notif_sources, limit=5)
            if prev_strat:
                agent.rag.save_result_batch([prev_strat])
            flow(prev_strat=prev_strat, notif_str=current_notif)
            time.sleep(session_interval)
            
        except KeyboardInterrupt:
            logger.info("User interruptions, cleanup resources...")
            agent.db.update_agent_session(session_id, agent_id, "stopped")
            sys.exit()
        except Exception as e:
            logger.error(f"Execution exception: {str(e)}")
            agent.db.update_agent_session(session_id, agent_id, "error", error=str(e))
            time.sleep(60)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python main.py [trading|marketing] [session_id] [agent_id]")
        sys.exit(1)
        
    _, agent_type, session_id, agent_id = sys.argv
    main_loop(agent_type, session_id, agent_id)