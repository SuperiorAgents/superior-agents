import re
from typing import Callable, List

import yaml
from loguru import logger
from result import Err, Ok, Result

from src.config import OllamaConfig
from src.genner.Base import OllamaGenner
from src.helper import extract_content


class QwenGenner(OllamaGenner):
    def __init__(
        self,
        config: OllamaConfig,
        stream_fn: Callable[[str], None] | None,
    ):
        """
        Initialize the Qwen-based generator.
        
        This constructor sets up the generator with Qwen configuration
        and streaming function. It inherits from OllamaGenner as Qwen
        is accessed through Ollama.
        
        Args:
                config (OllamaConfig): Configuration for the Qwen model via Ollama
                stream_fn (Callable[[str], None] | None): Function to call with streamed tokens,
                        or None to disable streaming
        """
        super().__init__(config, "qwen", stream_fn)

    @staticmethod
    def extract_code(response: str, blocks: List[str] = [""]) -> Result[List[str], str]:
        """
        Extract code blocks from a Qwen model response.
        
        This static method extracts Python code blocks from the raw model response
        using regex patterns to find code within markdown code blocks. It handles
        extraction from specific XML blocks if provided.
        
        Args:
                response (str): The raw response from the model
                blocks (List[str]): XML tag names to extract content from before processing into code

        Returns:
                Result[List[str], str]:
                        Ok(List[str]): List of extracted code blocks
                        Err(str): Error message if extraction failed
        """
        extracts: List[str] = []

        for block in blocks:
            # Extract code from the response
            try:
                local_response = extract_content(response, block)
                regex_pattern = r"```python\n([\s\S]*?)```"
                code_match = re.search(regex_pattern, local_response, re.DOTALL)

                assert code_match is not None, "No code match found in the response"
                assert (
                    code_match.group(1) is not None
                ), "No code group number 1 found in the response"

                code = code_match.group(1)
                assert isinstance(code, str), "Code is not a string"

                extracts.append(code)
            except AssertionError as e:
                return Err(
                    f"QwenGenner.extract_code, regex failed, err: \n{e}\nFull response: \n{response}\nLocal response: \n{local_response}"
                )
            except Exception as e:
                return Err(
                    f"An unexpected error while extracting code occurred, raw response: {response}, err: \n{e}"
                )

        return Ok(extracts)

    @staticmethod
    def extract_list(
        response: str, blocks: List[str] = [""]
    ) -> Result[List[List[str]], str]:
        """
        Extract lists from a Qwen model response.
        
        This static method extracts YAML-formatted lists from the raw model response
        using regex patterns to find YAML content within markdown code blocks. It handles
        extraction from specific XML blocks if provided.
        
        Args:
                response (str): The raw response from the model
                blocks (List[str]): XML tag names to extract content from before processing into lists

        Returns:
                Result[List[List[str]], str]:
                        Ok(List[List[str]]): List of extracted lists
                        Err(str): Error message if extraction failed
        """
        extracts: List[List[str]] = []

        for block in blocks:
            try:
                local_response = extract_content(response, block)
                # Remove markdown code block markers and find yaml content
                # Updated regex pattern to handle triple backticks
                regex_pattern = r"```yaml\n(.*?)```"
                yaml_match = re.search(regex_pattern, local_response, re.DOTALL)

                assert yaml_match is not None, "No match found"
                yaml_content = yaml.safe_load(yaml_match.group(1).strip())
                assert isinstance(yaml_content, list), "Yaml content is not a list"
                assert all(
                    isinstance(item, str) for item in yaml_content
                ), "All yaml content items must be strings"

                extracts.append(yaml_content)
            except AssertionError as e:
                return Err(
                    f"QwenGenner.extract_list, regex failed, err: \n{e}\nFull response: \n{response}\nLocal response: \n{local_response}"
                )
            except Exception as e:
                return Err(
                    f"An unexpected error while extracting list occurred, raw response: \n{response}\n, error: \n{e}"
                )

        return Ok(extracts)
