"""
Authentication API routes.
Handles user registration, login, and token management.
"""

from fastapi import APIRouter, HTTPException, status
from backend.models.auth_models import UserCreate, UserLogin, Token, UserResponse
from backend.services.auth_service import (
    register_user, authenticate_user, create_access_token, get_user_by_id
)

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        
    Returns:
        UserResponse: New user information
    """
    try:
        user = register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Authenticate user and return JWT token.
    
    Args:
        user_data: Login credentials
        
    Returns:
        Token: JWT access token
    """
    user = authenticate_user(user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = None):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current user from dependency
        
    Returns:
        UserResponse: User information
    """
    # Note: current_user dependency should be injected
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

