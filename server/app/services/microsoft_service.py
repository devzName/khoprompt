from __future__ import annotations

import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime, timezone

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class MicrosoftService:
    """Service for Microsoft 365 authentication and user info retrieval"""
    
    def __init__(self):
        self.graph_api_base = "https://graph.microsoft.com/v1.0"
    
    async def verify_access_token(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Microsoft access token and get user info from Microsoft Graph API
        
        Args:
            access_token: Microsoft access token from frontend
            
        Returns:
            Dict containing user info if token is valid, None otherwise
        """
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                # Get user profile from Microsoft Graph
                response = await client.get(
                    f"{self.graph_api_base}/me",
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    
                    # Extract relevant user information
                    user_info = {
                        'email': user_data.get('mail') or user_data.get('userPrincipalName'),
                        'full_name': user_data.get('displayName', ''),
                        'microsoft_id': user_data.get('id'),
                        'user_type': 'microsoft',
                        'avatar_url': None,  # Can be fetched separately if needed
                        'department': user_data.get('department', ''),
                        'job_title': user_data.get('jobTitle', ''),
                    }
                    
                    # Validate that user has email
                    if not user_info['email']:
                        logger.warning("Microsoft user has no email address")
                        return None
                    
                    # Optional: Validate domain if needed
                    domain = user_info['email'].split('@')[1] if '@' in user_info['email'] else ''
                    logger.info(f"Microsoft user authenticated: {user_info['email']} from domain: {domain}")
                    
                    return user_info
                    
                elif response.status_code == 401:
                    logger.warning("Microsoft access token is invalid or expired")
                    return None
                else:
                    logger.error(f"Microsoft Graph API error: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("Timeout while verifying Microsoft access token")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request error while verifying Microsoft access token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during Microsoft token verification: {str(e)}")
            return None
    
    async def get_user_photo(self, access_token: str) -> Optional[str]:
        """
        Get user profile photo from Microsoft Graph API
        
        Args:
            access_token: Microsoft access token
            
        Returns:
            Base64 encoded photo data or None
        """
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.graph_api_base}/me/photo/$value",
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    # Return base64 encoded image
                    import base64
                    photo_data = base64.b64encode(response.content).decode('utf-8')
                    return f"data:image/jpeg;base64,{photo_data}"
                else:
                    logger.info("No profile photo available for user")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching user photo: {str(e)}")
            return None