from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.api.auth_deps import get_current_user, get_current_user_optional
from app.api.deps import DbSession
from app.models.user import User
from app.schemas.pagination import PaginatedResponse
from app.schemas.skill import CompilationOut, SkillCreate, SkillListOut, SkillOut, SkillUpdate
from app.services.skill_engagement_service import SkillEngagementService
from app.services.skill_service import SkillService

router = APIRouter()


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.post("", response_model=SkillOut)
async def create_skill(
    skill_data: SkillCreate,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Create a new skill and compile for all agents (auth required)."""
    try:
        result = await SkillService.create_skill(session, skill_data, current_user.id)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("", response_model=PaginatedResponse[SkillListOut])
async def list_skills(
    session: DbSession,
    search: str | None = None,
    category: str | None = None,
    tags: list[str] | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    """List skills with optional filters (public)."""
    return await SkillService.list_skills(session, page, limit, search, category, tags)


@router.get("/my", response_model=PaginatedResponse[SkillListOut])
async def get_my_skills(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    """Get current user's skills (auth required)."""
    return await SkillService.get_user_skills_paginated(session, current_user.id, page, limit)


@router.get("/{skill_id}", response_model=SkillOut)
async def get_skill(skill_id: UUID, session: DbSession):
    """Get skill detail with all compilations (public)."""
    skill = await SkillService.get_skill(session, skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.put("/{skill_id}", response_model=SkillOut)
async def update_skill(
    skill_id: UUID,
    update_data: SkillUpdate,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Update skill (auth, owner only)."""
    try:
        result = await SkillService.update_skill(session, skill_id, update_data, current_user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Skill not found or access denied")
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: UUID,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Delete skill (auth, owner only)."""
    success = await SkillService.delete_skill(session, skill_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found or access denied")
    return {"message": "Skill deleted successfully"}


@router.get("/{skill_id}/compile/{agent}", response_model=CompilationOut)
async def get_compilation(skill_id: UUID, agent: str, session: DbSession):
    """Get compiled output for a specific agent (public)."""
    result = await SkillService.get_compilation(session, skill_id, agent)
    if not result:
        raise HTTPException(status_code=404, detail="Compilation not found")
    return result


# ---------------------------------------------------------------------------
# Engagement
# ---------------------------------------------------------------------------

@router.post("/{skill_id}/bookmark")
async def toggle_bookmark(
    skill_id: UUID,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Toggle bookmark for a skill (auth required)."""
    is_bookmarked = await SkillEngagementService.toggle_bookmark(session, current_user.id, skill_id)
    return {"is_bookmarked": is_bookmarked}


@router.post("/{skill_id}/vote")
async def vote_skill(
    skill_id: UUID,
    body: dict,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Vote on a skill. Body: {is_helpful: bool} (auth required)."""
    if "is_helpful" not in body:
        raise HTTPException(status_code=422, detail="is_helpful field required")
    result = await SkillEngagementService.vote(session, current_user.id, skill_id, bool(body["is_helpful"]))
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.delete("/{skill_id}/vote")
async def remove_vote(
    skill_id: UUID,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Remove existing vote (auth required)."""
    success = await SkillEngagementService.remove_vote(session, current_user.id, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vote not found")
    return {"message": "Vote removed"}


@router.post("/{skill_id}/view")
async def track_view(
    skill_id: UUID,
    request: Request,
    session: DbSession,
    current_user: User | None = Depends(get_current_user_optional),
):
    """Track a skill view (optional auth)."""
    user_id = current_user.id if current_user else None

    client_ip = request.headers.get("x-forwarded-for")
    if client_ip:
        client_ip = client_ip.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else None

    tracked = await SkillEngagementService.track_view(session, skill_id, user_id, client_ip)
    if tracked:
        return {"message": "View tracked"}
    return {"message": "View not tracked (duplicate)"}


@router.get("/{skill_id}/comments")
async def get_comments(skill_id: UUID, session: DbSession):
    """Get comments for a skill (public)."""
    return await SkillEngagementService.get_comments(session, skill_id)


@router.post("/{skill_id}/comments")
async def add_comment(
    skill_id: UUID,
    body: dict,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Add a comment or reply (auth required). Body: {content, parent_id?}"""
    content = body.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=422, detail="content is required")
    parent_id = body.get("parent_id")
    try:
        return await SkillEngagementService.add_comment(
            session, skill_id, current_user.id, content, parent_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{skill_id}/comments/{comment_id}")
async def delete_comment(
    skill_id: UUID,
    comment_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Soft-delete a comment (owner or admin)."""
    is_admin = current_user.user_type == "admin"
    success = await SkillEngagementService.delete_comment(session, comment_id, current_user.id, is_admin)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or access denied")
    return {"message": "Comment deleted"}
