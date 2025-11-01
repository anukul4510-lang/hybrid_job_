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
        print(f"Error generating embedding: {e}")
        # Fallback to zero vector
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
        
        where_clause = "WHERE status = 'active'"
        params = []
        
        sql_filter_applied = ""
        if job_ids:
            where_clause += f" AND id IN ({','.join(['%s']*len(job_ids))})"
            params.extend(job_ids)
            sql_filter_applied += f"[Vector IDs filtered: {len(job_ids)}] "
        
        if filters:
            if "location" in filters:
                where_clause += " AND location LIKE %s"
                params.append(f"%{filters['location']}%")
                sql_filter_applied += f"Location: {filters['location']} "
            if "employment_type" in filters:
                where_clause += " AND employment_type = %s"
                params.append(filters['employment_type'])
                sql_filter_applied += f"Type: {filters['employment_type']} "
            if "min_salary" in filters:
                where_clause += " AND (max_salary >= %s OR min_salary >= %s)"
                params.extend([filters['min_salary'], filters['min_salary']])
                sql_filter_applied += f"Min Salary: ${filters['min_salary']:,} "
            if "max_salary" in filters:
                where_clause += " AND (min_salary <= %s OR max_salary <= %s)"
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
    
    where_clause = "WHERE status = 'active'"
    params = []
    
    if filters:
        if "location" in filters:
            where_clause += " AND location LIKE %s"
            params.append(f"%{filters['location']}%")
        if "employment_type" in filters:
            where_clause += " AND employment_type = %s"
            params.append(filters['employment_type'])
    
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
        "execution_time": 0.0
    }


def get_recommendations(user_id: int, limit: int = 10) -> List[Dict]:
    """
    Get job recommendations for a user based on their skills and profile.
    
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
            SELECT s.name FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = %s
            """,
            (user_id,)
        )
        skills = [row['name'] for row in cursor.fetchall()]
        
        # Get user profile
        cursor.execute(
            "SELECT location FROM user_profiles WHERE user_id = %s",
            (user_id,)
        )
        profile = cursor.fetchone()
        location = profile['location'] if profile else None
        
        cursor.close()
        conn.close()
        
        if not skills:
            return []
        
        # Create query for recommendation
        skills_query = " ".join(skills)
        query = f"Jobs for {skills_query}"
        
        filters = {}
        if location:
            filters['location'] = location
        
        search_results = hybrid_search(query, filters, limit)
        
        return search_results['results']
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return []

