"""
Admin API routes.
Handles user management and system administration.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from backend.database.mysql_connection import MySQLConnection
from backend.services.admin_service import (
    get_system_statistics, get_all_users_admin, update_user_status,
    get_admin_logs, delete_user_admin, log_admin_action
)
from backend.utils.dependencies import get_current_admin, TokenData

router = APIRouter()


@router.get("/users")
async def get_all_users(
    limit: int = 100,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_admin)
):
    """Get all users in the system with pagination."""
    try:
        return get_all_users_admin(limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_system_stats(current_user: TokenData = Depends(get_current_admin)):
    """Get comprehensive system statistics."""
    try:
        return get_system_statistics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    new_role: str,
    current_user: TokenData = Depends(get_current_admin)
):
    """Update a user's role."""
    if new_role not in ['jobseeker', 'recruiter', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "UPDATE users SET role = %s WHERE id = %s",
            (new_role, user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        log_admin_action(current_user.user_id, f"Updated user role to {new_role}", "user", user_id)
        
        return {"message": "User role updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.put("/users/{user_id}/status")
async def update_user_status_endpoint(
    user_id: int,
    action: str,
    current_user: TokenData = Depends(get_current_admin)
):
    """Enable or disable a user account."""
    if action not in ['enable', 'disable']:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    try:
        update_user_status(current_user.user_id, user_id, action)
        return {"message": f"User {action}d successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: TokenData = Depends(get_current_admin)
):
    """Delete a user account. This will permanently delete the user and all related data."""
    try:
        result = delete_user_admin(current_user.user_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs")
async def get_admin_activity_logs(
    limit: int = 100,
    current_user: TokenData = Depends(get_current_admin)
):
    """Get admin activity logs."""
    try:
        return get_admin_logs(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def get_all_jobs_admin(current_user: TokenData = Depends(get_current_admin)):
    """Get all job postings for admin oversight."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT jp.*, u.email as recruiter_email,
                   (SELECT COUNT(*) FROM applications WHERE job_id = jp.id) as application_count
            FROM job_postings jp
            JOIN users u ON jp.recruiter_id = u.id
            ORDER BY jp.created_at DESC
            """
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@router.delete("/jobs/{job_id}")
async def delete_job_admin(
    job_id: int,
    current_user: TokenData = Depends(get_current_admin)
):
    """Delete a job posting (admin override)."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("DELETE FROM job_postings WHERE id = %s", (job_id,))
        conn.commit()
        
        log_admin_action(current_user.user_id, "Deleted job posting", "job", job_id)
        
        return {"message": "Job deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

