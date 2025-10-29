"""
Recruiter-specific services including advanced user search.
"""

import google.generativeai as genai
from typing import List, Dict, Optional
import time
import config
from backend.database.mysql_connection import MySQLConnection
from backend.database.chroma_connection import ChromaConnection


# Initialize Gemini
genai.configure(api_key=config.settings.gemini_api_key)


def parse_search_query_with_ai(query: str) -> Dict:
    """
    Use Gemini AI to parse natural language search into structured filters.
    
    Example: "experienced Python developers in New York"
    Returns: {"skills": ["Python"], "location": "New York", "experience": "experienced"}
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Parse the following job search query into structured filters.
        Extract: skills, location, experience level, and any other relevant filters.
        
        Query: "{query}"
        
        Return ONLY a JSON object with these fields (use null for missing values):
        {{
            "skills": ["skill1", "skill2"],
            "location": "location",
            "min_experience": number or null,
            "keywords": ["keyword1", "keyword2"]
        }}
        
        Do not include any explanation, just the JSON.
        """
        
        response = model.generate_content(prompt)
        
        # Try to parse the response as JSON
        import json
        import re
        
        # Extract JSON from response
        text = response.text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            filters = json.loads(json_match.group())
            return filters
        
        return {}
    except Exception as e:
        print(f"Error parsing query with AI: {e}")
        # Fallback to simple keyword search
        return {"keywords": [query]}


def generate_user_embedding(user_profile: Dict) -> List[float]:
    """Generate embedding for user profile."""
    try:
        # Combine user profile information into text
        text_parts = []
        if user_profile.get('skills'):
            text_parts.append(" ".join(user_profile['skills']))
        if user_profile.get('bio'):
            text_parts.append(user_profile['bio'])
        if user_profile.get('location'):
            text_parts.append(user_profile['location'])
        
        text = " ".join(text_parts)
        
        if not text:
            return [0.0] * 768
        
        model = genai.GenerativeModel('models/embedding-001')
        response = model.generate_embeddings([text])
        return response['embeddings'][0]['values']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.0] * 768


def calculate_match_score(candidate: Dict, query_filters: Dict) -> float:
    """
    Calculate match percentage for a candidate based on query filters.
    
    Args:
        candidate: Candidate profile data
        query_filters: Parsed query filters
        
    Returns:
        Match score as percentage (0-100)
    """
    score = 0.0
    max_score = 0.0
    
    # Skills matching (40% weight)
    if query_filters.get('skills'):
        max_score += 40
        candidate_skills = candidate.get('skills', '').lower().split(',') if candidate.get('skills') else []
        query_skills = [s.lower() for s in query_filters['skills']]
        
        if candidate_skills:
            matched_skills = sum(1 for qs in query_skills if any(qs in cs for cs in candidate_skills))
            score += (matched_skills / len(query_skills)) * 40
    
    # Location matching (20% weight)
    if query_filters.get('location'):
        max_score += 20
        candidate_location = candidate.get('location', '').lower()
        query_location = query_filters['location'].lower()
        
        if query_location in candidate_location or candidate_location in query_location:
            score += 20
    
    # Experience matching (30% weight)
    if query_filters.get('min_experience'):
        max_score += 30
        candidate_exp = candidate.get('years_experience', 0) or 0
        required_exp = query_filters['min_experience']
        
        if candidate_exp >= required_exp:
            # Full points if meets or exceeds
            score += 30
        elif candidate_exp > 0:
            # Partial points if close
            score += (candidate_exp / required_exp) * 30
    
    # Profile completeness (10% weight)
    max_score += 10
    completeness = 0
    if candidate.get('bio'):
        completeness += 3
    if candidate.get('skills'):
        completeness += 3
    if candidate.get('resume_url'):
        completeness += 4
    score += completeness
    
    # Normalize score to 100%
    if max_score > 0:
        return min(100, (score / max_score) * 100)
    return 50.0  # Default score if no criteria


def advanced_user_search(query: str, filters: Optional[Dict] = None, limit: int = 20) -> Dict:
    """
    Advanced user search combining NLP query parsing, SQL filtering, and vector search.
    
    Args:
        query: Natural language search query
        filters: Additional filters
        limit: Maximum results
        
    Returns:
        Search results with user profiles
    """
    start_time = time.time()
    
    try:
        # Parse query with AI
        ai_filters = parse_search_query_with_ai(query)
        
        # Merge AI filters with provided filters
        if filters:
            ai_filters.update(filters)
        
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Build SQL query
        where_clauses = ["u.role = 'jobseeker'"]  # Only search job seekers
        params = []
        
        # Location filter
        if ai_filters.get('location'):
            where_clauses.append("up.location LIKE %s")
            params.append(f"%{ai_filters['location']}%")
        
        # Experience filter
        if ai_filters.get('min_experience'):
            where_clauses.append("up.years_experience >= %s")
            params.append(ai_filters['min_experience'])
        
        # Skills filter
        if ai_filters.get('skills'):
            skills_conditions = []
            for skill in ai_filters['skills']:
                skills_conditions.append("s.name LIKE %s")
                params.append(f"%{skill}%")
            if skills_conditions:
                where_clauses.append(f"({' OR '.join(skills_conditions)})")
        
        # Keywords filter (bio, name)
        if ai_filters.get('keywords'):
            keyword_conditions = []
            for keyword in ai_filters['keywords']:
                keyword_conditions.append("(up.bio LIKE %s OR up.first_name LIKE %s OR up.last_name LIKE %s)")
                params.extend([f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"])
            if keyword_conditions:
                where_clauses.append(f"({' OR '.join(keyword_conditions)})")
        
        # Build final query
        query_sql = f"""
            SELECT DISTINCT
                u.id, u.email, u.created_at,
                up.first_name, up.last_name, up.phone, up.location,
                up.bio, up.years_experience, up.resume_url,
                GROUP_CONCAT(DISTINCT s.name) as skills
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_skills us ON u.id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.id
            WHERE {' AND '.join(where_clauses)}
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT %s
        """
        
        params.append(limit)
        
        cursor.execute(query_sql, tuple(params))
        results = cursor.fetchall()
        
        # Calculate match scores for each candidate
        for candidate in results:
            candidate['match_score'] = calculate_match_score(candidate, ai_filters)
        
        # Sort by match score (highest first)
        results.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        cursor.close()
        conn.close()
        
        execution_time = time.time() - start_time
        
        return {
            "results": results,
            "total_results": len(results),
            "execution_time": execution_time,
            "filters_applied": ai_filters
        }
        
    except Exception as e:
        print(f"Error in advanced user search: {e}")
        # Fallback to simple search
        return simple_user_search(filters or {}, limit)


def simple_user_search(filters: Dict, limit: int = 20) -> Dict:
    """Simple SQL-only user search fallback."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        where_clause = "WHERE u.role = 'jobseeker'"
        params = []
        
        if filters.get('location'):
            where_clause += " AND up.location LIKE %s"
            params.append(f"%{filters['location']}%")
        
        params.append(limit)
        
        query_sql = f"""
            SELECT u.id, u.email, u.created_at,
                   up.first_name, up.last_name, up.phone, up.location,
                   up.bio, up.years_experience
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            {where_clause}
            ORDER BY u.created_at DESC
            LIMIT %s
        """
        
        cursor.execute(query_sql, tuple(params))
        results = cursor.fetchall()
        
        # Calculate basic match scores
        for candidate in results:
            candidate['match_score'] = 60.0  # Default score for SQL-only search
        
        return {
            "results": results,
            "total_results": len(results),
            "execution_time": 0.0
        }
    finally:
        cursor.close()
        conn.close()


def shortlist_candidate(recruiter_id: int, candidate_id: int, job_id: int = None, 
                        match_score: float = None, notes: str = None) -> Dict:
    """Add a candidate to recruiter's shortlist."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            INSERT INTO shortlisted_candidates 
            (recruiter_id, candidate_id, job_id, match_score, notes)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (recruiter_id, candidate_id, job_id, match_score, notes)
        )
        shortlist_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM shortlisted_candidates WHERE id = %s",
            (shortlist_id,)
        )
        return cursor.fetchone()
    except mysql.connector.IntegrityError:
        raise ValueError("Candidate already shortlisted")
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def get_shortlisted_candidates(recruiter_id: int, status: str = None) -> List[Dict]:
    """Get all shortlisted candidates for a recruiter."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        where_clause = "WHERE sc.recruiter_id = %s"
        params = [recruiter_id]
        
        if status:
            where_clause += " AND sc.status = %s"
            params.append(status)
        
        query = f"""
            SELECT sc.*, 
                   u.email as candidate_email,
                   up.first_name, up.last_name, up.phone, up.location,
                   up.bio, up.years_experience, up.resume_url,
                   up.linkedin_url, up.portfolio_url,
                   GROUP_CONCAT(DISTINCT s.name) as skills,
                   jp.title as job_title
            FROM shortlisted_candidates sc
            JOIN users u ON sc.candidate_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_skills us ON u.id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.id
            LEFT JOIN job_postings jp ON sc.job_id = jp.id
            {where_clause}
            GROUP BY sc.id, u.email, up.first_name, up.last_name, up.phone, 
                     up.location, up.bio, up.years_experience, up.resume_url,
                     up.linkedin_url, up.portfolio_url, jp.title
            ORDER BY sc.match_score DESC, sc.shortlisted_date DESC
        """
        
        cursor.execute(query, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def update_shortlist_status(shortlist_id: int, recruiter_id: int, 
                            status: str, notes: str = None) -> Dict:
    """Update shortlist candidate status."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify ownership
        cursor.execute(
            "SELECT recruiter_id FROM shortlisted_candidates WHERE id = %s",
            (shortlist_id,)
        )
        shortlist = cursor.fetchone()
        
        if not shortlist or shortlist['recruiter_id'] != recruiter_id:
            raise ValueError("Unauthorized or shortlist entry not found")
        
        update_parts = ["status = %s"]
        params = [status]
        
        if notes is not None:
            update_parts.append("notes = %s")
            params.append(notes)
        
        params.append(shortlist_id)
        
        cursor.execute(
            f"UPDATE shortlisted_candidates SET {', '.join(update_parts)} WHERE id = %s",
            tuple(params)
        )
        conn.commit()
        
        cursor.execute(
            "SELECT * FROM shortlisted_candidates WHERE id = %s",
            (shortlist_id,)
        )
        return cursor.fetchone()
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def remove_from_shortlist(shortlist_id: int, recruiter_id: int):
    """Remove a candidate from shortlist."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "DELETE FROM shortlisted_candidates WHERE id = %s AND recruiter_id = %s",
            (shortlist_id, recruiter_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise ValueError("Shortlist entry not found or unauthorized")
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()

