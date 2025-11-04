"""
Hybrid search service using SQL filters and ChromaDB vector search.
Integrates Gemini API for embedding generation.
"""

import os
import warnings
from typing import List, Dict, Optional
import time
import config

# Suppress warnings from gRPC/ALTS before importing Google AI
warnings.filterwarnings('ignore', category=UserWarning)
os.environ['GRPC_VERBOSITY'] = 'ERROR'

import google.generativeai as genai
from backend.database.mysql_connection import MySQLConnection
from backend.database.chroma_connection import ChromaConnection
import mysql.connector


# Initialize Gemini
genai.configure(api_key=config.settings.gemini_api_key)


def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for text using Gemini API.
    
    Args:
        text: Input text to embed
        
    Returns:
        List of float embeddings
    """
    try:
        # Use the correct embedding model and method
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating embedding: {e}")
        
        # Check if it's a quota exceeded error
        if "429" in error_msg or "quota" in error_msg.lower() or "quota exceeded" in error_msg.lower():
            print("⚠️ Gemini API quota exceeded - will fallback to SQL-only search")
            return None  # Return None to indicate quota issue
        
        # Fallback to zero vector for other errors
        return [0.0] * 768


def index_job_posting(job_id: int):
    """Index a job posting in ChromaDB."""
    try:
        # Get job details from MySQL
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT title, description, company, location FROM job_postings WHERE id = %s",
            (job_id,)
        )
        job = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not job:
            return
        
        # Create text for embedding
        text = f"{job['title']} {job['description']} {job['company']} {job['location']}"
        
        # Generate embedding
        embedding = generate_embedding(text)
        
        # Store in ChromaDB
        metadata = {
            "job_id": job_id,
            "title": job['title'],
            "company": job['company']
        }
        ChromaConnection.add_job_embedding(job_id, text, embedding, metadata)
    except Exception as e:
        print(f"Error indexing job posting: {e}")


def index_resume(resume_id: int, text: str):
    """Index a resume in ChromaDB."""
    try:
        embedding = generate_embedding(text)
        
        metadata = {"resume_id": resume_id}
        ChromaConnection.add_resume_embedding(resume_id, text, embedding, metadata)
    except Exception as e:
        print(f"Error indexing resume: {e}")


def hybrid_search(query: str, filters: Optional[Dict] = None, limit: int = 10) -> Dict:
    """
    Perform hybrid search combining vector search and SQL filters.
    
    Args:
        query: Natural language search query
        filters: SQL filters (location, employment_type, etc.)
        limit: Maximum number of results
        
    Returns:
        Search results with scores and search breakdown
    """
    start_time = time.time()
    
    # Debug: Print at start
    print(f"DEBUG: hybrid_search called with query='{query}', filters={filters}, limit={limit}")
    
    try:
        # Generate embedding for query
        query_embedding = generate_embedding(query)
        
        # Check if embedding generation failed due to quota
        if query_embedding is None:
            print("⚠️ Embedding generation failed - falling back to SQL-only search")
            return sql_only_search(filters, limit)
        
        print(f"DEBUG: Embedding generated successfully")
        
        # Perform vector search in ChromaDB
        vector_results = ChromaConnection.search_jobs(
            query_embedding=query_embedding,
            n_results=limit * 2,  # Get more results for filtering
            filters=None
        )
        
        # Extract job IDs and scores from vector results
        job_ids = []
        vector_scores = {}
        vector_ids = []
        
        if vector_results and 'ids' in vector_results and len(vector_results['ids']) > 0:
            if 'distances' in vector_results and len(vector_results['distances']) > 0:
                for idx, job_id_str in enumerate(vector_results['ids'][0]):
                    job_id = int(job_id_str.replace('job_', ''))
                    job_ids.append(job_id)
                    vector_ids.append(job_id)
                    if idx < len(vector_results['distances'][0]):
                        # Convert distance to similarity score (higher is better)
                        distance = vector_results['distances'][0][idx]
                        similarity = max(0, 100 * (1 - distance))
                        vector_scores[job_id] = round(similarity, 2)
        
        vector_count = len(vector_ids)
        
        # Apply SQL filters
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        where_clause = "WHERE j.status = 'active'"
        params = []
        
        sql_filter_applied = ""
        if job_ids:
            where_clause += f" AND j.id IN ({','.join(['%s']*len(job_ids))})"
            params.extend(job_ids)
            sql_filter_applied += f"[Vector IDs filtered: {len(job_ids)}] "
        
        if filters:
            if "location" in filters:
                where_clause += " AND j.location LIKE %s"
                params.append(f"%{filters['location']}%")
                sql_filter_applied += f"Location: {filters['location']} "
            if "employment_type" in filters:
                where_clause += " AND j.employment_type = %s"
                params.append(filters['employment_type'])
                sql_filter_applied += f"Type: {filters['employment_type']} "
            if "min_salary" in filters:
                where_clause += " AND (j.max_salary >= %s OR j.min_salary >= %s)"
                params.extend([filters['min_salary'], filters['min_salary']])
                sql_filter_applied += f"Min Salary: ${filters['min_salary']:,} "
            if "max_salary" in filters:
                where_clause += " AND (j.min_salary <= %s OR j.max_salary <= %s)"
                params.extend([filters['max_salary'], filters['max_salary']])
                sql_filter_applied += f"Max Salary: ${filters['max_salary']:,} "
        
        params.append(limit)
        
        query_sql = f"""
            SELECT j.*, u.email as recruiter_email, u.company_name as recruiter_company_name
            FROM job_postings j
            LEFT JOIN users u ON j.recruiter_id = u.id
            {where_clause}
            ORDER BY j.posted_date DESC
            LIMIT %s
        """
        
        cursor.execute(query_sql, tuple(params))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        execution_time = time.time() - start_time
        
        # Add similarity scores to results
        for result in results:
            if result['id'] in vector_scores:
                result['similarity_score'] = vector_scores[result['id']]
            else:
                result['similarity_score'] = 0
        
        # Print search breakdown
        print(f"\n{'='*80}")
        print(f"[SEARCH] HYBRID SEARCH BREAKDOWN")
        print(f"{'='*80}")
        print(f"Query: '{query}'")
        print(f"{'-'*80}")
        print(f"[INFO] Vector Search Results:")
        print(f"   * Vector matches found: {vector_count}")
        if vector_ids:
            print(f"   * Job IDs from vector: {vector_ids[:10]}{'...' if len(vector_ids) > 10 else ''}")
        print(f"{'-'*80}")
        print(f"[INFO] SQL Filter Applied:")
        if sql_filter_applied:
            print(f"   * {sql_filter_applied.strip()}")
        else:
            print(f"   * No additional filters")
        print(f"   * SQL clause: {where_clause}")
        print(f"{'-'*80}")
        print(f"[RESULT] Final Results:")
        print(f"   * Total jobs returned: {len(results)}")
        print(f"   * Execution time: {execution_time:.3f}s")
        if results:
            print(f"   * Jobs: {[r['title'][:30] for r in results[:5]]}")
        print(f"{'='*80}\n")
        
        return {
            "results": results,
            "total_results": len(results),
            "execution_time": execution_time,
            "search_breakdown": {
                "vector_matches": vector_count,
                "sql_filtered": len(results),
                "vector_job_ids": vector_ids,
                "filters_applied": filters or {}
            }
        }
        
    except Exception as e:
        print(f"Error in hybrid search: {e}")
        # Fallback to SQL-only search
        return sql_only_search(filters, limit)


def sql_only_search(filters: Optional[Dict] = None, limit: int = 10) -> Dict:
    """Fallback SQL-only search when vector search fails."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    where_clause = "WHERE j.status = 'active'"
    params = []
    
    if filters:
        if "location" in filters:
            where_clause += " AND j.location LIKE %s"
            params.append(f"%{filters['location']}%")
        if "employment_type" in filters:
            where_clause += " AND j.employment_type = %s"
            params.append(filters['employment_type'])
        if "min_salary" in filters:
            where_clause += " AND (j.max_salary >= %s OR j.min_salary >= %s)"
            params.extend([filters['min_salary'], filters['min_salary']])
        if "max_salary" in filters:
            where_clause += " AND (j.min_salary <= %s OR j.max_salary <= %s)"
            params.extend([filters['max_salary'], filters['max_salary']])
    
    params.append(limit)
    
    query_sql = f"""
        SELECT j.*, u.email as recruiter_email, u.company_name as recruiter_company_name
        FROM job_postings j
        LEFT JOIN users u ON j.recruiter_id = u.id
        {where_clause}
        ORDER BY j.posted_date DESC
        LIMIT %s
    """
    
    cursor.execute(query_sql, tuple(params))
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {
        "results": results,
        "total_results": len(results),
        "execution_time": 0.0,
        "search_breakdown": {
            "vector_matches": 0,
            "sql_filtered": len(results),
            "vector_job_ids": [],
            "filters_applied": filters or {}
        }
    }


def get_recommendations(user_id: int, limit: int = 10) -> List[Dict]:
    """
    Get job recommendations for a user based on their skills and profile.
    Excludes jobs the user has already applied to.
    
    Args:
        user_id: User ID
        limit: Maximum number of recommendations
        
    Returns:
        List of recommended jobs with match scores
    """
    try:
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get user skills
        cursor.execute(
            """
            SELECT s.name, us.proficiency_level FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s
            ORDER BY us.proficiency_level DESC
            """,
            (user_id,)
        )
        skills_data = cursor.fetchall()
        skills = [row['name'] for row in skills_data]
        
        # Get user profile (location, job_of_choice, bio)
        cursor.execute(
            """
            SELECT location, job_of_choice, bio, years_experience 
            FROM user_profiles WHERE user_id = %s
            """,
            (user_id,)
        )
        profile = cursor.fetchone()
        location = profile['location'] if profile else None
        job_of_choice = profile['job_of_choice'] if profile else None
        bio = profile['bio'] if profile else None
        years_experience = profile['years_experience'] if profile else 0
        
        # Get already applied job IDs to exclude
        cursor.execute(
            "SELECT job_id FROM applications WHERE jobseeker_id = %s",
            (user_id,)
        )
        applied_job_ids = [row['job_id'] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        if not skills:
            return []
        
        # Create query for recommendation based on profile
        query_parts = []
        if job_of_choice:
            query_parts.append(job_of_choice)
        if skills:
            # Use top skills (limit to 10 most important)
            top_skills = skills[:10]
            query_parts.extend(top_skills)
        query = " ".join(query_parts)
        
        filters = {}
        if location:
            filters['location'] = location
        
        # Get more results than needed to account for exclusions
        search_results = hybrid_search(query, filters, limit * 3)
        
        print(f"DEBUG: search_results keys: {search_results.keys()}")
        print(f"DEBUG: search_results results count: {len(search_results.get('results', []))}")
        print(f"DEBUG: search_results execution_time: {search_results.get('execution_time')}")
        
        # Always use skill-based search when Gemini quota is exceeded
        # Check if we got meaningful results with skill matching
        search_breakdown = search_results.get('search_breakdown', {})
        vector_matches = search_breakdown.get('vector_matches', 0)
        
        print(f"DEBUG: vector_matches = {vector_matches}, execution_time = {search_results.get('execution_time')}")
        
        # If no vector matches or execution_time is 0, it means sql_only_search was used
        # In that case, use skill-based search instead for proper skill matching
        if not search_results.get('results') or len(search_results['results']) == 0:
            print("⚠️ No results from hybrid search - using skill-based SQL search")
            filtered_results = _skill_based_sql_search(user_id, skills, location, applied_job_ids, limit * 3)
        elif vector_matches == 0 or search_results.get('execution_time') == 0.0:
            # This indicates sql_only_search was used (no vector search happened)
            # Use skill-based search for better matching
            print("⚠️ SQL-only search used (no vector matches) - using skill-based SQL search for better matching")
            filtered_results = _skill_based_sql_search(user_id, skills, location, applied_job_ids, limit * 3)
        else:
            # Filter out already applied jobs
            filtered_results = [
                job for job in search_results['results']
                if job['id'] not in applied_job_ids
            ]
        
        print(f"DEBUG: filtered_results count after filtering: {len(filtered_results)}")
        
        # Calculate match scores based on skills
        if filtered_results:
            # Get all job IDs
            job_ids = [job['id'] for job in filtered_results]
            
            # Get required skills for all jobs at once
            conn = MySQLConnection.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Get all job skills in one query
            job_skills_map = {}
            if job_ids:
                cursor.execute(
                    """
                    SELECT js.job_id, s.name 
                    FROM job_skills js
                    JOIN skills s ON js.skill_id = s.id
                    WHERE js.job_id IN ({})
                    """.format(','.join(['%s'] * len(job_ids))),
                    tuple(job_ids)
                )
                
                for row in cursor.fetchall():
                    job_id = row['job_id']
                    if job_id not in job_skills_map:
                        job_skills_map[job_id] = []
                    job_skills_map[job_id].append(row['name'])
            
            cursor.close()
            conn.close()
            
            # Calculate match scores for each job
            for job in filtered_results:
                job_id = job['id']
                required_skills = job_skills_map.get(job_id, [])
                
                # If job came from skill-based search, it already has matching_skills_count
                if 'matching_skills_count' in job:
                    # Use the count from the query
                    total_required_skills = len(required_skills) if required_skills else 1
                    if total_required_skills > 0:
                        match_score = (job['matching_skills_count'] / total_required_skills) * 100
                        job['match_score'] = round(match_score, 1)
                    else:
                        job['match_score'] = 50.0
                else:
                    # Calculate match score normally
                    if required_skills:
                        matching_skills = set(skills) & set(required_skills)
                        match_score = (len(matching_skills) / len(required_skills)) * 100
                        job['match_score'] = round(match_score, 1)
                    else:
                        # If no required skills, use similarity score or default
                        job['match_score'] = job.get('similarity_score', 50.0)
        
        # Sort by match score (highest first)
        filtered_results.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        # Return top N results
        return filtered_results[:limit]
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return []


def _skill_based_sql_search(user_id: int, skills: List[str], location: Optional[str], 
                            applied_job_ids: List[int], limit: int) -> List[Dict]:
    """
    SQL-based job search that matches jobs by required skills.
    Used as fallback when Gemini API is unavailable.
    
    Args:
        user_id: User ID
        skills: List of skill names
        location: User's preferred location
        applied_job_ids: List of job IDs user has already applied to
        limit: Maximum number of results
        
    Returns:
        List of matching jobs
    """
    if not skills:
        return []
    
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Build query to find jobs that have matching skills
        # Simplified approach: use JOIN instead of nested subqueries to avoid parameter issues
        skill_placeholders = ','.join(['%s'] * len(skills))
        
        where_clause = "WHERE j.status = 'active'"
        params = []
        
        # Match by skills - find jobs that require any of the user's skills
        where_clause += f"""
            AND j.id IN (
                SELECT DISTINCT js.job_id 
                FROM job_skills js
                JOIN skills s ON js.skill_id = s.id
                WHERE s.name IN ({skill_placeholders})
            )
        """
        params.extend(skills)
        
        # Exclude already applied jobs first
        exclude_applied = ""
        if applied_job_ids:
            exclude_placeholders = ','.join(['%s'] * len(applied_job_ids))
            exclude_applied = f" AND j.id NOT IN ({exclude_placeholders})"
        
        # Try strict matching first: with location filter
        # Parameters: skills (WHERE) + location + applied_job_ids + skills (SELECT) + limit
        all_params_strict = []
        all_params_strict.extend(skills)  # For WHERE subquery
        if location:
            where_clause += " AND j.location LIKE %s"
            all_params_strict.append(f"%{location}%")
        if applied_job_ids:
            all_params_strict.extend(applied_job_ids)
        all_params_strict.extend(skills)  # For SELECT COUNT
        all_params_strict.append(limit)
        
        # Simplified query using JOIN to count matching skills
        query_sql = f"""
            SELECT j.*, 
                   u.email as recruiter_email, 
                   u.company_name as recruiter_company_name,
                   COUNT(DISTINCT CASE WHEN s.name IN ({skill_placeholders}) THEN s.id END) as matching_skills_count
            FROM job_postings j
            LEFT JOIN users u ON j.recruiter_id = u.id
            LEFT JOIN job_skills js ON j.id = js.job_id
            LEFT JOIN skills s ON js.skill_id = s.id
            {where_clause}{exclude_applied}
            GROUP BY j.id, u.email, u.company_name
            HAVING matching_skills_count > 0
            ORDER BY matching_skills_count DESC, j.posted_date DESC
            LIMIT %s
        """
        
        all_params = all_params_strict
        
        # Count total placeholders needed
        expected_placeholders = len(skills) + (1 if location else 0) + len(applied_job_ids) + len(skills) + 1
        actual_placeholders = query_sql.count('%s')
        
        print(f"DEBUG: Executing skill-based SQL search with {len(skills)} skills, location={location}, limit={limit}")
        print(f"DEBUG: Skills: {skills}")
        print(f"DEBUG: Expected {expected_placeholders} placeholders, SQL has {actual_placeholders} placeholders")
        print(f"DEBUG: all_params has {len(all_params)} values")
        print(f"DEBUG: all_params sample: {all_params[:5]}")
        
        if expected_placeholders != actual_placeholders:
            print(f"ERROR: Placeholder count mismatch! Expected {expected_placeholders}, got {actual_placeholders}")
            print(f"DEBUG: Full Query:\n{query_sql}")
            raise ValueError(f"SQL placeholder mismatch: expected {expected_placeholders}, got {actual_placeholders}")
        
        try:
            cursor.execute(query_sql, tuple(all_params))
        except mysql.connector.Error as sql_error:
            print(f"❌ SQL Error: {sql_error}")
            print(f"SQL Query:\n{query_sql}")
            print(f"SQL Params ({len(all_params)}): {all_params}")
            print(f"Parameter types: {[type(p).__name__ for p in all_params]}")
            raise
        results = cursor.fetchall()
        
        print(f"DEBUG: Skill-based SQL search (with location) returned {len(results)} jobs")
        
        # If no results with location filter, try without location (broader search)
        if len(results) == 0 and location:
            print(f"⚠️ No jobs found in {location} - trying without location filter")
            where_clause_no_location = "WHERE j.status = 'active'"
            where_clause_no_location += f"""
                AND j.id IN (
                    SELECT DISTINCT js.job_id 
                    FROM job_skills js
                    JOIN skills s ON js.skill_id = s.id
                    WHERE s.name IN ({skill_placeholders})
                )
            """
            
            query_sql_no_location = f"""
                SELECT j.*, 
                       u.email as recruiter_email, 
                       u.company_name as recruiter_company_name,
                       COUNT(DISTINCT CASE WHEN s.name IN ({skill_placeholders}) THEN s.id END) as matching_skills_count
                FROM job_postings j
                LEFT JOIN users u ON j.recruiter_id = u.id
                LEFT JOIN job_skills js ON j.id = js.job_id
                LEFT JOIN skills s ON js.skill_id = s.id
                {where_clause_no_location}{exclude_applied}
                GROUP BY j.id, u.email, u.company_name
                HAVING matching_skills_count > 0
                ORDER BY matching_skills_count DESC, j.posted_date DESC
                LIMIT %s
            """
            
            # Parameters without location: skills (WHERE) + applied_job_ids + skills (SELECT) + limit
            all_params_no_location = []
            all_params_no_location.extend(skills)
            if applied_job_ids:
                all_params_no_location.extend(applied_job_ids)
            all_params_no_location.extend(skills)
            all_params_no_location.append(limit)
            
            cursor.execute(query_sql_no_location, tuple(all_params_no_location))
            results = cursor.fetchall()
            print(f"DEBUG: Skill-based SQL search (without location) returned {len(results)} jobs")
        
        # If still no results, check if there are ANY jobs at all
        if len(results) == 0:
            cursor.execute("SELECT COUNT(*) as total FROM job_postings WHERE status = 'active'")
            total_jobs = cursor.fetchone()['total']
            print(f"DEBUG: Total active jobs in database: {total_jobs}")
            
            cursor.execute("""
                SELECT COUNT(DISTINCT js.job_id) as matching_jobs
                FROM job_skills js
                JOIN skills s ON js.skill_id = s.id
                WHERE s.name IN ({})
            """.format(skill_placeholders), tuple(skills))
            matching_jobs = cursor.fetchone()['matching_jobs']
            print(f"DEBUG: Jobs with matching skills (any location): {matching_jobs}")
        
        if results:
            print(f"DEBUG: First job sample: {results[0].get('title', 'N/A')} at {results[0].get('company', 'N/A')} in {results[0].get('location', 'N/A')}")
        
        return results
        
    finally:
        cursor.close()
        conn.close()

