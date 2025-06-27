"""
AI Service implementation for MetaPilot AI Engine v2.0.
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union
import httpx
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class AIService:
    """
    AI Service for MetaPilot AI Engine v2.0.
    Provides a unified interface for all AI capabilities using GROQ API.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the AI Service.

        Args:
            api_key: Optional API key for GROQ. If not provided, will use environment variable.
        """
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")

        # Default model settings
        self.default_model = "llama3-70b-8192"
        self.default_temperature = 0.7
        self.default_max_tokens = 1024
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
        
        # Initialize HTTP client for API calls
        self.client = httpx.AsyncClient(timeout=60.0)
        
        logger.info("AIService initialized with GROQ API and SentenceTransformer embeddings")
    
    async def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """
        Generate text using the GROQ API.
        
        Args:
            prompt: The prompt to generate text from
            temperature: Controls randomness (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Generated text
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.default_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = await self.client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            return f"Error generating text: {str(e)}"
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using SentenceTransformer.
        
        Args:
            texts: List of texts to generate embeddings for
            
        Returns:
            List of embedding vectors
        """
        try:
            # Generate embeddings using SentenceTransformer
            embeddings = self.embedding_model.encode(texts)
            
            # Convert numpy arrays to lists for JSON serialization
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            return []
    
    async def chain_of_thought(self, question: str, context: Optional[str] = None) -> Dict[str, str]:
        """
        Generate a chain of thought reasoning process for a question.
        
        Args:
            question: The question to reason about
            context: Optional context information
            
        Returns:
            Dictionary with reasoning steps and final answer
        """
        try:
            # Create prompt for chain of thought
            if context:
                prompt = f"""
                Context information:
                {context}
                
                Question: {question}
                
                Please think through this step by step and provide your reasoning before giving the final answer.
                """
            else:
                prompt = f"""
                Question: {question}
                
                Please think through this step by step and provide your reasoning before giving the final answer.
                """
            
            # Generate the response
            response = await self.generate_text(
                prompt=prompt,
                temperature=0.3,
                max_tokens=2048
            )
            
            # Parse the response to separate reasoning from answer
            lines = response.strip().split('\n')
            reasoning = '\n'.join(lines[:-1]) if len(lines) > 1 else ''
            answer = lines[-1] if lines else ''
            
            return {
                "reasoning": reasoning,
                "answer": answer
            }
        except Exception as e:
            logger.error(f"Error in chain of thought reasoning: {str(e)}")
            return {
                "reasoning": f"Error in reasoning process: {str(e)}",
                "answer": "Unable to provide an answer due to an error."
            }
    
    async def generate_structured_output(self, prompt: str, output_schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate structured output according to a schema.
        
        Args:
            prompt: The prompt to generate from
            output_schema: JSON schema defining the expected output structure
            
        Returns:
            Structured output matching the schema
        """
        try:
            # Create a prompt that includes the schema
            schema_prompt = f"""
            {prompt}
            
            Please provide a response in the following JSON format:
            {json.dumps(output_schema, indent=2)}
            
            Your response should be valid JSON that matches this schema exactly.
            """
            
            # Generate the response
            response = await self.generate_text(schema_prompt, temperature=0.2)
            
            # Extract JSON from the response
            try:
                # Find JSON content between triple backticks if present
                if "```json" in response:
                    json_str = response.split("```json")[1].split("```")[0].strip()
                elif "```" in response:
                    json_str = response.split("```")[1].strip()
                else:
                    json_str = response.strip()
                
                # Parse the JSON
                result = json.loads(json_str)
                return result
            except json.JSONDecodeError:
                logger.error("Failed to parse JSON from response")
                return {"error": "Failed to generate valid JSON output"}
                
        except Exception as e:
            logger.error(f"Error generating structured output: {str(e)}")
            return {"error": f"Error generating structured output: {str(e)}"}
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Sentiment analysis results
        """
        prompt = f"""
        Analyze the sentiment of the following text. Provide a score from -1.0 (very negative) 
        to 1.0 (very positive), and identify the key emotional tones.
        
        Text: {text}
        
        Format your response as JSON with the following structure:
        {{
            "sentiment_score": float,
            "sentiment_label": "positive|neutral|negative",
            "emotional_tones": ["emotion1", "emotion2"],
            "key_phrases": ["phrase1", "phrase2"]
        }}
        """
        
        try:
            result = await self.generate_structured_output(prompt, {
                "sentiment_score": 0.0,
                "sentiment_label": "neutral",
                "emotional_tones": [],
                "key_phrases": []
            })
            return result
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            return {
                "sentiment_score": 0.0,
                "sentiment_label": "neutral",
                "emotional_tones": [],
                "key_phrases": [],
                "error": str(e)
            }
    
    async def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extract named entities from text.
        
        Args:
            text: Text to extract entities from
            
        Returns:
            List of extracted entities with type and value
        """
        prompt = f"""
        Extract all named entities from the following text. Identify people, organizations, 
        locations, cryptocurrencies, blockchain protocols, and other relevant entities.
        
        Text: {text}
        
        Format your response as a JSON array with the following structure for each entity:
        [
            {{
                "entity": "entity name",
                "type": "person|organization|location|cryptocurrency|protocol|other",
                "relevance": "high|medium|low"
            }}
        ]
        """
        
        try:
            result = await self.generate_structured_output(prompt, [
                {
                    "entity": "",
                    "type": "",
                    "relevance": ""
                }
            ])
            return result
        except Exception as e:
            logger.error(f"Error in entity extraction: {str(e)}")
            return [{"entity": "error", "type": "error", "relevance": "low", "error": str(e)}]
    
    async def summarize(self, text: str, max_length: int = 200) -> str:
        """
        Summarize text to a specified maximum length.
        
        Args:
            text: Text to summarize
            max_length: Maximum length of summary in characters
            
        Returns:
            Summarized text
        """
        prompt = f"""
        Summarize the following text in a concise way, capturing the key points.
        Keep the summary under {max_length} characters.
        
        Text: {text}
        
        Summary:
        """
        
        try:
            summary = await self.generate_text(prompt, temperature=0.3, max_tokens=max_length // 4)
            return summary
        except Exception as e:
            logger.error(f"Error in text summarization: {str(e)}")
            return f"Error summarizing text: {str(e)}"
