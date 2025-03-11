from abc import ABC, abstractmethod
from typing import Callable, List, Tuple

from ollama import ChatResponse, chat
from result import Err, Ok, Result

from src.config import (
    OllamaConfig,
)
from src.types import ChatHistory


class Genner(ABC):
    def __init__(self, identifier: str, do_stream: bool):
        """
        Initialize the base generator class.
        
        This constructor sets up the base generator with an identifier
        and streaming configuration.
        
        Args:
            identifier (str): Unique identifier for this generator
            do_stream (bool): Whether to stream responses or not
        """
        self.identifier = identifier
        self.do_stream = do_stream

    @abstractmethod
    def ch_completion(self, messages: ChatHistory) -> Result[str, str]:
        """
        Generate a single completion (strategy) based on the current chat history.

        This abstract method should be implemented by subclasses to handle
        the generation of text completions using different LLM backends.

        Args:
            messages (ChatHistory): Chat history containing the conversation context

        Returns:
            Result[str, str]: 
                Ok(str): The raw response text if successful
                Err(str): The error message if generation failed
        """
        pass

    def set_do_stream(self, final_state: bool):
        """
        Set the streaming state of the generator.
        
        This method enables or disables streaming of responses.
        
        Args:
            final_state (bool): Whether to enable streaming (True) or disable it (False)
        """
        self.do_stream = final_state

    @abstractmethod
    def generate_code(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[str], str], str]:
        """
        Generate code (a single strategy) based on the current chat history.

        This abstract method should be implemented by subclasses to handle
        the generation of code using different LLM backends. It processes
        the chat history and extracts code from the response.

        Args:
            messages (ChatHistory): Chat history containing the conversation context
            blocks (List[str]): XML tag names to extract content from before processing into code

        Returns:
            Result[Tuple[List[str], str], str]:
                Ok(Tuple[List[str], str]): Tuple containing:
                    - List[str]: Processed code blocks
                    - str: Raw response from the model
                Err(str): Error message if generation failed
        """
        pass

    @abstractmethod
    def generate_list(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[List[str]], str], str]:
        """
        Generate a list of items based on the current chat history.

        This abstract method should be implemented by subclasses to handle
        the generation of structured lists using different LLM backends.
        It processes the chat history and extracts lists from the response.

        Args:
            messages (ChatHistory): Chat history containing the conversation context
            blocks (List[str]): XML tag names to extract content from before processing into lists

        Returns:
            Result[Tuple[List[List[str]], str], str]:
                Ok(Tuple[List[List[str]], str]): Tuple containing:
                    - List[List[str]]: Processed lists of items
                    - str: Raw response from the model
                Err(str): Error message if generation failed
        """
        pass

    @abstractmethod
    def extract_code(
        self, response: str, blocks: List[str] = []
    ) -> Result[List[str], str]:
        """
        Extract code blocks from a model response.

        This abstract method should be implemented by subclasses to handle
        the extraction of code blocks from raw model responses, typically
        using regex patterns to find code within markdown code blocks.

        Args:
            response (str): The raw response from the model
            blocks (List[str]): XML tag names to extract content from before processing into code

        Returns:
            Result[List[str], str]:
                Ok(List[str]): List of extracted code blocks
                Err(str): Error message if extraction failed
        """
        pass

    @abstractmethod
    def extract_list(
        self, response: str, block_name: List[str] = []
    ) -> Result[List[List[str]], str]:
        """
        Extract lists from a model response.

        This abstract method should be implemented by subclasses to handle
        the extraction of structured lists from raw model responses, typically
        using regex patterns to find YAML content within markdown code blocks.

        Args:
            response (str): The raw response from the model
            block_name (List[str]): XML tag names to extract content from before processing into lists

        Returns:
            Result[List[List[str]], str]:
                Ok(List[List[str]]): List of extracted lists
                Err(str): Error message if extraction failed
        """
        pass


class OllamaGenner(Genner):
    def __init__(
        self,
        config: OllamaConfig,
        identifier: str,
        stream_fn: Callable[[str], None] | None,
    ):
        """
        Initialize the Ollama-based generator.
        
        This constructor sets up the generator with Ollama configuration
        and streaming function.
        
        Args:
            config (OllamaConfig): Configuration for the Ollama model
            identifier (str): Unique identifier for this generator
            stream_fn (Callable[[str], None] | None): Function to call with streamed tokens,
                or None to disable streaming
        """
        super().__init__(identifier, True if stream_fn else False)

        self.config = config
        self.stream_fn = stream_fn

    def ch_completion(self, messages: ChatHistory) -> Result[str, str]:
        """
        Generate a completion using the Ollama API.
        
        This method sends the chat history to the Ollama API and retrieves
        a completion response, with optional streaming support.
        
        Args:
            messages (ChatHistory): Chat history containing the conversation context
            
        Returns:
            Result[str, str]:
                Ok(str): The generated text if successful
                Err(str): Error message if the API call fails
        """
        final_response = ""
        try:
            assert self.config.model is not None, "Model name is not provided"

            if self.do_stream:
                assert self.stream_fn is not None

                for chunk in chat(self.config.model, messages.as_native(), stream=True):
                    if chunk["message"] and chunk["message"]["content"]:
                        token = chunk["message"]["content"]
                        self.stream_fn(token)
                        final_response += token
            else:
                response: ChatResponse = chat(self.config.model, messages.as_native())
                assert (
                    response.message.content is not None
                ), "No content in the response"

                final_response = response.message.content
        except AssertionError as e:
            return Err(
                f"OllamaGenner.ch_completion: response.message.content is None: {e}"
            )
        except Exception as e:
            return Err(
                f"An unexpected Ollama error while generating code with {self.config.name}, raw response: {response} occured: \n{e}"
            )

        return Ok(final_response)

    def generate_code(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[str], str], str]:
        """
        Generate code using the Ollama API.
        
        This method handles the complete process of generating code:
        1. Getting a completion from the model
        2. Extracting code blocks from the response
        
        Args:
            messages (ChatHistory): Chat history containing the conversation context
            blocks (List[str]): XML tag names to extract content from before processing into code
            
        Returns:
            Result[Tuple[List[str], str], str]:
                Ok(Tuple[List[str], str]): Tuple containing:
                    - List[str]: Processed code blocks
                    - str: Raw response from the model
                Err(str): Error message if generation failed
        """
        try:
            completion_result = self.ch_completion(messages)

            if err := completion_result.err():
                return Err(
                    f"OllamaGenner.generate_code: completion_result.is_err(): \n{err}"
                )

            raw_response = completion_result.unwrap()

            extract_code_result = self.extract_code(raw_response, blocks)

            if err := extract_code_result.err():
                return Err(
                    f"OllamaGenner.generate_code: extract_code_result.is_err(): \n{err}"
                )

            processed_code = extract_code_result.unwrap()

            return Ok((processed_code, raw_response))
        except Exception as e:
            return Err(
                f"An unexpected error while generating code with {self.config.name}, raw response: {raw_response} occured: \n{e}"
            )

    def generate_list(
        self, messages: ChatHistory, blocks: List[str] = [""]
    ) -> Result[Tuple[List[List[str]], str], str]:
        """
        Generate lists using the Ollama API.
        
        This method handles the complete process of generating structured lists:
        1. Getting a completion from the model
        2. Extracting lists from the response
        
        Args:
            messages (ChatHistory): Chat history containing the conversation context
            blocks (List[str]): XML tag names to extract content from before processing into lists
            
        Returns:
            Result[Tuple[List[List[str]], str], str]:
                Ok(Tuple[List[List[str]], str]): Tuple containing:
                    - List[List[str]]: Processed lists of items
                    - str: Raw response from the model
                Err(str): Error message if generation failed
        """
        try:
            completion_result = self.ch_completion(messages)

            if err := completion_result.err():
                return Err(
                    f"OllamaGenner.generate_list: completion_result.is_err(): \n{err}"
                )

            raw_response = completion_result.unwrap()

            extract_list_result = self.extract_list(raw_response, blocks)

            if err := extract_list_result.err():
                return Err(
                    f"OllamaGenner.generate_list: extract_list_result.is_err(): \n{err}"
                )

            extracted_list = extract_list_result.unwrap()

            return Ok((extracted_list, raw_response))

        except Exception as e:
            return Err(
                f"An unexpected error while generating list with {self.config.name}, raw response: {raw_response} occured: \n{e}"
            )
