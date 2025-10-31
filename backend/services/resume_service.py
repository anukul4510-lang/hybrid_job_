"""
Resume management service for job seekers.
"""

from typing import List, Dict, Optional
from backend.database.mysql_connection import MySQLConnection
from backend.models.user_models import ResumeBuildRequest
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


def build_resume_from_structured_data(user_id: int, resume_data: ResumeBuildRequest) -> dict:
    """
    Build a resume from structured user input.
    Creates a formatted text content from the provided data.
    """
    # Get user profile information
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user contact info
        cursor.execute(
            """
            SELECT u.email, up.first_name, up.last_name, up.phone, up.location
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = %s
            """,
            (user_id,)
        )
        user_info = cursor.fetchone()
        
        # Get user skills
        cursor.execute(
            """
            SELECT s.name, us.proficiency_level
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s
            ORDER BY us.proficiency_level DESC
            """,
            (user_id,)
        )
        skills = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    
    # Build resume content
    resume_content = []
    
    # Header
    resume_content.append("=" * 80)
    resume_content.append(f"{user_info['first_name'] or ''} {user_info['last_name'] or ''}".strip().upper())
    resume_content.append("=" * 80)
    resume_content.append("")
    
    # Contact Information
    contact_lines = []
    if user_info.get('email'):
        contact_lines.append(f"Email: {user_info['email']}")
    if user_info.get('phone'):
        contact_lines.append(f"Phone: {user_info['phone']}")
    if user_info.get('location'):
        contact_lines.append(f"Location: {user_info['location']}")
    
    # Add professional links (split into two rows for better formatting)
    social_links = []
    if resume_data.linkedin_url:
        social_links.append(f"LinkedIn: {resume_data.linkedin_url}")
    if resume_data.github_url:
        social_links.append(f"GitHub: {resume_data.github_url}")
    if resume_data.portfolio_url:
        social_links.append(f"Portfolio: {resume_data.portfolio_url}")
    if resume_data.website_url:
        social_links.append(f"Website: {resume_data.website_url}")
    if resume_data.twitter_url:
        social_links.append(f"Twitter: {resume_data.twitter_url}")
    if resume_data.stackoverflow_url:
        social_links.append(f"Stack Overflow: {resume_data.stackoverflow_url}")
    
    if contact_lines:
        resume_content.append(" | ".join(contact_lines))
    if social_links:
        resume_content.append(" | ".join(social_links))
    if contact_lines or social_links:
        resume_content.append("")
    
    # Objective or Summary
    if resume_data.objective:
        resume_content.append("OBJECTIVE")
        resume_content.append("-" * 80)
        resume_content.append(resume_data.objective)
        resume_content.append("")
    
    if resume_data.summary:
        resume_content.append("SUMMARY")
        resume_content.append("-" * 80)
        resume_content.append(resume_data.summary)
        resume_content.append("")
    
    # Work Experience
    if resume_data.work_experience:
        resume_content.append("WORK EXPERIENCE")
        resume_content.append("-" * 80)
        for exp in resume_data.work_experience:
            duration = f"{exp.start_date} - {exp.end_date or 'Present'}"
            resume_content.append(f"{exp.position} | {exp.company}")
            if exp.location:
                resume_content.append(f"{exp.location} | {duration}")
            else:
                resume_content.append(duration)
            if exp.description:
                resume_content.append(f"  {exp.description}")
            resume_content.append("")
    
    # Education
    if resume_data.education:
        resume_content.append("EDUCATION")
        resume_content.append("-" * 80)
        for edu in resume_data.education:
            education_line = f"{edu.degree}"
            if edu.field_of_study:
                education_line += f" in {edu.field_of_study}"
            education_line += f" | {edu.institution}"
            if edu.location:
                education_line += f" | {edu.location}"
            resume_content.append(education_line)
            duration = f"{edu.start_date} - {edu.end_date or 'Present'}"
            if edu.gpa:
                resume_content.append(f"{duration} | GPA: {edu.gpa}")
            else:
                resume_content.append(duration)
            resume_content.append("")
    
    # Skills
    if skills:
        resume_content.append("SKILLS")
        resume_content.append("-" * 80)
        skill_names = [skill['name'] for skill in skills]
        resume_content.append(", ".join(skill_names))
        resume_content.append("")
    
    # Languages
    if resume_data.languages:
        resume_content.append("LANGUAGES")
        resume_content.append("-" * 80)
        resume_content.append(", ".join(resume_data.languages))
        resume_content.append("")
    
    # Certifications
    if resume_data.certifications:
        resume_content.append("CERTIFICATIONS")
        resume_content.append("-" * 80)
        for cert in resume_data.certifications:
            resume_content.append(f"  • {cert}")
        resume_content.append("")
    
    # Awards
    if resume_data.awards:
        resume_content.append("AWARDS")
        resume_content.append("-" * 80)
        for award in resume_data.awards:
            resume_content.append(f"  • {award}")
        resume_content.append("")
    
    # Projects
    if resume_data.projects:
        resume_content.append("PROJECTS")
        resume_content.append("-" * 80)
        for project in resume_data.projects:
            resume_content.append(f"{project.name}")
            if project.technologies:
                resume_content.append(f"  Technologies: {project.technologies}")
            duration_parts = []
            if project.start_date:
                duration_parts.append(project.start_date)
            if project.end_date:
                duration_parts.append(project.end_date)
            if duration_parts:
                resume_content.append(f"  Period: {' - '.join(duration_parts)}")
            if project.description:
                resume_content.append(f"  {project.description}")
            if project.url:
                resume_content.append(f"  URL: {project.url}")
            resume_content.append("")
    
    # Volunteer Experience
    if resume_data.volunteer_experience:
        resume_content.append("VOLUNTEER EXPERIENCE")
        resume_content.append("-" * 80)
        for vol in resume_data.volunteer_experience:
            duration = f"{vol.start_date} - {vol.end_date or 'Present'}"
            resume_content.append(f"{vol.role} | {vol.organization}")
            if vol.location:
                resume_content.append(f"{vol.location} | {duration}")
            else:
                resume_content.append(duration)
            if vol.description:
                resume_content.append(f"  {vol.description}")
            resume_content.append("")
    
    # Publications
    if resume_data.publications:
        resume_content.append("PUBLICATIONS")
        resume_content.append("-" * 80)
        for pub in resume_data.publications:
            resume_content.append(f"{pub.title}")
            if pub.authors:
                resume_content.append(f"  Authors: {pub.authors}")
            if pub.journal:
                resume_content.append(f"  Journal: {pub.journal}")
            if pub.date:
                resume_content.append(f"  Date: {pub.date}")
            if pub.url:
                resume_content.append(f"  URL: {pub.url}")
            resume_content.append("")
    
    # Hobbies & Interests
    if resume_data.hobbies:
        resume_content.append("HOBBIES & INTERESTS")
        resume_content.append("-" * 80)
        resume_content.append(", ".join(resume_data.hobbies))
        resume_content.append("")
    
    # References
    if resume_data.references:
        resume_content.append("REFERENCES")
        resume_content.append("-" * 80)
        for ref in resume_data.references:
            ref_line = f"{ref.name} | {ref.position} at {ref.company}"
            if ref.email:
                ref_line += f" | {ref.email}"
            if ref.phone:
                ref_line += f" | {ref.phone}"
            resume_content.append(ref_line)
            if ref.relationship:
                resume_content.append(f"  Relationship: {ref.relationship}")
            resume_content.append("")
    
    # Create the resume in database
    formatted_content = "\n".join(resume_content)
    return create_resume(user_id, resume_data.title, formatted_content, None)

