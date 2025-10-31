"""
Job posting and application management service.
"""

from typing import List, Optional, Dict
from backend.database.mysql_connection import MySQLConnection
from backend.models.job_models import (
    JobPostingCreate, JobPostingUpdate,
    ApplicationCreate, ApplicationUpdate
)
import mysql.connector


def create_job_posting(recruiter_id: int, job_data: JobPostingCreate) -> dict:
    """Create a new job posting."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO job_postings 
            (recruiter_id, title, company, description, location, employment_type, 
             min_salary, max_salary, application_deadline)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (recruiter_id, job_data.title, job_data.company, job_data.description,
             job_data.location, job_data.employment_type, job_data.min_salary,
             job_data.max_salary, job_data.application_deadline)
        )
        
        job_id = cursor.lastrowid
        
        # Add required skills
        for skill_id in job_data.required_skills:
            cursor.execute(
                "INSERT INTO job_skills (job_id, skill_id, required) VALUES (%s, %s, TRUE)",
                (job_id, skill_id)
            )
        
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM job_postings WHERE id = %s",
            (job_id,)
        )
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_job_posting(job_id: int) -> Optional[dict]:
    """Get a job posting by ID."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM job_postings WHERE id = %s",
            (job_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def get_all_job_postings(filters: Optional[Dict] = None, limit: int = 50) -> List[dict]:
    """Get all job postings with optional filters."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Include recruiter email for contact option
        query = """
            SELECT j.*, u.email as recruiter_email, u.company_name as recruiter_company_name
            FROM job_postings j
            LEFT JOIN users u ON j.recruiter_id = u.id
            WHERE j.status = 'active'
        """
        params = []
        
        if filters:
            if "location" in filters:
                query += " AND j.location LIKE %s"
                params.append(f"%{filters['location']}%")
            if "employment_type" in filters:
                query += " AND j.employment_type = %s"
                params.append(filters['employment_type'])
            if "company" in filters:
                query += " AND j.company LIKE %s"
                params.append(f"%{filters['company']}%")
        
        query += " ORDER BY j.posted_date DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def update_job_posting(job_id: int, recruiter_id: int, job_data: JobPostingUpdate) -> dict:
    """Update a job posting."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify ownership
        cursor.execute(
            "SELECT recruiter_id FROM job_postings WHERE id = %s",
            (job_id,)
        )
        job = cursor.fetchone()
        if not job or job['recruiter_id'] != recruiter_id:
            raise ValueError("Unauthorized: You don't own this job posting")
        
        update_fields = []
        values = []
        
        if job_data.title is not None:
            update_fields.append("title = %s")
            values.append(job_data.title)
        if job_data.company is not None:
            update_fields.append("company = %s")
            values.append(job_data.company)
        if job_data.description is not None:
            update_fields.append("description = %s")
            values.append(job_data.description)
        if job_data.location is not None:
            update_fields.append("location = %s")
            values.append(job_data.location)
        if job_data.employment_type is not None:
            update_fields.append("employment_type = %s")
            values.append(job_data.employment_type)
        if job_data.min_salary is not None:
            update_fields.append("min_salary = %s")
            values.append(job_data.min_salary)
        if job_data.max_salary is not None:
            update_fields.append("max_salary = %s")
            values.append(job_data.max_salary)
        if job_data.application_deadline is not None:
            update_fields.append("application_deadline = %s")
            values.append(job_data.application_deadline)
        if job_data.status is not None:
            update_fields.append("status = %s")
            values.append(job_data.status)
        
        if update_fields:
            values.append(job_id)
            cursor.execute(
                f"UPDATE job_postings SET {', '.join(update_fields)} WHERE id = %s",
                tuple(values)
            )
            conn.commit()
        
        return get_job_posting(job_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def delete_job_posting(job_id: int, recruiter_id: int):
    """Delete a job posting."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify ownership
        cursor.execute(
            "SELECT recruiter_id FROM job_postings WHERE id = %s",
            (job_id,)
        )
        job = cursor.fetchone()
        if not job or job['recruiter_id'] != recruiter_id:
            raise ValueError("Unauthorized: You don't own this job posting")
        
        cursor.execute("DELETE FROM job_postings WHERE id = %s", (job_id,))
        conn.commit()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def create_application(jobseeker_id: int, application_data: ApplicationCreate) -> dict:
    """Create a new job application."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if job exists and is active
        cursor.execute(
            "SELECT status FROM job_postings WHERE id = %s",
            (application_data.job_id,)
        )
        job = cursor.fetchone()
        if not job:
            raise ValueError("Job posting not found")
        if job['status'] != 'active':
            raise ValueError("Job posting is not active")
        
        cursor.execute(
            """
            INSERT INTO applications (jobseeker_id, job_id, resume_url, cover_letter)
            VALUES (%s, %s, %s, %s)
            """,
            (jobseeker_id, application_data.job_id, 
             application_data.resume_url, application_data.cover_letter)
        )
        
        application_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM applications WHERE id = %s",
            (application_id,)
        )
        return cursor.fetchone()
    except mysql.connector.IntegrityError:
        raise ValueError("You have already applied for this job")
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_user_applications(user_id: int) -> List[dict]:
    """Get all applications for a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT a.*, j.title as job_title, j.company, j.recruiter_id,
                   u.company_name as recruiter_company_name
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            LEFT JOIN users u ON j.recruiter_id = u.id
            WHERE a.jobseeker_id = %s
            ORDER BY a.applied_date DESC
            """,
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def save_job(jobseeker_id: int, job_id: int) -> dict:
    """Save a job for later."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "INSERT INTO saved_jobs (jobseeker_id, job_id) VALUES (%s, %s)",
            (jobseeker_id, job_id)
        )
        saved_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            """
            SELECT sj.*, j.title as job_title, j.company
            FROM saved_jobs sj
            JOIN job_postings j ON sj.job_id = j.id
            WHERE sj.id = %s
            """,
            (saved_id,)
        )
        return cursor.fetchone()
    except mysql.connector.IntegrityError:
        raise ValueError("Job already saved")
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_saved_jobs(jobseeker_id: int) -> List[dict]:
    """Get all saved jobs for a user."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT sj.*, j.title as job_title, j.company, u.email as recruiter_email, u.company_name as recruiter_company_name
            FROM saved_jobs sj
            JOIN job_postings j ON sj.job_id = j.id
            LEFT JOIN users u ON j.recruiter_id = u.id
            WHERE sj.jobseeker_id = %s
            ORDER BY sj.saved_date DESC
            """,
            (jobseeker_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

