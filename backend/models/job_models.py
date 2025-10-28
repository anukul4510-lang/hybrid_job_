"""
Job posting and application models.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class JobPostingCreate(BaseModel):
    """Schema for creating a job posting."""
    title: str
    company: str
    description: str
    location: Optional[str] = None
    employment_type: str = "full-time"
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    application_deadline: Optional[date] = None
    required_skills: List[int] = []


class JobPostingUpdate(BaseModel):
    """Schema for updating a job posting."""
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = None


class JobPostingResponse(BaseModel):
    """Schema for job posting response."""
    id: int
    recruiter_id: int
    title: str
    company: str
    description: str
    location: Optional[str]
    employment_type: str
    min_salary: Optional[float]
    max_salary: Optional[float]
    posted_date: datetime
    application_deadline: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    """Schema for creating an application."""
    job_id: int
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    status: Optional[str] = None
    cover_letter: Optional[str] = None


class ApplicationResponse(BaseModel):
    """Schema for application response."""
    id: int
    jobseeker_id: int
    job_id: int
    resume_url: Optional[str]
    cover_letter: Optional[str]
    status: str
    applied_date: datetime
    reviewed_date: Optional[datetime]
    updated_at: datetime
    
    # Additional job details
    job_title: Optional[str] = None
    company: Optional[str] = None
    
    class Config:
        from_attributes = True


class SavedJobCreate(BaseModel):
    """Schema for saving a job."""
    job_id: int


class SavedJobResponse(BaseModel):
    """Schema for saved job response."""
    id: int
    jobseeker_id: int
    job_id: int
    saved_date: datetime
    job_title: Optional[str] = None
    company: Optional[str] = None
    
    class Config:
        from_attributes = True

