"""
Data models for MetaPilot v2.0 API.
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    username: str
    email: str


class UserResponse(BaseModel):
    """Schema for user response."""
    user_id: str
    session_key: str


class RuleCreate(BaseModel):
    """Schema for creating a new rule."""
    type: str = Field(..., description="Rule type: 'keyword', 'nlp', or 'threshold'")
    keywords: Optional[List[str]] = Field(None, description="Keywords for keyword matching")
    criteria: Optional[str] = Field(None, description="Criteria for NLP matching")
    threshold_value: Optional[float] = Field(None, description="Threshold value for threshold rules")
    comparison: Optional[str] = Field(None, description="Comparison operator: 'gt', 'lt', 'gte', 'lte'")
    action: Dict = Field(..., description="Action to take when rule matches")


class RuleResponse(BaseModel):
    """Schema for rule response."""
    rule_id: str


class RunResponse(BaseModel):
    """Schema for run response."""
    messages: List[str]


class ErrorResponse(BaseModel):
    """Schema for error response."""
    error: str


class StatusResponse(BaseModel):
    """Schema for status response."""
    status: str
    uptime: float
    agent_count: int
    operation_count: int
    success_rate: float


class AgentType(str, Enum):
    """Enum for agent types."""
    GOVERNOR = "governor"
    DEFI = "defi"
    NFT = "nft"
    DAO = "dao"
    CROSS_CHAIN = "cross_chain"
    MARKET_INTELLIGENCE = "market_intelligence"
    RISK = "risk"


class Decision(BaseModel):
    """Schema for agent decision."""
    action: str
    parameters: Dict[str, Any] = {}
    confidence: float
    expected_return: Optional[float] = None
    reasoning: Optional[str] = None


class ExecutionResult(BaseModel):
    """Schema for execution result."""
    success: bool
    output: Dict[str, Any] = {}
    error: Optional[str] = None


class AgentRequest(BaseModel):
    """Schema for agent request."""
    agent_type: str
    data: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = {}
    
    @validator('agent_type')
    def validate_agent_type(cls, v):
        """Validate that the agent type is one of the allowed types."""
        allowed_types = [agent_type.value for agent_type in AgentType]
        if v not in allowed_types:
            raise ValueError(f"Agent type must be one of {allowed_types}")
        return v


class AgentResponse(BaseModel):
    """Schema for agent response."""
    agent_id: str
    decision: Decision


class AutonomousOperationRequest(BaseModel):
    """Schema for autonomous operation request."""
    operation_type: str
    parameters: Dict[str, Any] = {}
    risk_tolerance: float = 0.5
    max_duration_seconds: int = 3600


class OperationStatus(BaseModel):
    """Schema for operation status."""
    operation_id: str
    status: str
    progress: float
    current_step: str
    results: Dict[str, Any] = {}
    errors: List[str] = []


class FeedbackRequest(BaseModel):
    """Schema for feedback request."""
    operation_id: str
    rating: float
    comments: Optional[str] = None


class InsightResponse(BaseModel):
    """Schema for insight response."""
    insights: List[Dict[str, Any]]
    confidence: float
    data_sources: List[str] = []
