from functools import partial
from typing import Callable, List, Optional

from src.genner.Base import Genner
from src.types import ChatHistory, Message


def summarize(
    genner: "Genner",
    talking_points: List[str],
    template: str = "You are a summarizer agent. You are to summarize anything below in 1 single sentence or more.",
    max_retries: int = 3,
) -> str:
    """
    Summarize a list of talking points using the provided language model.

    Args:
        genner: An instance of the Genner class that handles text generation
        talking_points: A list of strings containing the points to be summarized
        template: Optional template string for formatting the prompt
        max_retries: Maximum number of retry attempts for failed generations

    Returns:
        str: A summarized version of the input talking points

    Raises:
        SummarizerError: If the summarization fails after max_retries attempts
        ValueError: If talking_points is empty or contains invalid data
    """
    if not talking_points:
        raise ValueError("talking_points cannot be empty")

    if not all(isinstance(point, str) for point in talking_points):
        raise ValueError("All talking points must be strings")

    # Format talking points with bullet points for better readability
    talking_points_formatted = "\n• " + "\n• ".join(
        point.strip() for point in talking_points if point.strip()
    )

    # Create the chat history with the formatted prompt
    chat_history = ChatHistory(
        [
            Message(
                role="system",
                content=template,
            ),
            Message(
                role="user",
                content=talking_points_formatted,
            )
        ]
    )

    # Attempt generation with retries
    for attempt in range(max_retries):
        try:
            response = genner.ch_completion(chat_history).unwrap()
            if response and isinstance(response, str):
                return response.strip()
        except Exception as e:
            if attempt == max_retries - 1:
                raise Exception(
                    f"Failed to generate summary after {max_retries} attempts"
                ) from e
            continue

    raise Exception("Failed to generate valid summary")


def get_summarizer(
    genner: "Genner", custom_template: Optional[str] = None, max_retries: int = 3
) -> Callable[[List[str]], str]:
    """
    Create a partial function for summarization with predefined parameters.

    Args:
        genner: An instance of the Genner class
        custom_template: Optional custom template for the summary prompt
        max_retries: Maximum number of retry attempts for failed generations

    Returns:
        Callable: A function that takes a list of strings and returns a summary

    Example:
        >>> summarizer = get_summarizer(genner)
        >>> summary = summarizer(["Point 1", "Point 2", "Point 3"])
    """
    genner.set_do_stream(False)
    
    return partial(
        summarize,
        genner,
        template=custom_template
        if custom_template
        else "Please summarize the following points:\n{to_summarize}",
        max_retries=max_retries,
    )
