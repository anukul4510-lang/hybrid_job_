"""
Job seeker API routes.
Handles profile management, job browsing, and applications.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.models.user_models import (
    UserProfileCreate, UserProfileUpdate,
    UserSkillCreate, SkillCreate
)
from backend.models.job_models import ApplicationCreate, SavedJobCreate
from backend.services.user_service import (
    create_user_profile, get_user_profile, update_user_profile,
    add_user_skill, get_user_skills, remove_user_skill, get_all_skills
)
from backend.services.job_service import (
    get_all_job_postings, create_application, get_user_applications,
    save_job, get_saved_jobs
)
from backend.services.search_service import get_recommendations
from backend.utils.dependencies import get_current_user, TokenData

router = APIRouter()


@router.post("/profile")
async def create_profile(
    profile_data: UserProfileCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create user profile."""
    try:
        return create_user_profile(current_user.user_id, profile_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile")
async def get_profile(current_user: TokenData = Depends(get_current_user)):
    """Get user profile."""
    profile = get_user_profile(current_user.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile")
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update user profile."""
    try:
        return update_user_profile(current_user.user_id, profile_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/jobs")
async def browse_jobs(
    filters: dict = None,
    limit: int = 50,
    current_user: TokenData = Depends(get_current_user)
):
    """Browse available job postings."""
    return get_all_job_postings(filters, limit)


@router.post("/applications")
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Apply to a job."""
    try:
        return create_application(current_user.user_id, application_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/applications")
async def get_my_applications(current_user: TokenData = Depends(get_current_user)):
    """Get all applications for current user."""
    return get_user_applications(current_user.user_id)


@router.post("/jobs/save")
async def save_job_for_later(
    saved_job_data: SavedJobCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Save a job for later."""
    try:
        return save_job(current_user.user_id, saved_job_data.job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/jobs/saved")
async def get_my_saved_jobs(current_user: TokenData = Depends(get_current_user)):
    """Get all saved jobs."""
    return get_saved_jobs(current_user.user_id)


@router.get("/recommendations")
async def get_job_recommendations(
    limit: int = 10,
    current_user: TokenData = Depends(get_current_user)
):
    """Get AI-powered job recommendations."""
    return get_recommendations(current_user.user_id, limit)


@router.get("/skills")
async def list_all_skills():
    """Get all available skills."""
    return get_all_skills()


@router.post("/skills")
async def add_skill(
    skill_data: UserSkillCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Add a skill to user profile."""
    try:
        return add_user_skill(current_user.user_id, skill_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-skills")
async def get_my_skills(current_user: TokenData = Depends(get_current_user)):
    """Get all skills for current user."""
    return get_user_skills(current_user.user_id)


@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """Remove a skill from user profile."""
    try:
        remove_user_skill(current_user.user_id, skill_id)
        return {"message": "Skill removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

