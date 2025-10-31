"""
Recruiter-specific services including advanced user search.
"""

import google.generativeai as genai
from typing import List, Dict, Optional
import time
import config
import difflib
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
        You are an intelligent job search query parser. Your task is to understand the user's intent EVEN IF there are:
        - Spelling mistakes (e.g., "expreance" → "experience", "develper" → "developer")
        - Merged words (e.g., "develprwith" → "developer with", "pythondevelper" → "python developer")
        - Word placement issues (e.g., "experience 5 years" → "5 years experience")
        - Typos and grammatical errors
        
        Parse the following query into structured filters. Use your language understanding to correct errors and extract meaning.
        
        Query: "{query}"
        
        CRITICAL INSTRUCTIONS:
        1. FIRST, mentally correct the query by fixing spelling mistakes and separating merged words.
           - "develprwith" should be understood as "developer with"
           - "expreance" should be understood as "experience"
           - "pythondevelper" should be understood as "python developer"
           - Look for merged words that should be separated
        
        2. Extract job title or role: If you see words like "developer", "engineer", "analyst", "manager", "designer", 
           etc., extract it as "job_of_choice". The job title might be combined with skills (e.g., "Pythondeveloper" = "Python developer").
        
        3. Extract skills: Look for programming languages, technologies, frameworks (Python, JavaScript, Java, React, etc.).
           Even if misspelled (e.g., "pyhton" → "Python", "javascrip" → "JavaScript"), extract the corrected skill name.
        
        4. Extract experience: Look for numbers followed by time-related words (years, year, yrs, yr) or experience-related words.
           Patterns to recognize:
           - "5 years experience" / "5 year expreance" / "5 yrs exp" → min_experience: 5
           - "3+ years" → min_experience: 3
           - "senior" / "experienced" → min_experience: 3-5 (use 3 as default)
           - "junior" / "entry" → min_experience: 0
        
        5. Extract location: Look for city names, state names, or location indicators (in, at, from, located).
        
        Return ONLY a JSON object with these fields (use null for missing values):
        {{
            "skills": ["skill1", "skill2"],
            "location": "location",
            "min_experience": number or null,
            "job_of_choice": "job title or role type",
            "keywords": ["keyword1", "keyword2"]
        }}
        
        IMPORTANT: Use corrected spellings in your output. For example:
        - If query has "pyhton", return "Python" in skills
        - If query has "expreance", extract the number correctly for min_experience
        - If query has "develprwith" or "develr wth", understand it as "developer with" and extract job_of_choice as "developer"
        - If query has "wth" instead of "with", understand the context and parse correctly
        
        Examples of error handling (including extreme typos):
        - "python develprwith 5 year expreance" → {{"skills": ["Python"], "job_of_choice": "developer", "min_experience": 5}}
        - "python develr wth 5 year expreance" → {{"skills": ["Python"], "job_of_choice": "developer", "min_experience": 5}}
        - "pyhton develper with 3+ yrs expirience in NY" → {{"skills": ["Python"], "job_of_choice": "developer", "min_experience": 3, "location": "NY"}}
        - "javascrip engneer with 5 yeer exprience" → {{"skills": ["JavaScript"], "job_of_choice": "engineer", "min_experience": 5}}
        - "senior pyhton develpr in SF" → {{"skills": ["Python"], "job_of_choice": "developer", "min_experience": 5, "location": "SF"}}
        - "python develr wth 5 year expreance" → {{"skills": ["Python"], "job_of_choice": "developer", "min_experience": 5}}
        
        CRITICAL: Even if the query is heavily misspelled, use your language understanding to extract the intended meaning.
        If you see patterns like "develr", "wth", "expreance" in the same query, understand it as:
        - "develr" = "developer"
        - "wth" = "with"  
        - "expreance" = "experience"
        
        Return ONLY the JSON object, no explanations.
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
            
            # If no job_of_choice extracted, try manual extraction
            if not filters.get('job_of_choice'):
                query_lower = query.lower()
                job_keywords = ['developer', 'engineer', 'analyst', 'manager', 'designer', 'specialist', 
                               'consultant', 'architect', 'programmer', 'coder', 'technician']
                for keyword in job_keywords:
                    if keyword in query_lower:
                        # Extract the job title (try to get context around the keyword)
                        idx = query_lower.index(keyword)
                        # Get 3-4 words before and after the keyword
                        words = query_lower.split()
                        if keyword in words:
                            keyword_idx = words.index(keyword)
                            start = max(0, keyword_idx - 1)
                            end = min(len(words), keyword_idx + 2)
                            job_title = ' '.join(words[start:end])
                            filters['job_of_choice'] = job_title
                            break
            
            # If no min_experience extracted by AI, try manual extraction
            if not filters.get('min_experience'):
                experience_value = extract_experience_manual(query)
                if experience_value is not None:
                    filters['min_experience'] = experience_value
            
            return filters
        
        return {}
    except Exception as e:
        print(f"Error parsing query with AI: {e}")
        # Fallback: try to extract job_of_choice and skills manually
        query_lower = query.lower()
        filters = {"keywords": [query]}
        
        # Extract job titles/roles manually
        job_keywords = ['developer', 'engineer', 'analyst', 'manager', 'designer', 'specialist', 
                       'consultant', 'architect', 'programmer', 'coder', 'technician']
        for keyword in job_keywords:
            if keyword in query_lower:
                # Extract the job title
                words = query_lower.split()
                if keyword in words:
                    keyword_idx = words.index(keyword)
                    start = max(0, keyword_idx - 1)
                    end = min(len(words), keyword_idx + 2)
                    job_title = ' '.join(words[start:end])
                    filters['job_of_choice'] = job_title
                    break
        
        # Extract skills manually (common programming/tech skills)
        common_skills = ['python', 'javascript', 'java', 'react', 'node', 'sql', 'html', 'css', 
                        'angular', 'vue', 'django', 'flask', 'express', 'mongodb', 'postgresql',
                        'aws', 'docker', 'kubernetes', 'git', 'linux', 'api', 'rest', 'graphql']
        found_skills = [s for s in common_skills if s in query_lower]
        if found_skills:
            filters['skills'] = found_skills
        
        # Extract experience manually
        experience_value = extract_experience_manual(query)
        if experience_value is not None:
            filters['min_experience'] = experience_value
        
        return filters


def fuzzy_match_skill(skill_query: str, all_skills: List[str], threshold: float = 0.6) -> Optional[str]:
    """
    Find the best matching skill using fuzzy string matching.
    
    Args:
        skill_query: The skill name from the query (may have typos)
        all_skills: List of all available skills from database
        threshold: Minimum similarity ratio (0-1)
        
    Returns:
        Best matching skill name or None if no match found
    """
    if not skill_query or not all_skills:
        return None
    
    skill_query_lower = skill_query.lower().strip()
    
    # First, try exact match (case-insensitive)
    for skill in all_skills:
        if skill.lower() == skill_query_lower:
            return skill
    
    # Then try fuzzy matching
    best_match = None
    best_ratio = 0.0
    
    for skill in all_skills:
        ratio = difflib.SequenceMatcher(None, skill_query_lower, skill.lower()).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = skill
    
    # Return match if above threshold
    if best_match and best_ratio >= threshold:
        return best_match
    
    return None


def correct_skills_in_query(skills_list: List[str]) -> List[str]:
    """
    Correct spelling of skills using fuzzy matching against database skills.
    
    Args:
        skills_list: List of skill names from query (may have typos)
        
    Returns:
        List of corrected skill names
    """
    from backend.services.user_service import get_all_skills
    
    try:
        # Get all skills from database
        all_skills_data = get_all_skills()
        all_skills = [skill['name'] for skill in all_skills_data]
        
        corrected_skills = []
        for skill_query in skills_list:
            if not skill_query:
                continue
            
            # Try fuzzy match
            corrected = fuzzy_match_skill(skill_query, all_skills, threshold=0.6)
            if corrected:
                corrected_skills.append(corrected)
            else:
                # If no fuzzy match, keep original (might be a new skill)
                corrected_skills.append(skill_query)
        
        return corrected_skills
    except Exception as e:
        print(f"Error correcting skills: {e}")
        # Return original skills if correction fails
        return skills_list


def correct_spelling_in_query(query: str) -> str:
    """
    Correct common spelling mistakes and separate merged words in search query.
    Uses fuzzy matching and common corrections.
    """
    import re
    
    query_original = query
    query_lower = query.lower()
    
    # Common misspellings and corrections (expanded with more typos)
    common_corrections = {
        # Python variations
        'pyhton': 'python',
        'pythn': 'python',
        'pythin': 'python',
        # JavaScript variations
        'javascrip': 'javascript',
        'javascripy': 'javascript',
        'javascritp': 'javascript',
        'javasript': 'javascript',
        'javascrpit': 'javascript',
        'javascrpt': 'javascript',
        'javascrit': 'javascript',
        # Developer variations (including extreme typos)
        'develper': 'developer',
        'develoepr': 'developer',
        'developr': 'developer',
        'devloper': 'developer',
        'develpr': 'developer',
        'develr': 'developer',  # Extreme typo: "develr"
        'develor': 'developer',
        'devlopr': 'developer',
        'develoer': 'developer',
        'devlpr': 'developer',
        'devlop': 'developer',
        # Engineer variations
        'engneer': 'engineer',
        'enginier': 'engineer',
        'engeneer': 'engineer',
        'enginer': 'engineer',
        'engneer': 'engineer',
        # Experience variations
        'expirience': 'experience',
        'expereince': 'experience',
        'experiance': 'experience',
        'expreance': 'experience',
        'exprience': 'experience',
        'exprence': 'experience',
        'expreence': 'experience',
        'expirance': 'experience',
        # Common words
        'wth': 'with',  # Extreme typo: "wth"
        'wit': 'with',
        'whit': 'with',
        'wid': 'with',
        # Analyst variations
        'anlyst': 'analyst',
        'analsyt': 'analyst',
        'anylst': 'analyst',
        'analys': 'analyst',
        # Manager variations
        'managr': 'manager',
        'manger': 'manager',
        'maneger': 'manager',
        'mangr': 'manager',
        # Programmer variations
        'progarmmer': 'programmer',
        'programer': 'programmer',
        'progrmmer': 'programmer',
        'progamer': 'programmer',
        # Designer variations
        'desginer': 'designer',
        'desgner': 'designer',
        'desinger': 'designer',
        'desiner': 'designer',
    }
    
    # Patterns to separate merged words and fix extreme typos
    merged_patterns = [
        # Pattern: skill + role (e.g., "pythondevelper" → "python developer")
        (r'python(develper|develpr|devloper|developr|develr|develor)', r'python developer'),
        (r'java(script)?(develper|develpr|devloper|developr|develr)', r'javascript developer'),
        (r'react(develper|develpr|devloper|developr|develr)', r'react developer'),
        (r'node(develper|develpr|devloper|developr|develr)', r'node developer'),
        # Pattern: role + "with" (e.g., "develprwith" → "developer with", "develrwth" → "developer with")
        (r'develprwith|develperwith|devloperwith|developrwith|develrwth|develrwth', r'developer with'),
        (r'develr\s+wth|develper\s+wth|developr\s+wth', r'developer with'),  # "develr wth" → "developer with"
        (r'engneerwith|enginierwith|engeneerwith|enginerwth', r'engineer with'),
        # Pattern: experience variations merged or with typos
        (r'expreance|expirience|expereince|experiance|expreence', r'experience'),
        # Pattern: "year expreance" → "year experience"
        (r'year\s+expreance|year\s+expirience|year\s+experiance', r'year experience'),
        # Pattern: numbers with "year" merged
        (r'(\d+)(year|years|yr|yrs)', r'\1 \2'),  # "5year" → "5 year"
    ]
    
    # Apply merged word patterns
    for pattern, replacement in merged_patterns:
        query_lower = re.sub(pattern, replacement, query_lower, flags=re.IGNORECASE)
    
    # Restore original case for parts not matched by patterns
    # Split and correct individual words
    words = query_lower.split()
    corrected_words = []
    
    for word in words:
        word_lower = word.lower()
        
        # Check for exact match in common corrections
        if word_lower in common_corrections:
            corrected_word = common_corrections[word_lower]
            corrected_words.append(corrected_word)
        else:
            # Keep word as is (already processed by merged patterns)
            corrected_words.append(word)
    
    corrected_query = ' '.join(corrected_words)
    
    # Additional fixes for common patterns
    # Fix: "5year" → "5 year"
    corrected_query = re.sub(r'(\d+)(year|years|yr|yrs)', r'\1 \2', corrected_query, flags=re.IGNORECASE)
    
    # Fix: "develr wth" → "developer with" (handles word separation issues)
    corrected_query = re.sub(r'\bdevelr\s+wth\b', 'developer with', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bdevelper\s+wth\b', 'developer with', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bdevelopr\s+wth\b', 'developer with', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bdevloper\s+wth\b', 'developer with', corrected_query, flags=re.IGNORECASE)
    
    # Fix: "year expreance" → "year experience"
    corrected_query = re.sub(r'\byear\s+expreance\b', 'year experience', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\byear\s+expirience\b', 'year experience', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\byear\s+experiance\b', 'year experience', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\byear\s+expreence\b', 'year experience', corrected_query, flags=re.IGNORECASE)
    
    # Fix common standalone typos that might be missed (final pass)
    corrected_query = re.sub(r'\bwth\b', 'with', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bdevelr\b', 'developer', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bexpreance\b', 'experience', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bexpirience\b', 'experience', corrected_query, flags=re.IGNORECASE)
    corrected_query = re.sub(r'\bexperiance\b', 'experience', corrected_query, flags=re.IGNORECASE)
    
    return corrected_query


def extract_experience_manual(query: str) -> Optional[int]:
    """
    Manually extract years of experience from natural language query.
    
    Examples:
    - "5 years experience" -> 5
    - "3+ years" -> 3
    - "10 year experience" -> 10
    - "5 yrs" -> 5
    - "experienced" -> 3 (default)
    - "senior" -> 5 (default)
    """
    import re
    
    query_lower = query.lower()
    
    # Pattern 1: Look for number followed by "years", "year", "yrs", "yr"
    # Handles: "5 years", "5 year", "5 yrs", "5 yr", "5+ years", "5+year", etc.
    patterns = [
        r'(\d+)\s*\+\s*(?:years?|yrs?|yr)\s*(?:experience|exp)?',
        r'(\d+)\s*(?:years?|yrs?|yr)\s*(?:experience|exp)?',
        r'(?:years?|yrs?|yr)\s*(?:experience|exp)?\s*(?:of)?\s*(\d+)',
        r'(\d+)\s*(?:years?|yrs?|yr)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, query_lower)
        if match:
            try:
                years = int(match.group(1))
                if 0 <= years <= 50:  # Reasonable range
                    return years
            except (ValueError, IndexError):
                continue
    
    # Pattern 2: Look for keywords like "experienced", "senior", "junior"
    if any(word in query_lower for word in ['senior', 'senior-level', 'senior level']):
        return 5  # Senior typically means 5+ years
    elif any(word in query_lower for word in ['experienced', 'experience']):
        # Only if there's no number found, default to 3 years
        return 3
    elif any(word in query_lower for word in ['mid', 'mid-level', 'mid level', 'intermediate']):
        return 2  # Mid-level typically means 2-4 years
    elif any(word in query_lower for word in ['junior', 'entry', 'entry-level', 'entry level', 'fresh']):
        return 0  # Entry level means 0-1 years
    
    return None


def generate_user_embedding(user_profile: Dict) -> List[float]:
    """Generate embedding for user profile."""
    try:
        # Build text for embedding: skills + bio + experience + job preference + location/address
        text_parts = []
        
        # Add job of choice (very important for matching)
        if user_profile.get('job_of_choice'):
            text_parts.append(user_profile['job_of_choice'])
            text_parts.append(user_profile['job_of_choice'])  # Emphasize job preference
        
        # Add skills
        if user_profile.get('skills'):
            if isinstance(user_profile['skills'], str):
                text_parts.append(user_profile['skills'])
            else:
                text_parts.append(" ".join(user_profile['skills']))
        
        # Add location and address
        if user_profile.get('location'):
            text_parts.append(user_profile['location'])
        if user_profile.get('address'):
            text_parts.append(user_profile['address'])
        
        # Add bio
        if user_profile.get('bio'):
            text_parts.append(user_profile['bio'])
        
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
    
    # Skills matching (50% weight) with fuzzy matching
    if query_filters.get('skills'):
        max_score += 50
        candidate_skills_str = (candidate.get('skills') or '').lower()
        candidate_skills = [s.strip() for s in candidate_skills_str.split(',') if s.strip()] if candidate_skills_str else []
        query_skills = [s.lower().strip() for s in query_filters['skills']]
        
        if candidate_skills and query_skills:
            matched_skills = 0
            for qs in query_skills:
                # Try exact match first
                exact_match = any(qs == cs or qs in cs or cs in qs for cs in candidate_skills)
                if exact_match:
                    matched_skills += 1
                else:
                    # Try fuzzy matching for typos
                    fuzzy_match = False
                    for cs in candidate_skills:
                        # Calculate similarity ratio
                        similarity = difflib.SequenceMatcher(None, qs, cs).ratio()
                        if similarity >= 0.7:  # 70% similarity threshold
                            fuzzy_match = True
                            matched_skills += similarity  # Partial credit based on similarity
                            break
                    if not fuzzy_match:
                        # Check for partial word matches (e.g., "react" matches "React.js")
                        for cs in candidate_skills:
                            if qs in cs or cs in qs or any(word in cs for word in qs.split() if len(word) > 3):
                                matched_skills += 0.8  # Partial match
                                break
            
            # Normalize score: matched_skills could be > len(query_skills) due to partial matches
            skill_match_ratio = min(1.0, matched_skills / len(query_skills))
            score += skill_match_ratio * 50
    
    # Job of Choice matching (25% weight - very important)
    if query_filters.get('job_of_choice'):
        max_score += 25
        candidate_job = (candidate.get('job_of_choice') or '').lower().strip()
        query_job = query_filters['job_of_choice'].lower().strip()
        
        if candidate_job and query_job:
            # Exact match (either direction)
            if query_job == candidate_job:
                score += 25  # Perfect match
            elif query_job in candidate_job or candidate_job in query_job:
                score += 22  # Close match (one contains the other)
            # Partial match - check for key words
            else:
                query_words = set(query_job.split())
                candidate_words = set(candidate_job.split())
                common_words = query_words.intersection(candidate_words)
                if common_words:
                    # Partial match based on word overlap
                    overlap_ratio = len(common_words) / max(len(query_words), len(candidate_words))
                    score += overlap_ratio * 20  # Up to 20 points for partial match
    
    # Location matching (15% weight - checks both location and address)
    if query_filters.get('location'):
        max_score += 15
        candidate_location = (candidate.get('location') or '').lower()
        candidate_address = (candidate.get('address') or '').lower()
        query_location = query_filters['location'].lower()
        
        location_match = query_location in candidate_location or candidate_location in query_location
        address_match = query_location in candidate_address or candidate_address in query_location
        
        if location_match or address_match:
            score += 15
        elif candidate_location or candidate_address:
            # Partial match
            combined_location = f"{candidate_location} {candidate_address}".strip()
            if query_location in combined_location:
                score += 10  # Partial match
    
    # Experience matching (15% weight)
    if query_filters.get('min_experience'):
        max_score += 15
        candidate_exp = candidate.get('years_experience', 0) or 0
        try:
            # Ensure required experience is an integer
            required_exp = int(query_filters['min_experience'])
        except (ValueError, TypeError):
            # Invalid experience value, skip this matching
            required_exp = None
        
        if required_exp is not None:
            candidate_exp = int(candidate_exp) if candidate_exp else 0
            if candidate_exp >= required_exp:
                # Full points if meets or exceeds
                score += 15
            elif candidate_exp > 0:
                # Partial points if close (proportional)
                score += (candidate_exp / required_exp) * 15
    
    # Profile completeness (10% weight - includes job_of_choice and address)
    max_score += 10
    completeness = 0
    if candidate.get('bio'):
        completeness += 2
    if candidate.get('skills'):
        completeness += 2
    if candidate.get('resume_url'):
        completeness += 2
    if candidate.get('job_of_choice'):
        completeness += 2
    if candidate.get('address'):
        completeness += 2
    score += min(completeness, 10)  # Cap at 10 points
    
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
        # Correct spelling in query before parsing
        corrected_query = correct_spelling_in_query(query)
        if corrected_query != query:
            print(f"[DEBUG] Query corrected: '{query}' -> '{corrected_query}'")
            query = corrected_query
        
        # Parse query with AI
        ai_filters = parse_search_query_with_ai(query)
        print(f"[DEBUG] AI parsed filters: {ai_filters}")
        
        # Correct skills spelling using fuzzy matching
        if ai_filters.get('skills'):
            original_skills = ai_filters['skills'].copy()
            corrected_skills = correct_skills_in_query(original_skills)
            if corrected_skills != original_skills:
                print(f"[DEBUG] Skills corrected: {original_skills} -> {corrected_skills}")
                ai_filters['skills'] = corrected_skills
        
        # Merge AI filters with provided filters (manual filters take precedence)
        if filters:
            # Manual filters override AI-parsed filters
            for key, value in filters.items():
                if value is not None:  # Only override if value is provided
                    ai_filters[key] = value
        print(f"[DEBUG] Final filters after merging: {ai_filters}")
        
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Build SQL query - start flexible, tighten if needed
        where_clauses = ["u.role = 'jobseeker'"]  # Only search job seekers
        params = []
        
        # Location filter (checks both location and address)
        if ai_filters.get('location'):
            where_clauses.append("(up.location LIKE %s OR up.address LIKE %s)")
            params.extend([f"%{ai_filters['location']}%", f"%{ai_filters['location']}%"])
        
        # Job of choice filter
        if ai_filters.get('job_of_choice'):
            where_clauses.append("up.job_of_choice LIKE %s")
            params.append(f"%{ai_filters['job_of_choice']}%")
        
        # Experience filter - ensure it's an integer
        if ai_filters.get('min_experience'):
            try:
                exp_value = int(ai_filters['min_experience'])
                where_clauses.append("up.years_experience >= %s")
                params.append(exp_value)
                print(f"[DEBUG] Experience filter: {exp_value}+ years")
            except (ValueError, TypeError):
                # Invalid experience value, skip the filter
                print(f"[DEBUG] Invalid experience value: {ai_filters.get('min_experience')}, skipping filter")
        
        # Skills filter - candidate needs at least one matching skill
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
        
        # Build final query - ensure skills and new fields are always fetched properly
        query_sql = f"""
            SELECT DISTINCT
                u.id, u.email, u.created_at,
                up.first_name, up.last_name, up.phone, up.location,
                up.address, up.job_of_choice,
                up.bio, up.years_experience, up.resume_url,
                COALESCE(GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', '), '') as skills
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_skills us ON u.id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.id
            WHERE {' AND '.join(where_clauses)}
            GROUP BY u.id, u.email, u.created_at,
                     up.first_name, up.last_name, up.phone, up.location,
                     up.address, up.job_of_choice,
                     up.bio, up.years_experience, up.resume_url
            ORDER BY u.created_at DESC
            LIMIT %s
        """
        
        params.append(limit)
        
        print(f"[DEBUG] SQL Query: {query_sql[:200]}...")  # Log first 200 chars
        print(f"[DEBUG] Params: {params}")
        
        cursor.execute(query_sql, tuple(params))
        results = cursor.fetchall()
        
        print(f"[DEBUG] Initial results: {len(results)} candidates found")
        
        # If no results with filters, return all job seekers as fallback
        if not results:
            print("[DEBUG] No results with filters, falling back to all job seekers")
            # Fallback: Return all job seekers with profile data
            fallback_sql = """
                SELECT DISTINCT
                    u.id, u.email, u.created_at,
                    up.first_name, up.last_name, up.phone, up.location,
                    up.address, up.job_of_choice,
                    up.bio, up.years_experience, up.resume_url,
                    COALESCE(GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', '), '') as skills
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                LEFT JOIN user_skills us ON u.id = us.user_id
                LEFT JOIN skills s ON us.skill_id = s.id
                WHERE u.role = 'jobseeker'
                GROUP BY u.id, u.email, u.created_at,
                         up.first_name, up.last_name, up.phone, up.location,
                         up.address, up.job_of_choice,
                         up.bio, up.years_experience, up.resume_url
                ORDER BY u.created_at DESC
                LIMIT %s
            """
            cursor.execute(fallback_sql, (limit,))
            results = cursor.fetchall()
            print(f"[DEBUG] Fallback results: {len(results)} candidates found")
        
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
            where_clause += " AND (up.location LIKE %s OR up.address LIKE %s)"
            params.extend([f"%{filters['location']}%", f"%{filters['location']}%"])
        
        if filters.get('job_of_choice'):
            where_clause += " AND up.job_of_choice LIKE %s"
            params.append(f"%{filters['job_of_choice']}%")
        
        params.append(limit)
        
        # Fetch skills and new fields properly
        query_sql = f"""
            SELECT DISTINCT
                u.id, u.email, u.created_at,
                up.first_name, up.last_name, up.phone, up.location,
                up.address, up.job_of_choice,
                up.bio, up.years_experience, up.resume_url,
                COALESCE(GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', '), '') as skills
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_skills us ON u.id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.id
            {where_clause}
            GROUP BY u.id, u.email, u.created_at,
                     up.first_name, up.last_name, up.phone, up.location,
                     up.address, up.job_of_choice,
                     up.bio, up.years_experience, up.resume_url
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

