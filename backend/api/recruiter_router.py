"""
Recruiter API routes.
Handles job posting management and application review.
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.models.job_models import (
    JobPostingCreate, JobPostingUpdate
)
from backend.services.job_service import (
    create_job_posting, get_job_posting, update_job_posting,
    delete_job_posting, get_all_job_postings
)
from backend.services.search_service import index_job_posting
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
    cursor = conn.cursor()
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
    cursor = conn.cursor()
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
    cursor = conn.cursor()
    
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

