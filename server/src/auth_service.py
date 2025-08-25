"""
Auth0 Authentication Service
Handles JWT token verification and user authentication
"""
import os
import json
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from functools import lru_cache

# Security scheme for Bearer tokens
security = HTTPBearer()

class Auth0Service:
    def __init__(self):
        self.domain = os.getenv("AUTH0_DOMAIN")
        self.api_audience = os.getenv("AUTH0_API_AUDIENCE")
        self.issuer = os.getenv("AUTH0_ISSUER")
        self.algorithms = [os.getenv("AUTH0_ALGORITHMS", "RS256")]
        
        # Make Auth0 optional for development
        self.auth_enabled = all([self.domain, self.api_audience, self.issuer])
        
        if not self.auth_enabled:
            print("⚠️  Auth0 disabled - missing configuration. Running without authentication.")
    
    @lru_cache(maxsize=128)
    async def get_signing_key(self, kid: str):
        """Get the RSA key from Auth0's JWKS endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"https://{self.domain}/.well-known/jwks.json")
                response.raise_for_status()
                jwks = response.json()
                
                for key in jwks["keys"]:
                    if key["kid"] == kid:
                        return {
                            "kty": key["kty"],
                            "kid": key["kid"],
                            "use": key["use"],
                            "n": key["n"],
                            "e": key["e"]
                        }
                        
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unable to find appropriate key"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unable to get signing key: {str(e)}"
            )
    
    async def verify_token(self, token: str) -> dict:
        """Verify JWT token and return user information"""
        if not self.auth_enabled:
            # Return a mock user for development
            return {
                "sub": "dev-user-123",
                "email": "dev@example.com",
                "nickname": "Developer",
                "name": "Development User"
            }
            
        try:
            # Get token header to find the key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token header"
                )
            
            # Get the RSA key
            rsa_key = await self.get_signing_key(kid)
            
            # Verify the token
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=self.algorithms,
                audience=self.api_audience,
                issuer=self.issuer
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {str(e)}"
            )

# Create global auth service instance
auth_service = Auth0Service()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency to get current authenticated user"""
    token = credentials.credentials
    user = await auth_service.verify_token(token)
    return user

# Optional dependency for routes that can work with or without auth
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """FastAPI dependency for optional authentication"""
    if not auth_service.auth_enabled:
        # Return mock user when Auth0 is disabled
        return {
            "sub": "dev-user-123",
            "email": "dev@example.com", 
            "nickname": "Developer",
            "name": "Development User"
        }
    
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        user = await auth_service.verify_token(token)
        return user
    except HTTPException:
        return None
