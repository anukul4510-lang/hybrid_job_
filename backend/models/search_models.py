"""
Search and recommendation models.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict


class HybridSearchRequest(BaseModel):
    """Schema for hybrid search request."""
    query: str
    filters: Optional[Dict] = {}
    limit: int = 10


class HybridSearchResponse(BaseModel):
    """Schema for hybrid search response."""
    results: List[Dict]
    total_results: int
    execution_time: float


class RecommendationRequest(BaseModel):
    """Schema for job recommendation request."""
    user_id: int
    limit: int = 10


class RecommendationResponse(BaseModel):
    """Schema for recommendation response."""
    recommended_jobs: List[Dict]
    match_score: float

