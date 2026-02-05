from __future__ import annotations

from fastapi import APIRouter, Query
from typing import Optional

from app.api.deps import DbSession
from app.services.search_service import SearchService

router = APIRouter()

@router.get("/suggestions")
async def get_search_suggestions(
    session: DbSession,
    q: str = Query(..., min_length=2, description="Search query"),
    limit: Optional[int] = Query(10, ge=1, le=20, description="Number of suggestions per type")
):
    """
    Get search suggestions including prompts, categories, and tags
    """
    return await SearchService.get_suggestions(session, q, limit)

@router.get("/")
async def search_prompts(
    session: DbSession,
    q: Optional[str] = Query(None, description="Search query"),
    tag: Optional[str] = Query(None, description="Tag filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Search prompts with various filters
    """
    return await SearchService.search_prompts(session, q, tag, category, page, limit)