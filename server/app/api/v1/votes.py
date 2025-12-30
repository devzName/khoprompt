from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user, get_current_user_optional
from app.services.vote_service import VoteService
from app.schemas.vote import VoteCreate, VoteStats
from app.models.user import User

router = APIRouter()


@router.post("/prompts")
async def vote_prompt(
    vote_data: VoteCreate,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Vote for a prompt (helpful or not helpful)"""
    try:
        result = await VoteService.vote_prompt(
            session, 
            current_user.id, 
            vote_data.prompt_id, 
            vote_data.is_helpful
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/prompts/{prompt_id}")
async def remove_vote(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Remove user's vote for a prompt"""
    try:
        result = await VoteService.remove_vote(session, current_user.id, prompt_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/prompts/{prompt_id}/user-vote")
async def get_user_vote(
    prompt_id: int,
    session: DbSession,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get current user's vote for a prompt (returns null if not authenticated or no vote found)"""
    try:
        if not current_user:
            return {"vote": None, "message": "Not authenticated"}
            
        result = await VoteService.get_user_vote(session, current_user.id, prompt_id)
        if result is None:
            return {"vote": None, "message": "No vote found"}
        return {"vote": result, "message": "Vote found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/prompts/{prompt_id}/stats", response_model=VoteStats)
async def get_vote_stats(
    prompt_id: int,
    session: DbSession,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get vote statistics for a prompt (public access, includes user vote if authenticated)"""
    try:
        user_id = current_user.id if current_user else None
        result = await VoteService.get_vote_stats(session, prompt_id, user_id)
        return VoteStats.from_service_response(result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/prompts/{prompt_id}/stats/public", response_model=VoteStats)
async def get_vote_stats_public(
    prompt_id: int,
    session: DbSession
):
    """Get public vote statistics for a prompt (no user vote info)"""
    try:
        result = await VoteService.get_vote_stats(session, prompt_id, None)
        return VoteStats.from_service_response(result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")