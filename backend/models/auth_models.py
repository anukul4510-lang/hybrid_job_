"""
Authentication and authorization models.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    role: str = "jobseeker"


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    email: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

