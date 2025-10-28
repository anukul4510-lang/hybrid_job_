"""
Admin API routes.
Handles user management and system administration.
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.database.mysql_connection import MySQLConnection
from backend.utils.dependencies import get_current_admin, TokenData

router = APIRouter()


@router.get("/users")
async def get_all_users(current_user: TokenData = Depends(get_current_admin)):
    """Get all users in the system."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            SELECT u.id, u.email, u.role, u.created_at,
                   up.first_name, up.last_name
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            ORDER BY u.created_at DESC
            """
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@router.get("/stats")
async def get_system_stats(current_user: TokenData = Depends(get_current_admin)):
    """Get system statistics."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    try:
        stats = {}
        
        # User counts by role
        cursor.execute(
            "SELECT role, COUNT(*) as count FROM users GROUP BY role"
        )
        stats['users_by_role'] = cursor.fetchall()
        
        # Total jobs
        cursor.execute("SELECT COUNT(*) as total FROM job_postings")
        stats['total_jobs'] = cursor.fetchone()['total']
        
        # Active jobs
        cursor.execute("SELECT COUNT(*) as active FROM job_postings WHERE status = 'active'")
        stats['active_jobs'] = cursor.fetchone()['active']
        
        # Total applications
        cursor.execute("SELECT COUNT(*) as total FROM applications")
        stats['total_applications'] = cursor.fetchone()['total']
        
        return stats
    finally:
        cursor.close()
        conn.close()


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
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE users SET role = %s WHERE id = %s",
            (new_role, user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User role updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

