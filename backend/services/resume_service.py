"""
Resume management service for job seekers.
"""

from typing import List, Dict, Optional
from backend.database.mysql_connection import MySQLConnection
import mysql.connector


def create_resume(user_id: int, title: str, content: str = None, file_url: str = None) -> dict:
    """Create a new resume."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO resumes (user_id, title, content, file_url)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, title, content, file_url)
        )
        resume_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM resumes WHERE id = %s",
            (resume_id,)
        )
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_user_resumes(user_id: int) -> List[dict]:
    """Get all resumes for a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM resumes WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def get_resume(resume_id: int) -> Optional[dict]:
    """Get a specific resume."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM resumes WHERE id = %s",
            (resume_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_resume(resume_id: int, user_id: int, title: str = None, content: str = None) -> dict:
    """Update a resume."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify ownership
        cursor.execute(
            "SELECT user_id FROM resumes WHERE id = %s",
            (resume_id,)
        )
        resume = cursor.fetchone()
        if not resume or resume['user_id'] != user_id:
            raise ValueError("Unauthorized or resume not found")
        
        update_fields = []
        values = []
        
        if title is not None:
            update_fields.append("title = %s")
            values.append(title)
        if content is not None:
            update_fields.append("content = %s")
            values.append(content)
        
        if update_fields:
            values.append(resume_id)
            cursor.execute(
                f"UPDATE resumes SET {', '.join(update_fields)} WHERE id = %s",
                tuple(values)
            )
            conn.commit()
        
        return get_resume(resume_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def delete_resume(resume_id: int, user_id: int):
    """Delete a resume."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "DELETE FROM resumes WHERE id = %s AND user_id = %s",
            (resume_id, user_id)
        )
        conn.commit()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def set_primary_resume(resume_id: int, user_id: int):
    """Set a resume as primary."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Unset all primary resumes for user
        cursor.execute(
            "UPDATE resumes SET is_primary = FALSE WHERE user_id = %s",
            (user_id,)
        )
        
        # Set this one as primary
        cursor.execute(
            "UPDATE resumes SET is_primary = TRUE WHERE id = %s AND user_id = %s",
            (resume_id, user_id)
        )
        conn.commit()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

