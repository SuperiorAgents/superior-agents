from datetime import datetime
import re
from textwrap import dedent
from typing import Dict, List, Optional, Set, Tuple

from result import Err, Ok, Result

from src.client.rag import RAGClient
from src.container import ContainerManager
from src.db import APIDB
from src.genner.Base import Genner
from src.sensor.marketing import MarketingSensor
from src.types            import ChatHistory, Message


class MarketingPromptGenerator:
    def __init__(self, prompts: Optional[Dict[str, str]] = None):
        """
        Initialize with custom prompts for each function.

        Args:
                prompts: Dictionary containing custom prompts for each function
        """
        if prompts is None:
            prompts = self.get_default_prompts()
        self._validate_prompts(prompts)
        self.prompts = prompts

    def _extract_default_placeholders(self) -> Dict[str, Set[str]]:
        """Extract placeholders from default prompts to use as required placeholders."""
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

        Args:
                prompts: Dictionary of prompt name to prompt content

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
        self, role: str, time: str, metric_name: str, metric_state: str
    ) -> str:
        """
        Generate a system prompt for the marketing agent.
        
        This method creates a system prompt that sets the context for the agent,
        including its role, current date, goal, and current metric state.
        
        Args:
                role (str): The role of the agent (e.g., "influencer")
                time (str): Time frame for the marketing goal
                metric_name (str): Name of the metric to maximize
                metric_state (str): Current state of the metric

        Returns:
                str: Formatted system prompt
        """
        now = datetime.now()
        today_date = now.strftime("%Y-%m-%d")

        return self.prompts["system_prompt"].format(
            role=role,
            today_date=today_date,
            metric_name=metric_name,
            time=time,
            metric_state=metric_state,
        )

    def generate_research_code_prompt_first(self, apis: List[str]) -> str:
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

        return self.prompts["research_code_prompt_first"].format(apis_str=apis_str)

    def generate_research_code_prompt(
        self,
        notifications_str: str,
        prev_strategy: str,
        rag_summary: str,
        before_metric_state: str,
        after_metric_state: str,
    ) -> str:
        """
        Generate a prompt for research code generation with context.
        
        This method creates a prompt for generating research code when the agent
        has prior context, including notifications, previous strategies, and RAG results.
        
        Args:
                notifications_str (str): String containing recent notifications
                prev_strategy (str): Description of the previous strategy
                rag_summary (str): Summary from retrieval-augmented generation
                before_metric_state (str): State of the metric before strategy execution
                after_metric_state (str): State of the metric after strategy execution

        Returns:
                str: Formatted prompt for research code generation
        """
        return self.prompts["research_code_prompt"].format(
            notifications_str=notifications_str,
            prev_strategy=prev_strategy,
            rag_summary=rag_summary,
            before_metric_state=before_metric_state,
            after_metric_state=after_metric_state,
        )

    def generate_strategy_prompt(
        self,
        notifications_str: str,
        research_output_str: str,
        metric_name: str,
        time: str,
    ) -> str:
        """
        Generate a prompt for strategy formulation.
        
        This method creates a prompt for generating a marketing strategy based on
        notifications and research output.
        
        Args:
                notifications_str (str): String containing recent notifications
                research_output_str (str): Output from the research code
                metric_name (str): Name of the metric to maximize
                time (str): Time frame for the marketing goal

        Returns:
                str: Formatted prompt for strategy formulation
        """
        return self.prompts["strategy_prompt"].format(
            notifications_str=notifications_str,
            research_output_str=research_output_str,
            metric_name=metric_name,
            time=time,
        )

    def generate_marketing_code_prompt(
        self, strategy_output: str, apis: List[str]
    ) -> str:
        """Generate prompt for implementing the strategy"""
        apis_str = ",\n".join(apis) if apis else self._get_default_apis_str()
        return self.prompts["marketing_code_prompt"].format(
            strategy_output=strategy_output, apis_str=apis_str
        )

    def regen_code(self, previous_code: str, errors: str) -> str:
        """Generate prompt for fixing code errors"""
        return self.prompts["regen_code_prompt"].format(
            errors=errors, previous_code=previous_code
        )

    @staticmethod
    def _get_default_apis_str() -> str:
        """Get default list of available APIs"""
        default_apis = [
        dedent("""
        Research Twitter (ONLY FOR RESEARCH, Using Tweepy, env vars RESEARCH_TWITTER_API_KEY, RESEARCH_TWITTER_API_KEY_SECRET, RESEARCH_TWITTER_BEARER_TOKEN)
            Posting Twitter (ONLY FOR POSTING ON TWITTER) (env vars POSTING_TWITTER_ACCESS_TOKEN) (
            curl --request POST \
                --url https://api.x.com/2/tweets \
                --header 'Authorization: Bearer <access_token>' \
                --header 'Content-Type: application/json' \
                --data '{
                "text": "Learn how to use the user Tweet timeline and user mention timeline endpoints in the X API v2 to explore Tweet https://t.co/56a0vZUx7i"
                }'
            )
        """),
        "DuckDuckGo (using the command line `ddgr`)",
        ]
        return ",\n".join(default_apis)

    @staticmethod
    def get_default_prompts() -> Dict[str, str]:
        """Get the complete set of default prompts that can be customized."""
        return {
            "system_prompt": dedent("""
                You are a {role} social media influencer.
                Today's date is {today_date}.
                Your goal is to maximize {metric_name} within {time}
                You are currently at {metric_state}
            """).strip(),
            #
            #
            #
            "research_code_prompt_first": dedent("""
                You know nothing about your environment.
                What do you do now?
                You can use the following APIs to do research:
                <APIs>
                {apis_str}
                </APIs>
                You are to print for everything, and raise every error or unexpected behavior of the program.
                Please write code using the format below to research the state of the market.
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
                Here is what you just tried : 
                <PrevStrategy>
                {prev_strategy} 
                </PrevStrategy>
                For reference, in the past when you encountered a similar situation you reasoned as follows:
                <RAG>
                {rag_summary}
                </RAG>
                The result of this RAG was
                <BeforeStrategyExecution>
                {before_metric_state}
                </BeforeStrategyExecution>
                <AfterStrategyExecution>
                {after_metric_state}
                </AfterStrategyExecution>
                You are to print for everything, and raise every error or unexpected behavior of the program.
                Please write code using format below to research what is going on in the world and how best to react to it.
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
                Decide what what you should do to help you maximize {metric_name} within {time}. 
                Choose one action and write a short paragraph explaining how you will do it.
        """).strip(),
            #
            #
            #
            "marketing_code_prompt": dedent("""
                Please write code to implement this strategy:
                <Strategy>
                {strategy_output}
                </Strategy>
                You have the following APIs:
                <APIs>
                {apis_str}
                </APIs>
                Format the code as follows:
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
            "regen_code_prompt": dedent("""
                Given these errors:
                <Errors>
                {errors}
                </Errors>
                And the code it's from:
                <Code>
                {previous_code}
                </Code>
                You are to generate code that fixes the error but doesn't stray too much from the original code, in this format:
                ```python
                from dotenv import load_dotenv
                import ...

                load_dotenv()

                def main():
                    ....

                main()
                ```
                Please generate the code.
            """).strip(),
        }


class MarketingAgent:
    """
    Agent responsible for executing marketing strategies based on social media data and notifications.
    
    This class orchestrates the entire marketing workflow, including system preparation,
    research code generation, strategy formulation, and marketing code execution.
    It integrates with various components like RAG, database, sensors, and code execution
    to create a complete marketing agent.
    """
    def __init__(
        self,
        agent_id: str,
        rag: RAGClient,
        db: APIDB,
        sensor: MarketingSensor,
        genner: Genner,
        container_manager: ContainerManager,
        prompt_generator: MarketingPromptGenerator,
    ):
        """
        Initialize the marketing agent with all required components.
        
        Args:
                agent_id (str): Unique identifier for this agent
                rag (RAGClient): Client for retrieval-augmented generation
                db (APIDB): Database client for storing and retrieving data
                sensor (MarketingSensor): Sensor for monitoring marketing-related metrics
                genner (Genner): Generator for creating code and strategies
                container_manager (ContainerManager): Manager for code execution in containers
                prompt_generator (MarketingPromptGenerator): Generator for creating prompts
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

    def prepare_system(self, role: str, time: str, metric_name: str, metric_state: str):
        """
        Prepare the system prompt for the agent.
        
        This method generates the initial system prompt that sets the context
        for the agent's operation, including its role, time context, and metrics.
        
        Args:
                role (str): The role of the agent (e.g., "influencer")
                time (str): Current time information
                metric_name (str): Name of the metric to track
                metric_state (str): Current state of the metric

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
                    metric_state=metric_state,
                ),
            )
        )

        return ctx_ch

    def gen_research_code_on_first(
        self, apis: List[str]
    ) -> Result[Tuple[str, ChatHistory], str]:
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
                content=self.prompt_generator.generate_research_code_prompt_first(
                    apis=apis
                ),
            )
        )

        gen_result = self.genner.ch_completion(self.chat_history + ctx_ch)

        if err := gen_result.err():
            return Err(f"MarketingAgent.gen_research_code_on_first, err: \n{err}")

        response = gen_result.unwrap()
        ctx_ch = ctx_ch.append(Message(role="assistant", content=response))

        return Ok((response, ctx_ch))

    def gen_research_code(
        self,
        notifications_str: str,
        prev_strategy: str,
        rag_summary: str,
        before_metric_state: str,
        after_metric_state: str,
    ) -> Result[Tuple[str, ChatHistory], str]:
        """
        Generate research code with context.
        
        This method creates research code when the agent has prior context,
        including notifications, previous strategies, and RAG results.
        
        Args:
                notifications_str (str): String containing recent notifications
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
                    prev_strategy=prev_strategy,
                    rag_summary=rag_summary,
                    before_metric_state=before_metric_state,
                    after_metric_state=after_metric_state,
                ),
            )
        )

        gen_result = self.genner.ch_completion(self.chat_history + ctx_ch)

        if err := gen_result.err():
            return Err(f"MarketingAgent.gen_research_code, err: \n{err}")

        response = gen_result.unwrap()
        ctx_ch = ctx_ch.append(Message(role="assistant", content=response))

        return Ok((response, ctx_ch))

    def gen_strategy(
        self,
        notifications_str: str,
        research_output_str: str,
        metric_name: str,
        time: str
    ) -> Result[Tuple[str, ChatHistory], str]:
        """
        Generate a marketing strategy.
        
        This method formulates a marketing strategy based on notifications
        and research output.
        
        Args:
                notifications_str (str): String containing recent notifications
                research_output_str (str): Output from the research code
                metric_name (str): Name of the metric to maximize
                time (str): Time frame for the marketing goal

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
                    metric_name=metric_name,
                    time=time,
                ),
            )
        )

        gen_result = self.genner.ch_completion(self.chat_history + ctx_ch)

        if err := gen_result.err():
            return Err(f"MarketingAgent.gen_strategy, err: \n{err}")

        response = gen_result.unwrap()
        ctx_ch = ctx_ch.append(Message(role="assistant", content=response))

        return Ok((response, ctx_ch))

    def gen_marketing_code(
        self,
        strategy_output: str,
        apis: List[str],
    ) -> Result[Tuple[str, ChatHistory], str]:
        """
        Generate code for implementing a marketing strategy.
        
        This method creates code that will implement a marketing strategy
        using the available APIs.
        
        Args:
                strategy_output (str): Output from the strategy formulation
                apis (List[str]): List of APIs available to the agent

        Returns:
                Result[Tuple[str, ChatHistory], str]: Success with code and chat history,
                        or error message
        """
        ctx_ch = ChatHistory(
            Message(
                role="user",
                content=self.prompt_generator.generate_marketing_code_prompt(
                    strategy_output=strategy_output,
                    apis=apis,
                ),
            )
        )

        gen_result = self.genner.generate_code(self.chat_history + ctx_ch)

        if err := gen_result.err():
            return Err(f"MarketingAgent.gen_marketing_code, err: \n{err}")

        processed_codes, raw_response = gen_result.unwrap()
        ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

        return Ok((processed_codes[0], ctx_ch))

    def gen_better_code(
        self, prev_code: str, errors: str
    ) -> Result[Tuple[str, ChatHistory], str]:
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
                content=self.prompt_generator.regen_code(prev_code, errors),
            )
        )

        gen_result = self.genner.generate_code(self.chat_history + ctx_ch)

        if err := gen_result.err():
            return Err(f"MarketingAgent.gen_better_code, err: \n{err}")

        processed_codes, raw_response = gen_result.unwrap()
        ctx_ch = ctx_ch.append(Message(role="assistant", content=raw_response))

        return Ok((processed_codes[0], ctx_ch))
