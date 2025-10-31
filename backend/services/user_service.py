"""
User profile and skill management service.
"""

from typing import List, Optional, Dict
from backend.database.mysql_connection import MySQLConnection
from backend.models.user_models import (
    UserProfileCreate, UserProfileUpdate, 
    SkillCreate, UserSkillCreate
)
import mysql.connector


def create_user_profile(user_id: int, profile_data: UserProfileCreate) -> dict:
    """Create a user profile."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO user_profiles (user_id, first_name, last_name, phone, location, address, job_of_choice, bio)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (user_id, profile_data.first_name, profile_data.last_name, 
             profile_data.phone, profile_data.location, profile_data.address, 
             profile_data.job_of_choice, profile_data.bio)
        )
        
        profile_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM user_profiles WHERE id = %s",
            (profile_id,)
        )
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_user_profile(user_id: int) -> Optional[dict]:
    """Get user profile by user ID, including email from users table."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT up.*, u.email
            FROM user_profiles up
            JOIN users u ON up.user_id = u.id
            WHERE up.user_id = %s
            """,
            (user_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_user_profile(user_id: int, profile_data: UserProfileUpdate) -> dict:
    """Update user profile."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        update_fields = []
        values = []
        
        if profile_data.first_name is not None:
            update_fields.append("first_name = %s")
            values.append(profile_data.first_name)
        if profile_data.last_name is not None:
            update_fields.append("last_name = %s")
            values.append(profile_data.last_name)
        if profile_data.phone is not None:
            update_fields.append("phone = %s")
            values.append(profile_data.phone)
        if profile_data.location is not None:
            update_fields.append("location = %s")
            values.append(profile_data.location)
        if profile_data.address is not None:
            update_fields.append("address = %s")
            values.append(profile_data.address)
        if profile_data.job_of_choice is not None:
            update_fields.append("job_of_choice = %s")
            values.append(profile_data.job_of_choice)
        if profile_data.bio is not None:
            update_fields.append("bio = %s")
            values.append(profile_data.bio)
        if profile_data.profile_picture is not None:
            update_fields.append("profile_picture = %s")
            values.append(profile_data.profile_picture)
        
        if not update_fields:
            return get_user_profile(user_id)
        
        values.append(user_id)
        cursor.execute(
            f"UPDATE user_profiles SET {', '.join(update_fields)} WHERE user_id = %s",
            tuple(values)
        )
        conn.commit()
        
        return get_user_profile(user_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def create_skill(skill_data: SkillCreate) -> dict:
    """Create a new skill."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "INSERT INTO skills (name) VALUES (%s)",
            (skill_data.name,)
        )
        skill_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute("SELECT * FROM skills WHERE id = %s", (skill_id,))
        return cursor.fetchone()
    except mysql.connector.IntegrityError:
        # Skill already exists, fetch and return it
        cursor.execute("SELECT * FROM skills WHERE name = %s", (skill_data.name,))
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_all_skills() -> List[dict]:
    """Get all skills."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM skills ORDER BY name")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def add_user_skill(user_id: int, user_skill_data: UserSkillCreate) -> dict:
    """Add a skill to a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO user_skills (user_id, skill_id, proficiency_level)
            VALUES (%s, %s, %s)
            """,
            (user_id, user_skill_data.skill_id, user_skill_data.proficiency_level)
        )
        conn.commit()
        
        cursor.execute(
            """
            SELECT us.*, s.name as skill_name
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s AND us.skill_id = %s
            """,
            (user_id, user_skill_data.skill_id)
        )
        return cursor.fetchone()
    except mysql.connector.IntegrityError:
        raise ValueError("User already has this skill")
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_user_skills(user_id: int) -> List[dict]:
    """Get all skills for a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT us.*, s.name as skill_name
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s
            """,
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def remove_user_skill(user_id: int, skill_id: int):
    """Remove a skill from a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "DELETE FROM user_skills WHERE user_id = %s AND skill_id = %s",
            (user_id, skill_id)
        )
        conn.commit()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_skill_recommendations(query: str = None, limit: int = 10) -> List[dict]:
    """Get skill recommendations based on query or popular skills."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        if query:
            # Search skills by name
            cursor.execute(
                """
                SELECT s.*, COUNT(us.user_id) as user_count
                FROM skills s
                LEFT JOIN user_skills us ON s.id = us.skill_id
                WHERE s.name LIKE %s
                GROUP BY s.id
                ORDER BY user_count DESC, s.name
                LIMIT %s
                """,
                (f"%{query}%", limit)
            )
        else:
            # Get most popular skills
            cursor.execute(
                """
                SELECT s.*, COUNT(us.user_id) as user_count
                FROM skills s
                LEFT JOIN user_skills us ON s.id = us.skill_id
                GROUP BY s.id
                ORDER BY user_count DESC, s.name
                LIMIT %s
                """,
                (limit,)
            )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_skill_if_not_exists(skill_name: str) -> dict:
    """Create a skill if it doesn't exist, otherwise return existing."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if skill exists
        cursor.execute(
            "SELECT * FROM skills WHERE name = %s",
            (skill_name,)
        )
        skill = cursor.fetchone()
        
        if skill:
            return skill
        
        # Create new skill
        cursor.execute(
            "INSERT INTO skills (name) VALUES (%s)",
            (skill_name,)
        )
        skill_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM skills WHERE id = %s",
            (skill_id,)
        )
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

