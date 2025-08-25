# ===============================================================================
# CRUD AI CHAT APP - OLLAMA AI SERVICE
# ===============================================================================
# Integration with Ollama local AI model for generating chat responses
# Handles AI API communication and conversation context management

import httpx
import json
import os
from typing import Optional, Dict, Any

# ===============================================================================
# OLLAMA SERVICE CLASS
# ===============================================================================
# Main service class for interacting with Ollama AI models

class OllamaService:
    def __init__(self, base_url: str = None, model: str = "llama3.2:3b"):
        # Use environment variable or default to localhost
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model
        self.client = httpx.AsyncClient()
        print(f"🤖 Ollama Service initialized with URL: {self.base_url}, Model: {self.model}")
    
    # ===============================================================================
    # AI RESPONSE GENERATION
    # ===============================================================================
    # Generate AI response using Ollama's chat completion API
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Generate AI response using Ollama
        """
        try:
            messages = []
            
            # Add system prompt if provided (sets AI behavior/personality)
            if system_prompt:
                messages.append({
                    "role": "system", 
                    "content": system_prompt
                })
            
            # Add user message
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            # Prepare API payload
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False
            }
            
            # Call Ollama API
            response = await self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=30.0
            )
            
            # Process response
            if response.status_code == 200:
                result = response.json()
                return result.get("message", {}).get("content", "")
            else:
                print(f"Ollama API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error calling Ollama API: {e}")
            return None
    
    # ===============================================================================
    # SERVICE AVAILABILITY CHECK
    # ===============================================================================
    # Check if Ollama service is running and the model is available
    async def is_available(self) -> bool:
        """
        Check if Ollama service is running and model is available
        """
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return any(model.get("name", "").startswith(self.model.split(":")[0]) for model in models)
            return False
        except Exception:
            return False
    
    # ===============================================================================
    # CLEANUP
    # ===============================================================================
    # Close HTTP client connection
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# ===============================================================================
# GLOBAL SERVICE INSTANCE
# ===============================================================================
# Single instance to be used throughout the application
ollama_service = OllamaService()
