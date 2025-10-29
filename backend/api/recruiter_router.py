"""
Recruiter API routes.
Handles job posting management and application review.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from backend.models.job_models import (
    JobPostingCreate, JobPostingUpdate
)
from backend.services.job_service import (
    create_job_posting, get_job_posting, update_job_posting,
    delete_job_posting, get_all_job_postings
)
from backend.services.search_service import index_job_posting
from backend.services.recruiter_service import (
    advanced_user_search, shortlist_candidate, get_shortlisted_candidates,
    update_shortlist_status, remove_from_shortlist
)
from backend.utils.dependencies import get_current_recruiter, TokenData

router = APIRouter()


@router.post("/jobs")
async def create_job(
    job_data: JobPostingCreate,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Create a new job posting."""
    try:
        job = create_job_posting(current_user.user_id, job_data)
        # Index in ChromaDB asynchronously
        index_job_posting(job['id'])
        return job
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/jobs")
async def get_my_jobs(current_user: TokenData = Depends(get_current_recruiter)):
    """Get all job postings by current recruiter."""
    from backend.database.mysql_connection import MySQLConnection
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary cursor
    cursor.execute(
        "SELECT * FROM job_postings WHERE recruiter_id = %s ORDER BY created_at DESC",
        (current_user.user_id,)
    )
    jobs = cursor.fetchall()
    cursor.close()
    conn.close()
    return jobs


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: int,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Get a specific job posting."""
    job = get_job_posting(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/jobs/{job_id}")
async def update_job(
    job_id: int,
    job_data: JobPostingUpdate,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Update a job posting."""
    try:
        job = update_job_posting(job_id, current_user.user_id, job_data)
        # Re-index in ChromaDB
        index_job_posting(job_id)
        return job
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Delete a job posting."""
    try:
        delete_job_posting(job_id, current_user.user_id)
        return {"message": "Job posting deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/jobs/{job_id}/applications")
async def get_job_applications(
    job_id: int,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Get all applications for a specific job."""
    from backend.database.mysql_connection import MySQLConnection
    
    # Verify ownership
    job = get_job_posting(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job['recruiter_id'] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT a.*, u.email, up.first_name, up.last_name
        FROM applications a
        JOIN users u ON a.jobseeker_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE a.job_id = %s
        ORDER BY a.applied_date DESC
        """,
        (job_id,)
    )
    applications = cursor.fetchall()
    cursor.close()
    conn.close()
    return applications


@router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status: str,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Update application status."""
    from backend.database.mysql_connection import MySQLConnection
    from datetime import datetime
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get application to verify ownership
        cursor.execute(
            "SELECT job_id FROM applications WHERE id = %s",
            (application_id,)
        )
        app = cursor.fetchone()
        
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        job = get_job_posting(app['job_id'])
        if job['recruiter_id'] != current_user.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        cursor.execute(
            "UPDATE applications SET status = %s, reviewed_date = %s WHERE id = %s",
            (status, datetime.utcnow(), application_id)
        )
        conn.commit()
        
        return {"message": "Application status updated successfully"}
    finally:
        cursor.close()
        conn.close()


@router.get("/users/search")
async def search_candidates(
    query: str,
    location: str = None,
    min_experience: int = None,
    limit: int = 20,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Advanced user search with natural language query parsing."""
    try:
        filters = {}
        if location:
            filters['location'] = location
        if min_experience:
            filters['min_experience'] = min_experience
        
        return advanced_user_search(query, filters, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}")
async def get_candidate_profile(
    user_id: int,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Get detailed profile of a candidate."""
    from backend.database.mysql_connection import MySQLConnection
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user profile
        cursor.execute(
            """
            SELECT u.id, u.email, u.created_at,
                   up.first_name, up.last_name, up.phone, up.location,
                   up.bio, up.years_experience, up.resume_url,
                   up.linkedin_url, up.portfolio_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = %s AND u.role = 'jobseeker'
            """,
            (user_id,)
        )
        profile = cursor.fetchone()
        
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Get skills
        cursor.execute(
            """
            SELECT s.id, s.name, us.proficiency_level
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s
            """,
            (user_id,)
        )
        profile['skills'] = cursor.fetchall()
        
        # Get resumes
        cursor.execute(
            "SELECT * FROM resumes WHERE user_id = %s ORDER BY is_primary DESC, created_at DESC",
            (user_id,)
        )
        profile['resumes'] = cursor.fetchall()
        
        return profile
    finally:
        cursor.close()
        conn.close()


# Shortlist endpoints
@router.post("/shortlist")
async def add_to_shortlist(
    candidate_id: int,
    job_id: int = None,
    match_score: float = None,
    notes: str = None,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Add a candidate to shortlist."""
    try:
        return shortlist_candidate(
            current_user.user_id, 
            candidate_id, 
            job_id, 
            match_score, 
            notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/shortlist")
async def get_my_shortlist(
    status: str = None,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Get all shortlisted candidates."""
    try:
        return get_shortlisted_candidates(current_user.user_id, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/shortlist/{shortlist_id}")
async def update_shortlist(
    shortlist_id: int,
    status: str,
    notes: str = None,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Update shortlist candidate status."""
    try:
        return update_shortlist_status(shortlist_id, current_user.user_id, status, notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/shortlist/{shortlist_id}")
async def remove_shortlist(
    shortlist_id: int,
    current_user: TokenData = Depends(get_current_recruiter)
):
    """Remove a candidate from shortlist."""
    try:
        remove_from_shortlist(shortlist_id, current_user.user_id)
        return {"message": "Candidate removed from shortlist"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

