"""
Admin service for system management and oversight.
"""

from typing import List, Dict, Optional
from backend.database.mysql_connection import MySQLConnection
from backend.services.auth_service import get_password_hash
import mysql.connector


def create_default_admin():
    """Create default admin account if it doesn't exist."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if admin exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            ("admin@gmail.com",)
        )
        existing = cursor.fetchone()
        
        if not existing:
            # Create admin account
            password_hash = get_password_hash("12345678")
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, role)
                VALUES (%s, %s, 'admin')
                """,
                ("admin@gmail.com", password_hash)
            )
            admin_id = cursor.lastrowid
            
            # Create admin profile
            cursor.execute(
                """
                INSERT INTO user_profiles (user_id, first_name, last_name)
                VALUES (%s, 'System', 'Administrator')
                """,
                (admin_id,)
            )
            conn.commit()
            print("Default admin account created: admin@gmail.com / 12345678")
    except mysql.connector.Error as e:
        conn.rollback()
        print(f"Error creating admin: {e}")
    finally:
        cursor.close()
        conn.close()


def log_admin_action(admin_id: int, action: str, target_type: str = None, 
                     target_id: int = None, details: str = None):
    """Log admin activity for audit trail."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (admin_id, action, target_type, target_id, details)
        )
        conn.commit()
    except mysql.connector.Error as e:
        print(f"Error logging admin action: {e}")
    finally:
        cursor.close()
        conn.close()


def get_system_statistics() -> Dict:
    """Get comprehensive system statistics."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        stats = {}
        
        # User statistics
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        stats['users_by_role'] = cursor.fetchall()
        
        cursor.execute("SELECT COUNT(*) as total FROM users")
        stats['total_users'] = cursor.fetchone()['total']
        
        # Job statistics
        cursor.execute("SELECT COUNT(*) as total FROM job_postings")
        stats['total_jobs'] = cursor.fetchone()['total']
        
        cursor.execute("SELECT status, COUNT(*) as count FROM job_postings GROUP BY status")
        stats['jobs_by_status'] = cursor.fetchall()
        
        # Count only active job postings
        cursor.execute("SELECT COUNT(*) as total FROM job_postings WHERE status = 'active'")
        stats['active_jobs'] = cursor.fetchone()['total']
        
        # Application statistics
        cursor.execute("SELECT COUNT(*) as total FROM applications")
        stats['total_applications'] = cursor.fetchone()['total']
        
        cursor.execute("SELECT status, COUNT(*) as count FROM applications GROUP BY status")
        stats['applications_by_status'] = cursor.fetchall()
        
        # Recent activity
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        stats['new_users_week'] = cursor.fetchone()['count']
        
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM job_postings 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        stats['new_jobs_week'] = cursor.fetchone()['count']
        
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM applications 
            WHERE applied_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        stats['new_applications_week'] = cursor.fetchone()['count']
        
        return stats
    finally:
        cursor.close()
        conn.close()


def get_all_users_admin(limit: int = 100, offset: int = 0) -> List[Dict]:
    """Get all users with detailed information for admin."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT u.id, u.email, u.role, u.created_at,
                   up.first_name, up.last_name, up.phone, up.location,
                   (SELECT COUNT(*) FROM applications WHERE jobseeker_id = u.id) as application_count,
                   (SELECT COUNT(*) FROM job_postings WHERE recruiter_id = u.id) as job_count
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            ORDER BY u.created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def update_user_status(admin_id: int, user_id: int, action: str) -> bool:
    """Enable or disable user account."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Add status column if needed (we'll add this to schema)
        if action == "disable":
            cursor.execute(
                "UPDATE users SET role = CONCAT(role, '_disabled') WHERE id = %s",
                (user_id,)
            )
        elif action == "enable":
            cursor.execute(
                "UPDATE users SET role = REPLACE(role, '_disabled', '') WHERE id = %s",
                (user_id,)
            )
        
        conn.commit()
        log_admin_action(admin_id, f"User {action}d", "user", user_id)
        return True
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_admin_logs(limit: int = 100) -> List[Dict]:
    """Get admin activity logs."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT al.*, u.email as admin_email
            FROM admin_logs al
            JOIN users u ON al.admin_id = u.id
            ORDER BY al.created_at DESC
            LIMIT %s
            """,
            (limit,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def delete_user_admin(admin_id: int, user_id: int) -> Dict:
    """
    Delete a user (admin function).
    Handles cleanup of related data including ChromaDB embeddings.
    
    Args:
        admin_id: ID of admin performing the deletion
        user_id: ID of user to delete
        
    Returns:
        Dict with deletion details
    """
    from backend.database.chroma_connection import ChromaConnection
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Prevent deleting yourself
        if admin_id == user_id:
            raise ValueError("Cannot delete your own account")
        
        # Check if user exists and get user info
        cursor.execute(
            """
            SELECT id, email, role 
            FROM users 
            WHERE id = %s
            """,
            (user_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            raise ValueError("User not found")
        
        # Prevent deleting default admin account
        if user['email'] == 'admin@gmail.com':
            raise ValueError("Cannot delete the default admin account")
        
        # Get user's resumes for ChromaDB cleanup
        cursor.execute(
            "SELECT id FROM resumes WHERE user_id = %s",
            (user_id,)
        )
        resume_ids = [row['id'] for row in cursor.fetchall()]
        
        # Get user's job postings for ChromaDB cleanup (if recruiter)
        job_ids = []
        if user['role'] == 'recruiter':
            cursor.execute(
                "SELECT id FROM job_postings WHERE recruiter_id = %s",
                (user_id,)
            )
            job_ids = [row['id'] for row in cursor.fetchall()]
        
        # Delete ChromaDB embeddings for resumes
        try:
            for resume_id in resume_ids:
                ChromaConnection.delete_resume_embedding(resume_id)
            print(f"Deleted {len(resume_ids)} resume embeddings from ChromaDB")
        except Exception as e:
            print(f"Warning: Error deleting resume embeddings from ChromaDB: {e}")
        
        # Delete ChromaDB embeddings for job postings (if recruiter)
        try:
            for job_id in job_ids:
                ChromaConnection.delete_job_embedding(job_id)
            print(f"Deleted {len(job_ids)} job embeddings from ChromaDB")
        except Exception as e:
            print(f"Warning: Error deleting job embeddings from ChromaDB: {e}")
        
        # Delete user (CASCADE will handle related records in MySQL)
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        deleted = cursor.rowcount > 0
        
        if not deleted:
            raise ValueError("Failed to delete user")
        
        conn.commit()
        
        # Log admin action
        log_admin_action(
            admin_id, 
            f"Deleted user: {user['email']} (Role: {user['role']})", 
            "user", 
            user_id,
            f"Deleted {len(resume_ids)} resumes, {len(job_ids)} job postings"
        )
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "deleted_user": {
                "id": user_id,
                "email": user['email'],
                "role": user['role']
            },
            "cleanup": {
                "resumes_deleted": len(resume_ids),
                "job_postings_deleted": len(job_ids),
                "embeddings_cleaned": len(resume_ids) + len(job_ids)
            }
        }
        
    except ValueError as e:
        raise e
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    except Exception as e:
        conn.rollback()
        raise ValueError(f"Error deleting user: {e}")
    finally:
        cursor.close()
        conn.close()

