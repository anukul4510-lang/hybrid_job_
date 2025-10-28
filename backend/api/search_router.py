"""
Search API routes.
Handles hybrid semantic search functionality.
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.models.search_models import HybridSearchRequest, HybridSearchResponse
from backend.services.search_service import hybrid_search, get_recommendations
from backend.utils.dependencies import get_current_user, TokenData

router = APIRouter()


@router.post("/hybrid", response_model=HybridSearchResponse)
async def search_jobs(
    search_request: HybridSearchRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Perform hybrid search combining SQL filters and vector search.
    
    Args:
        search_request: Search query and filters
        current_user: Current authenticated user
        
    Returns:
        HybridSearchResponse: Search results
    """
    try:
        results = hybrid_search(
            query=search_request.query,
            filters=search_request.filters or {},
            limit=search_request.limit
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.get("/recommendations")
async def get_job_recommendations_endpoint(
    limit: int = 10,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get AI-powered job recommendations for current user.
    
    Args:
        limit: Maximum number of recommendations
        current_user: Current authenticated user
        
    Returns:
        List of recommended jobs
    """
    try:
        recommendations = get_recommendations(current_user.user_id, limit)
        return {
            "recommended_jobs": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

