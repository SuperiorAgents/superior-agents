"""
Market Intelligence Agent implementation for MetaPilot AI Engine v2.0.
"""

from typing import Dict, List, Any
import asyncio
import random

from metapilot.core.agent import MetaPilotAgent
from metapilot.models.schemas import Decision, ExecutionResult


class MarketIntelligenceAgent(MetaPilotAgent):
    """
    Market Intelligence Agent - Specialized agent for market analysis and intelligence.
    
    Capabilities:
    - Market trend analysis
    - Sentiment analysis
    - On-chain data analysis
    - Correlation detection
    - Price prediction
    """
    
    def __init__(self):
        """Initialize a new Market Intelligence Agent."""
        capabilities = [
            "trend_analysis",
            "sentiment_analysis",
            "on_chain_analysis",
            "correlation_detection",
            "price_prediction",
            "volume_analysis"
        ]
        
        super().__init__("Market_Intelligence", "Market Analysis and Intelligence", capabilities)
    
    async def analyze(self, data: Dict[str, Any]) -> Decision:
        """
        Analyze market data and generate intelligence.
        
        Args:
            data: The market data to analyze
            
        Returns:
            A decision object
        """
        # Analyze market trends if present
        trend_analysis = {}
        if "price_history" in data:
            trend_analysis = await self.analyze_trends(data["price_history"])
        
        # Analyze sentiment if present
        sentiment_analysis = {}
        if "social_data" in data:
            sentiment_analysis = await self.analyze_sentiment(data["social_data"])
        
        # Analyze on-chain data if present
        on_chain_analysis = {}
        if "on_chain_data" in data:
            on_chain_analysis = await self.analyze_on_chain_data(data["on_chain_data"])
        
        # Generate intelligence based on analyses
        intelligence = self.generate_intelligence(trend_analysis, sentiment_analysis, on_chain_analysis)
        
        # Store this decision in memory for learning
        await self.memory.store({
            "input_data": data,
            "analysis": {
                "trends": trend_analysis,
                "sentiment": sentiment_analysis,
                "on_chain": on_chain_analysis
            },
            "intelligence": intelligence
        })
        
        # Update learning model
        self.last_decision = Decision(
            action=intelligence.get("action", "provide_market_intelligence"),
            parameters=intelligence.get("parameters", {}),
            confidence=intelligence.get("confidence", 0.7),
            expected_return=intelligence.get("expected_return", 0.0),
            reasoning=intelligence.get("reasoning", "Intelligence based on market analysis")
        )
        
        return self.last_decision
    
    async def execute(self, decision: Decision) -> ExecutionResult:
        """
        Execute a market intelligence action.
        
        Args:
            decision: The decision to execute
            
        Returns:
            Result of the execution
        """
        action = decision.action
        parameters = decision.parameters
        
        # Simulate execution based on action type
        if action == "generate_report":
            return await self._execute_report_generation(parameters)
        elif action == "send_alert":
            return await self._execute_alert(parameters)
        elif action == "predict_price":
            return await self._execute_price_prediction(parameters)
        else:
            # Default to providing intelligence only
            return ExecutionResult(
                success=True,
                output={"message": "Market intelligence provided", "details": parameters},
                error=None
            )
    
    async def analyze_trends(self, price_history: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze market trends from price history.
        
        Args:
            price_history: Historical price data
            
        Returns:
            Trend analysis results
        """
        # Simulate trend analysis
        await asyncio.sleep(0.3)
        
        assets = list(price_history.keys())
        results = {}
        
        for asset in assets:
            # In a real implementation, this would use statistical methods
            # to analyze trends, support/resistance, etc.
            
            trend_direction = random.choice(["bullish", "bearish", "neutral", "consolidating"])
            momentum = random.uniform(0, 1)
            volatility = random.uniform(0, 1)
            
            results[asset] = {
                "trend": trend_direction,
                "momentum": momentum,
                "volatility": volatility,
                "support_levels": [random.uniform(0.7, 0.9) * price_history[asset]["current"] for _ in range(2)],
                "resistance_levels": [random.uniform(1.1, 1.3) * price_history[asset]["current"] for _ in range(2)]
            }
            
        return results
    
    async def analyze_sentiment(self, social_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze sentiment from social media and news data.
        
        Args:
            social_data: Social media and news data
            
        Returns:
            Sentiment analysis results
        """
        # Simulate sentiment analysis
        await asyncio.sleep(0.3)
        
        platforms = list(social_data.keys())
        results = {
            "overall": {
                "sentiment_score": random.uniform(-1, 1),  # -1 to 1, negative to positive
                "volume": random.randint(1000, 100000),
                "trending_topics": ["topic1", "topic2", "topic3"]
            },
            "platforms": {}
        }
        
        for platform in platforms:
            results["platforms"][platform] = {
                "sentiment_score": random.uniform(-1, 1),
                "volume": random.randint(500, 50000),
                "key_influencers": ["influencer1", "influencer2"],
                "trending_hashtags": ["hashtag1", "hashtag2"]
            }
            
        return results
    
    async def analyze_on_chain_data(self, on_chain_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze on-chain data for market intelligence.
        
        Args:
            on_chain_data: On-chain data
            
        Returns:
            On-chain analysis results
        """
        # Simulate on-chain analysis
        await asyncio.sleep(0.3)
        
        metrics = [
            "active_addresses",
            "transaction_volume",
            "new_addresses",
            "whale_movements"
        ]
        
        results = {}
        for metric in metrics:
            if metric in on_chain_data:
                current_value = on_chain_data[metric].get("current", 0)
                historical_avg = on_chain_data[metric].get("historical_average", current_value)
                
                results[metric] = {
                    "current": current_value,
                    "vs_historical": current_value / historical_avg if historical_avg > 0 else 1,
                    "trend": "increasing" if current_value > historical_avg * 1.1 else 
                             "decreasing" if current_value < historical_avg * 0.9 else "stable",
                    "significance": random.uniform(0, 1)
                }
                
        return results
    
    def generate_intelligence(self, trend_analysis: Dict[str, Any], sentiment_analysis: Dict[str, Any], 
                             on_chain_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate market intelligence from various analyses.
        
        Args:
            trend_analysis: Results of trend analysis
            sentiment_analysis: Results of sentiment analysis
            on_chain_analysis: Results of on-chain analysis
            
        Returns:
            Market intelligence
        """
        # Determine if there's a significant price movement expected
        price_movement_expected = False
        direction = "neutral"
        confidence = 0.5
        
        # Check for strong trend signals
        if trend_analysis:
            bullish_assets = [a for a, data in trend_analysis.items() 
                             if data.get("trend") == "bullish" and data.get("momentum", 0) > 0.7]
            bearish_assets = [a for a, data in trend_analysis.items() 
                             if data.get("trend") == "bearish" and data.get("momentum", 0) > 0.7]
            
            if len(bullish_assets) > len(bearish_assets) * 2:  # Significantly more bullish assets
                price_movement_expected = True
                direction = "bullish"
                confidence = 0.7
            elif len(bearish_assets) > len(bullish_assets) * 2:  # Significantly more bearish assets
                price_movement_expected = True
                direction = "bearish"
                confidence = 0.7
        
        # Check for strong sentiment signals
        if sentiment_analysis and "overall" in sentiment_analysis:
            sentiment_score = sentiment_analysis["overall"].get("sentiment_score", 0)
            if abs(sentiment_score) > 0.7:  # Strong sentiment
                price_movement_expected = True
                direction = "bullish" if sentiment_score > 0 else "bearish"
                confidence = max(confidence, 0.6 + abs(sentiment_score) * 0.2)  # Boost confidence based on sentiment strength
        
        # Check for strong on-chain signals
        if on_chain_analysis:
            active_addresses = on_chain_analysis.get("active_addresses", {})
            whale_movements = on_chain_analysis.get("whale_movements", {})
            
            if active_addresses.get("trend") == "increasing" and active_addresses.get("vs_historical", 1) > 1.5:
                price_movement_expected = True
                direction = "bullish"
                confidence = max(confidence, 0.75)
            
            if whale_movements.get("trend") == "increasing" and whale_movements.get("significance", 0) > 0.8:
                price_movement_expected = True
                direction = "bullish" if random.random() > 0.4 else "bearish"  # Whales could be accumulating or distributing
                confidence = max(confidence, 0.8)
        
        # Generate appropriate action based on signals
        if price_movement_expected and confidence > 0.75:
            return {
                "action": "send_alert",
                "parameters": {
                    "alert_type": "price_movement",
                    "direction": direction,
                    "confidence": confidence,
                    "time_frame": "short_term",
                    "supporting_factors": {
                        "technical": bool(trend_analysis),
                        "sentiment": bool(sentiment_analysis),
                        "on_chain": bool(on_chain_analysis)
                    }
                },
                "confidence": confidence,
                "expected_return": 0.05 if direction == "bullish" else -0.05,
                "reasoning": f"High-confidence {direction} signal detected across multiple analysis dimensions"
            }
        elif price_movement_expected:
            return {
                "action": "predict_price",
                "parameters": {
                    "direction": direction,
                    "confidence": confidence,
                    "time_frame": "medium_term",
                    "factors": {
                        "technical": bool(trend_analysis),
                        "sentiment": bool(sentiment_analysis),
                        "on_chain": bool(on_chain_analysis)
                    }
                },
                "confidence": confidence,
                "expected_return": 0.03 if direction == "bullish" else -0.03,
                "reasoning": f"Moderate-confidence {direction} signal detected"
            }
        else:
            return {
                "action": "generate_report",
                "parameters": {
                    "report_type": "market_overview",
                    "sections": [
                        "technical_analysis" if trend_analysis else None,
                        "sentiment_analysis" if sentiment_analysis else None,
                        "on_chain_analysis" if on_chain_analysis else None
                    ],
                    "summary": "Market conditions appear stable with no strong directional signals"
                },
                "confidence": 0.6,
                "expected_return": 0.0,
                "reasoning": "No strong directional signals detected, providing comprehensive market overview"
            }
    
    async def _execute_report_generation(self, parameters: Dict[str, Any]) -> ExecutionResult:
        """Execute market report generation."""
        # Simulate report generation
        await asyncio.sleep(0.3)
        
        report_type = parameters.get("report_type", "market_overview")
        sections = [s for s in parameters.get("sections", []) if s]
        
        return ExecutionResult(
            success=True,
            output={
                "report_type": report_type,
                "sections": sections,
                "summary": parameters.get("summary", ""),
                "timestamp": "2025-06-27T11:49:58+01:00",
                "report_id": f"report-{''.join(random.choices('0123456789abcdef', k=8))}"
            },
            error=None
        )
    
    async def _execute_alert(self, parameters: Dict[str, Any]) -> ExecutionResult:
        """Execute market alert."""
        # Simulate alert execution
        await asyncio.sleep(0.2)
        
        alert_type = parameters.get("alert_type", "general")
        direction = parameters.get("direction", "neutral")
        
        return ExecutionResult(
            success=True,
            output={
                "alert_type": alert_type,
                "direction": direction,
                "confidence": parameters.get("confidence", 0.5),
                "time_frame": parameters.get("time_frame", "short_term"),
                "timestamp": "2025-06-27T11:49:58+01:00",
                "alert_id": f"alert-{''.join(random.choices('0123456789abcdef', k=8))}"
            },
            error=None
        )
    
    async def _execute_price_prediction(self, parameters: Dict[str, Any]) -> ExecutionResult:
        """Execute price prediction."""
        # Simulate price prediction
        await asyncio.sleep(0.3)
        
        direction = parameters.get("direction", "neutral")
        confidence = parameters.get("confidence", 0.5)
        
        # Generate random prediction based on direction
        change_pct = random.uniform(0.01, 0.1) * (1 if direction == "bullish" else -1 if direction == "bearish" else 0)
        
        return ExecutionResult(
            success=True,
            output={
                "direction": direction,
                "predicted_change_percent": change_pct,
                "confidence": confidence,
                "time_frame": parameters.get("time_frame", "medium_term"),
                "supporting_factors": parameters.get("factors", {}),
                "timestamp": "2025-06-27T11:49:58+01:00",
                "prediction_id": f"pred-{''.join(random.choices('0123456789abcdef', k=8))}"
            },
            error=None
        )
