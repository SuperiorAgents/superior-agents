import os
import logging
from datetime import datetime
from typing import Dict, Optional
import json

import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VaultService:
    def __init__(self, env_path: str = "../.env"):
        """Initialize the vault service."""
        # Load from root .env file
        load_dotenv(dotenv_path=env_path)
        self.access_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        
        # Vault credentials
        self.client_id = os.getenv("VAULT_CLIENT_ID")
        self.client_secret = os.getenv("VAULT_CLIENT_SECRET")
        self.org_id = os.getenv("VAULT_ORGANIZATION_ID")
        self.project_id = os.getenv("VAULT_PROJECT_ID")
        self.app_name = os.getenv("VAULT_APP_NAME")
        
        if not all([self.client_id, self.client_secret, self.org_id, self.project_id, self.app_name]):
            logger.warning("Vault credentials not found in environment variables")
            logger.info(f"Checking credentials:")
            logger.info(f"VAULT_CLIENT_ID: {'✓' if self.client_id else '✗'}")
            logger.info(f"VAULT_CLIENT_SECRET: {'✓' if self.client_secret else '✗'}")
            logger.info(f"VAULT_ORGANIZATION_ID: {'✓' if self.org_id else '✗'}")
            logger.info(f"VAULT_PROJECT_ID: {'✓' if self.project_id else '✗'}")
            logger.info(f"VAULT_APP_NAME: {'✓' if self.app_name else '✗'}")
            return
            
        self._refresh_token()
    
    def _map_twitter_credentials(self, secrets: Dict[str, str]) -> None:
        """Map Twitter credentials from vault secrets to environment variables."""
        credential_mapping = {
            "ACCESS_TOKEN": "TWITTER_ACCESS_TOKEN",
            "ACCESS_TOKEN_SECRET": "TWITTER_ACCESS_TOKEN_SECRET",
            "API_KEY": "TWITTER_API_KEY",
            "API_KEY_SECRET": "TWITTER_API_SECRET",
            "BEARER_TOKEN": "TWITTER_BEARER_TOKEN",
            "CLIENT_ID": "TWITTER_CLIENT_ID",
            "CLIENT_SECRET": "TWITTER_CLIENT_SECRET"
        }
        
        for vault_key, env_key in credential_mapping.items():
            if vault_key in secrets:
                os.environ[env_key] = secrets[vault_key]

        logger.info("Twitter credentials mapped to environment variables")
    
    def print_all_env_secrets(self):
        """Print all environment variables and secrets."""
        print("\n=== Environment Variables and Secrets ===\n")
        
        # Get secrets from vault first
        vault_secrets = self.get_all_secrets()
        if vault_secrets:
            # Map Twitter credentials from vault secrets
            self._map_twitter_credentials(vault_secrets)
            
            print("Vault Secrets:")
            print("-" * 40)
            for key, value in vault_secrets.items():
                print(f"{key}: {value}")
        
        # Print Twitter credentials (now mapped from vault)
        print("\nTwitter Credentials:")
        print("-" * 40)
        twitter_vars = {
            "TWITTER_ACCESS_TOKEN": os.getenv("TWITTER_ACCESS_TOKEN"),
            "TWITTER_ACCESS_TOKEN_SECRET": os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
            "TWITTER_API_KEY": os.getenv("TWITTER_API_KEY"),
            "TWITTER_API_SECRET": os.getenv("TWITTER_API_SECRET"),
            "TWITTER_BEARER_TOKEN": os.getenv("TWITTER_BEARER_TOKEN"),
            "TWITTER_CLIENT_ID": os.getenv("TWITTER_CLIENT_ID"),
            "TWITTER_CLIENT_SECRET": os.getenv("TWITTER_CLIENT_SECRET")
        }
        for key, value in twitter_vars.items():
            if value:
                print(f"{key}: {value}")
        
        # Print other important credentials
        print("\nOther Credentials:")
        print("-" * 40)
        other_vars = {
            "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY"),
            "COINGECKO_API_KEY": os.getenv("COINGECKO_API_KEY"),
            "DB_DATABASE": os.getenv("DB_DATABASE")
        }
        for key, value in other_vars.items():
            if value:
                print(f"{key}: {value}")
    
    def _refresh_token(self) -> None:
        """Get a new access token from HashiCorp Vault."""
        try:
            auth_url = "https://auth.hashicorp.com/oauth/token"
            auth_data = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "audience": "https://api.hashicorp.cloud",
            }
            
            response = requests.post(auth_url, data=auth_data)
            if response.status_code != 200:
                logger.error(f"Failed to get auth token. Status: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return
                
            data = response.json()
            self.access_token = data["access_token"]
            # Set token expiry (usually 1 hour)
            self.token_expiry = datetime.utcnow().timestamp() + data.get("expires_in", 3600)

            
        except Exception as e:
            logger.error(f"Error refreshing vault token: {str(e)}")
    
    def _ensure_valid_token(self) -> bool:
        """Ensure we have a valid access token."""
        if not self.access_token or not self.token_expiry:
            self._refresh_token()
            return bool(self.access_token)
            
        if datetime.utcnow().timestamp() >= self.token_expiry:
            self._refresh_token()
            
        return bool(self.access_token)
    
    def get_all_secrets(self) -> Dict[str, str]:
        """Get all secrets from vault."""
        if not self._ensure_valid_token():
            logger.error("No valid vault token available")
            return {}
            
        try:
            base_url = "https://api.cloud.hashicorp.com/secrets/2023-11-28"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
            }
            
            secrets_url = f"{base_url}/organizations/{self.org_id}/projects/{self.project_id}/apps/{self.app_name}/secrets:open"
            logger.info(f"Fetching secrets from: {secrets_url}")
            
            response = requests.get(secrets_url, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to get secrets. Status: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return {}
                
            secrets_data = response.json()
            secrets = {}
            
            # Extract all secrets
            for secret in secrets_data.get("secrets", []):
                name = secret["name"]
                value = secret["static_version"]["value"]
                secrets[name] = value

            # map twitter credentials
            self._map_twitter_credentials(secrets)
                    
            return secrets
            
        except Exception as e:
            logger.error(f"Error getting secrets: {str(e)}")
            return {}
    
    def get_notification_secrets(self) -> Dict[str, str]:
        """Get notification-related secrets from vault."""
        all_secrets = self.get_all_secrets()
        return {k: v for k, v in all_secrets.items() if k.startswith("NOTIFICATION_")}

def print_secrets(env_path: str = "../.env"):
    """Print all secrets from vault in a formatted way."""
    vault = VaultService(env_path=env_path)
    
    print("\n=== Vault Secrets ===\n")
    
    # Print all secrets
    all_secrets = vault.get_all_secrets()
    if not all_secrets:
        print("No secrets found or unable to access vault")
        return
        
    print("All Secrets:")
    print("-" * 40)
    for name, value in all_secrets.items():
        print(f"{name}: {value}")
    
    print("\nNotification Secrets:")
    print("-" * 40)
    notification_secrets = vault.get_notification_secrets()
    if notification_secrets:
        for name, value in notification_secrets.items():
            print(f"{name}: {value}")
    else:
        print("No notification-specific secrets found")

if __name__ == "__main__":
    # Try different paths for .env file
    possible_paths = [
        "../.env",
        "../../.env",
        "../superior-agents/.env",
        ".env"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"Found .env file at: {path}")
            vault = VaultService(env_path=path)
            vault.print_all_env_secrets()
            break
    else:
        print("No .env file found in any of the following locations:")
        for path in possible_paths:
            print(f"- {path}") 