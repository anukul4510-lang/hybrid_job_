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
    address: Optional[str] = None
    job_of_choice: Optional[str] = None
    bio: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    job_of_choice: Optional[str] = None
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
    address: Optional[str]
    job_of_choice: Optional[str]
    email: Optional[str] = None  # Email from users table
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


# Resume Models
class ResumeAddByUrl(BaseModel):
    """Schema for adding an existing resume by URL."""
    title: str
    file_url: str


class WorkExperienceItem(BaseModel):
    """Schema for a work experience entry."""
    company: str
    position: str
    start_date: str  # Format: "YYYY-MM"
    end_date: Optional[str] = None  # Format: "YYYY-MM" or "Present"
    description: Optional[str] = None
    location: Optional[str] = None


class EducationItem(BaseModel):
    """Schema for an education entry."""
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: str  # Format: "YYYY-MM"
    end_date: Optional[str] = None  # Format: "YYYY-MM" or "Present"
    gpa: Optional[str] = None
    location: Optional[str] = None


class ReferenceItem(BaseModel):
    """Schema for a reference."""
    name: str
    position: str
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None


class ProjectItem(BaseModel):
    """Schema for a project entry."""
    name: str
    description: str
    technologies: Optional[str] = None  # Comma-separated tech stack
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None


class VolunteerItem(BaseModel):
    """Schema for a volunteer experience entry."""
    organization: str
    role: str
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    location: Optional[str] = None


class PublicationItem(BaseModel):
    """Schema for a publication entry."""
    title: str
    authors: Optional[str] = None
    journal: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None


class ResumeBuildRequest(BaseModel):
    """Schema for building a resume from structured input."""
    title: str
    # Personal Information
    summary: Optional[str] = None
    objective: Optional[str] = None
    # Experience & Education
    work_experience: List[WorkExperienceItem] = []
    education: List[EducationItem] = []
    # Additional sections
    certifications: List[str] = []
    languages: List[str] = []
    awards: List[str] = []
    references: List[ReferenceItem] = []
    projects: List[ProjectItem] = []
    volunteer_experience: List[VolunteerItem] = []
    publications: List[PublicationItem] = []
    hobbies: List[str] = []
    # Additional info
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    twitter_url: Optional[str] = None
    stackoverflow_url: Optional[str] = None


class ResumeResponse(BaseModel):
    """Schema for resume response."""
    id: int
    user_id: int
    title: str
    content: Optional[str]
    file_url: Optional[str]
    is_primary: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True