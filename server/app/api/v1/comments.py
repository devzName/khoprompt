from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.auth_deps import CurrentUser, OptionalCurrentUser
from app.api.deps import DbSession
from app.schemas.comment import CommentCreate, CommentOut
from app.services.comment_service import CommentService

router = APIRouter()


@router.get("", response_model=List[CommentOut])
async def list_comments(prompt_id: int, session: DbSession):
    """List all comments for a prompt (public)."""
    return await CommentService.get_prompt_comments(session, prompt_id)


@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    prompt_id: int,
    body: CommentCreate,
    session: DbSession,
    current_user: CurrentUser,
):
    """Add a comment to a prompt (auth required)."""
    return await CommentService.add_comment(
        session,
        prompt_id=prompt_id,
        user_id=current_user.id,
        content=body.content,
        parent_id=body.parent_id,
    )


@router.delete("/{comment_id}", response_model=CommentOut)
async def delete_comment(
    prompt_id: int,
    comment_id: int,
    session: DbSession,
    current_user: CurrentUser,
):
    """Soft-delete a comment (owner or admin only)."""
    return await CommentService.remove_comment(session, comment_id, current_user)
