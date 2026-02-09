from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any
from uuid import UUID

from app.api.deps import DbSession
from app.api.auth_deps import CurrentUser
from app.services.login_session_service import LoginSessionService

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
async def get_login_sessions(
    session: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None, description="Search by name or email"),
    sort_by: str = Query("login_time", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order: asc or desc")
):
    """Get all login sessions (admin only)"""
    # Check if user is admin
    if current_user.user_type != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access login sessions"
        )
    
    # Use service to get sessions
    service = LoginSessionService(session)
    result = await service.get_login_sessions(
        page=page,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return result


@router.patch("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: UUID,
    session: DbSession,
    current_user: CurrentUser
):
    """Toggle user account status - lock/unlock (admin only)"""
    # Check if user is admin
    if current_user.user_type != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can toggle user status"
        )
    
    # Prevent admin from locking themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot lock your own account"
        )
    
    # Get user to check if they are admin
    service = LoginSessionService(session)
    user = await service.repository.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent locking admin accounts
    if user.user_type == 'admin':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot lock admin accounts"
        )
    
    # Use service to toggle status
    try:
        result = await service.toggle_user_account(user_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

