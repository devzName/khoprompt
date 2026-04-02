from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import PromptComment
from app.models.user import User
from app.repositories.comment_repo import CommentRepository
from app.schemas.comment import CommentOut


def _build_comment_out(comment: PromptComment) -> CommentOut:
    """Map ORM comment (with .user and .replies loaded) to CommentOut schema."""
    author_name = None
    if comment.user:
        author_name = comment.user.full_name or comment.user.email

    replies = [
        CommentOut(
            id=r.id,
            prompt_id=r.prompt_id,
            user_id=r.user_id,
            parent_id=r.parent_id,
            content=r.content,
            created_at=r.created_at,
            updated_at=getattr(r, "updated_at", None),
            deleted_at=r.deleted_at,
            author_name=(r.user.full_name or r.user.email) if r.user else None,
            replies=[],
        )
        for r in sorted(comment.replies, key=lambda x: x.created_at)
    ]

    return CommentOut(
        id=comment.id,
        prompt_id=comment.prompt_id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=getattr(comment, "updated_at", None),
        deleted_at=comment.deleted_at,
        author_name=author_name,
        replies=replies,
    )


class CommentService:
    """Business logic for prompt comments."""

    @staticmethod
    async def get_prompt_comments(
        db: AsyncSession, prompt_id: int
    ) -> List[CommentOut]:
        """Return top-level comments with nested replies for a prompt."""
        comments = await CommentRepository.get_comments_for_prompt(db, prompt_id)
        return [_build_comment_out(c) for c in comments]

    @staticmethod
    async def add_comment(
        db: AsyncSession,
        prompt_id: int,
        user_id: UUID,
        content: str,
        parent_id: int | None = None,
    ) -> CommentOut:
        """Create a new comment (top-level or reply). Validates parent depth."""
        if parent_id is not None:
            parent = await CommentRepository.get_by_id(db, parent_id)
            if parent is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found",
                )
            if parent.parent_id is not None:
                # Enforce 1-level nesting only
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Replies to replies are not allowed (max 1 level)",
                )
            if parent.prompt_id != prompt_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment does not belong to this prompt",
                )

        comment = await CommentRepository.create_comment(
            db, prompt_id, user_id, content, parent_id
        )
        return _build_comment_out(comment)

    @staticmethod
    async def remove_comment(
        db: AsyncSession,
        comment_id: int,
        requesting_user: User,
    ) -> CommentOut:
        """Soft-delete a comment. Only owner or admin may delete."""
        comment = await CommentRepository.get_by_id(db, comment_id)
        if comment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found",
            )
        if comment.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Comment already deleted",
            )
        is_owner = comment.user_id == requesting_user.id
        is_admin = requesting_user.user_type == "admin"
        if not (is_owner or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this comment",
            )

        updated = await CommentRepository.soft_delete(db, comment)
        return _build_comment_out(updated)
