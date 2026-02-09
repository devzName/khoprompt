from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any

from app.api.deps import DbSession
from app.api.auth_deps import CurrentUser
from app.services.bookmark_service import BookmarkService
from app.schemas.bookmark import (
    BookmarkCreate,
    BookmarkResponse,
    BookmarkToggleRequest,
    BookmarkToggleResponse,
    BookmarkStatusResponse
)

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
async def get_bookmarked_prompts(
    session: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's bookmarked prompts with pagination"""
    bookmark_service = BookmarkService(session)
    
    try:
        result = await bookmark_service.get_user_bookmarked_prompts(
            user_id=current_user.id,
            page=page,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/check/{prompt_id}", response_model=BookmarkStatusResponse)
async def check_bookmark_status(
    prompt_id: int,
    session: DbSession,
    current_user: CurrentUser
):
    """Check if a prompt is bookmarked by the current user"""
    bookmark_service = BookmarkService(session)
    
    try:
        is_bookmarked = await bookmark_service.is_bookmarked(
            user_id=current_user.id,
            prompt_id=prompt_id
        )
        return BookmarkStatusResponse(is_bookmarked=is_bookmarked)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/toggle", response_model=BookmarkToggleResponse)
async def toggle_bookmark(
    bookmark_data: BookmarkToggleRequest,
    session: DbSession,
    current_user: CurrentUser
):
    """Toggle bookmark status (add if not exists, remove if exists)"""
    bookmark_service = BookmarkService(session)
    
    try:
        result = await bookmark_service.toggle_bookmark(
            user_id=current_user.id,
            prompt_id=bookmark_data.prompt_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))