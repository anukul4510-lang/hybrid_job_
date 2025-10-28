"""
Dependency injection utilities for FastAPI.
Provides JWT token validation and user extraction.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from backend.services.auth_service import verify_token, TokenData

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Dependency to get current authenticated user.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        TokenData: Decoded token data
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data is None:
        raise credentials_exception
    
    return token_data


async def get_current_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """
    Dependency to ensure user is an admin.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        TokenData: Decoded token data
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_recruiter(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """
    Dependency to ensure user is a recruiter.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        TokenData: Decoded token data
        
    Raises:
        HTTPException: If user is not a recruiter
    """
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

