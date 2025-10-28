"""
User profile and related models.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserProfileCreate(BaseModel):
    """Schema for creating user profile."""
    first_name: str
    last_name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response."""
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    location: Optional[str]
    bio: Optional[str]
    profile_picture: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    """Schema for creating a skill."""
    name: str


class SkillResponse(BaseModel):
    """Schema for skill response."""
    id: int
    name: str
    
    class Config:
        from_attributes = True


class UserSkillCreate(BaseModel):
    """Schema for adding skill to user."""
    skill_id: int
    proficiency_level: str = "intermediate"


class UserSkillResponse(BaseModel):
    """Schema for user skill response."""
    user_id: int
    skill_id: int
    proficiency_level: str
    skill_name: str
    
    class Config:
        from_attributes = True

