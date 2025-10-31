"""
Job seeker API routes.
Handles profile management, job browsing, and applications.
"""

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from typing import List
import os
import shutil
import uuid
from pathlib import Path
from backend.models.user_models import (
    UserProfileCreate, UserProfileUpdate,
    UserSkillCreate, SkillCreate, ResumeAddByUrl,
    ResumeBuildRequest
)
from backend.models.job_models import ApplicationCreate, SavedJobCreate
from backend.services.user_service import (
    create_user_profile, get_user_profile, update_user_profile,
    add_user_skill, get_user_skills, remove_user_skill, get_all_skills,
    get_skill_recommendations, create_skill_if_not_exists
)
from backend.services.resume_service import (
    create_resume, get_user_resumes, get_resume, update_resume,
    delete_resume, set_primary_resume, build_resume_from_structured_data
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


@router.get("/skills/recommendations")
async def get_skill_recommendations_endpoint(query: str = None, limit: int = 10):
    """Get skill recommendations."""
    return get_skill_recommendations(query, limit)


@router.post("/skills/create")
async def create_new_skill(
    skill_name: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new skill and add to user profile."""
    try:
        skill = create_skill_if_not_exists(skill_name)
        # Automatically add to user's skills
        from backend.models.user_models import UserSkillCreate
        user_skill = UserSkillCreate(skill_id=skill['id'])
        return add_user_skill(current_user.user_id, user_skill)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Resume endpoints
# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads/resumes")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/resumes/upload-file")
async def upload_resume_file(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a PDF/resume file. Accepts PDF, DOC, DOCX files.
    Saves the file and stores the path in the database.
    """
    # Validate file type
    allowed_extensions = {'.pdf', '.doc', '.docx'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Create user-specific directory
        user_dir = UPLOADS_DIR / str(current_user.user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = user_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get relative path for database
        relative_path = f"uploads/resumes/{current_user.user_id}/{unique_filename}"
        
        # Save resume record
        return create_resume(current_user.user_id, title, None, relative_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload error: {str(e)}")


@router.post("/resumes/add-url")
async def add_resume_url(
    resume_data: ResumeAddByUrl,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Add an existing resume by providing a URL.
    Useful for resumes hosted on external services (Dropbox, Google Drive, etc.).
    """
    try:
        return create_resume(current_user.user_id, resume_data.title, None, resume_data.file_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/resumes/build")
async def build_resume_endpoint(
    resume_data: ResumeBuildRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Build a new resume from structured user input.
    Takes all necessary details in different fields and creates a formatted resume.
    """
    try:
        return build_resume_from_structured_data(current_user.user_id, resume_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/resumes")
async def get_my_resumes(current_user: TokenData = Depends(get_current_user)):
    """Get all resumes for current user."""
    return get_user_resumes(current_user.user_id)


@router.get("/resumes/{resume_id}")
async def get_resume_endpoint(
    resume_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific resume."""
    resume = get_resume(resume_id)
    if not resume or resume['user_id'] != current_user.user_id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/resumes/{resume_id}")
async def update_resume_endpoint(
    resume_id: int,
    title: str = None,
    content: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a resume."""
    try:
        return update_resume(resume_id, current_user.user_id, title, content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/resumes/{resume_id}")
async def delete_resume_endpoint(
    resume_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a resume."""
    try:
        delete_resume(resume_id, current_user.user_id)
        return {"message": "Resume deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/resumes/{resume_id}/primary")
async def set_primary_resume_endpoint(
    resume_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """Set a resume as primary."""
    try:
        set_primary_resume(resume_id, current_user.user_id)
        return {"message": "Resume set as primary"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Enhanced application filtering
@router.get("/applications/search")
async def search_my_applications(
    status: str = None,
    company: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    """Search and filter applications."""
    from backend.database.mysql_connection import MySQLConnection
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        where_clauses = ["a.jobseeker_id = %s"]
        params = [current_user.user_id]
        
        if status:
            where_clauses.append("a.status = %s")
            params.append(status)
        
        if company:
            where_clauses.append("j.company LIKE %s")
            params.append(f"%{company}%")
        
        query = f"""
            SELECT a.*, j.title as job_title, j.company
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            WHERE {' AND '.join(where_clauses)}
            ORDER BY a.applied_date DESC
        """
        
        cursor.execute(query, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

