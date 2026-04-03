from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import PromptComment
from app.models.user import User


class CommentRepository:
    """Data access for prompt comments."""

    @staticmethod
    async def get_comments_for_prompt(
        db: AsyncSession, prompt_id: int
    ) -> List[PromptComment]:
        """Return top-level comments with their replies and author info eagerly loaded."""
        # Load top-level comments with replies and user relationships
        stmt = (
            select(PromptComment)
            .where(
                PromptComment.prompt_id == prompt_id,
                PromptComment.parent_id.is_(None),
            )
            .options(
                selectinload(PromptComment.user),
                selectinload(PromptComment.replies).selectinload(PromptComment.user),
            )
            .order_by(PromptComment.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, comment_id: int) -> Optional[PromptComment]:
        """Fetch a single comment by PK."""
        result = await db.execute(
            select(PromptComment).where(PromptComment.id == comment_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_comment(
        db: AsyncSession,
        prompt_id: int,
        user_id: UUID,
        content: str,
        parent_id: Optional[int] = None,
    ) -> PromptComment:
        """Persist a new comment and return it with its author loaded."""
        comment = PromptComment(
            prompt_id=prompt_id,
            user_id=user_id,
            content=content,
            parent_id=parent_id,
        )
        db.add(comment)
        await db.commit()
        await db.refresh(comment)

        # Reload with user relationship for serialisation
        result = await db.execute(
            select(PromptComment)
            .where(PromptComment.id == comment.id)
            .options(
                selectinload(PromptComment.user),
                selectinload(PromptComment.replies),
            )
        )
        return result.scalar_one()

    @staticmethod
    async def soft_delete(
        db: AsyncSession, comment: PromptComment
    ) -> PromptComment:
        """Soft-delete a comment by setting deleted_at."""
        comment.deleted_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(comment)

        # Reload with relationships for serialisation
        result = await db.execute(
            select(PromptComment)
            .where(PromptComment.id == comment.id)
            .options(
                selectinload(PromptComment.user),
                selectinload(PromptComment.replies),
            )
        )
        return result.scalar_one()
