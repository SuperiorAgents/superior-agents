from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum




@dataclass
class NewsData:
    date: datetime
    title: str
    body: str
    url: str
    source: str
    image: Optional[str] = None

    @staticmethod
    def from_dict(data: dict) -> "NewsData":
        """
        Create a NewsArticle instance from a dictionary.
        
        This static method converts a dictionary representation of news data
        into a NewsData object, handling date format conversion.
        
        Args:
            data (dict): Dictionary containing news article data
            
        Returns:
            NewsData: A NewsData instance created from the dictionary
        """
        # Convert ISO format string to datetime
        date = datetime.fromisoformat(data["date"].replace("Z", "+00:00"))

        return NewsData(
            date=date,
            title=data["title"],
            body=data["body"],
            url=data["url"],
            image=data.get("image"),  # Using get() in case image is missing
            source=data["source"],
        )

    def to_dict(self) -> dict:
        """
        Convert the NewsArticle instance to a dictionary.
        
        This method transforms the NewsData object into a dictionary representation,
        suitable for serialization or API responses.
        
        Returns:
            dict: Dictionary representation of the NewsData object
        """
        return {
            "date": self.date.isoformat(),
            "title": self.title,
            "body": self.body,
            "url": self.url,
            "image": self.image,
            "source": self.source,
        }


class MarketingAgentState(Enum):
    # Failed states
    FAILED_GENERATION = "failed_generation"  # Failed at code generation
    FAILED_EXECUTION = "failed_execution"  # Failed at code execution
    FAILED_MAX_RETRIES = "failed_max_retries"  # Failed after max retries

    # Success states
    SUCCESS_WITH_OUTPUT = "success_with_output"  # Succeeded with good output
    SUCCESS_NEEDS_IMPROVEMENT = (
        "success_needs_improvement"  # Succeeded but could be better
    )

    @property
    def is_success(self) -> bool:
        """
        Check if the state represents a successful outcome.
        
        This property method determines if the current state is a success state
        by checking if the state name starts with "SUCCESS".
        
        Returns:
            bool: True if the state is a success state, False otherwise
        """
        return self.name.startswith("SUCCESS")

    @property
    def is_failure(self) -> bool:
        """
        Check if the state represents a failed outcome.
        
        This property method determines if the current state is a failure state
        by checking if the state name starts with "FAILED".
        
        Returns:
            bool: True if the state is a failure state, False otherwise
        """
        return self.name.startswith("FAILED")
