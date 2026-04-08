from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.skill import Skill
from app.models.skill_engagement import SkillBookmark, SkillComment, SkillView, SkillVote


class SkillEngagementService:

    # ------------------------------------------------------------------
    # Bookmark
    # ------------------------------------------------------------------

    @staticmethod
    async def toggle_bookmark(session: AsyncSession, user_id: UUID, skill_id: UUID) -> bool:
        """Add bookmark if absent, remove if present. Returns current is_bookmarked state."""
        stmt = select(SkillBookmark).where(
            SkillBookmark.user_id == user_id,
            SkillBookmark.skill_id == skill_id,
        )
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            await session.delete(existing)
            await session.commit()
            return False

        session.add(SkillBookmark(user_id=user_id, skill_id=skill_id))
        await session.commit()
        return True

    # ------------------------------------------------------------------
    # Vote
    # ------------------------------------------------------------------

    @staticmethod
    async def vote(session: AsyncSession, user_id: UUID, skill_id: UUID, is_helpful: bool) -> dict:
        """Create or update a vote. Updates denormalized counters on Skill."""
        stmt = select(SkillVote).where(
            SkillVote.user_id == user_id,
            SkillVote.skill_id == skill_id,
        )
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        skill_stmt = select(Skill).where(Skill.id == skill_id)
        skill_result = await session.execute(skill_stmt)
        skill = skill_result.scalar_one_or_none()
        if not skill:
            return {"error": "Skill not found"}

        if existing:
            old_helpful = existing.is_helpful
            existing.is_helpful = is_helpful
            existing.updated_at = datetime.now(timezone.utc)
            # Adjust counters for flipped vote
            if old_helpful != is_helpful:
                if is_helpful:
                    skill.like_count = max(0, skill.like_count + 1)
                    skill.dislike_count = max(0, skill.dislike_count - 1)
                else:
                    skill.dislike_count = max(0, skill.dislike_count + 1)
                    skill.like_count = max(0, skill.like_count - 1)
        else:
            session.add(SkillVote(user_id=user_id, skill_id=skill_id, is_helpful=is_helpful))
            if is_helpful:
                skill.like_count = skill.like_count + 1
            else:
                skill.dislike_count = skill.dislike_count + 1

        await session.commit()
        return {"is_helpful": is_helpful, "like_count": skill.like_count, "dislike_count": skill.dislike_count}

    @staticmethod
    async def remove_vote(session: AsyncSession, user_id: UUID, skill_id: UUID) -> bool:
        stmt = select(SkillVote).where(
            SkillVote.user_id == user_id,
            SkillVote.skill_id == skill_id,
        )
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()
        if not existing:
            return False

        # Update denormalized counters
        skill_result = await session.execute(select(Skill).where(Skill.id == skill_id))
        skill = skill_result.scalar_one_or_none()
        if skill:
            if existing.is_helpful:
                skill.like_count = max(0, skill.like_count - 1)
            else:
                skill.dislike_count = max(0, skill.dislike_count - 1)

        await session.delete(existing)
        await session.commit()
        return True

    # ------------------------------------------------------------------
    # View
    # ------------------------------------------------------------------

    @staticmethod
    async def track_view(
        session: AsyncSession, skill_id: UUID, user_id: UUID | None, ip_address: str | None
    ) -> bool:
        """Record a view; deduplicate by user_id (auth) or ip_address (anon)."""
        if user_id:
            exists_stmt = select(SkillView).where(
                SkillView.skill_id == skill_id,
                SkillView.user_id == user_id,
            )
        elif ip_address:
            exists_stmt = select(SkillView).where(
                SkillView.skill_id == skill_id,
                SkillView.ip_address == ip_address,
                SkillView.user_id.is_(None),
            )
        else:
            # Cannot deduplicate without identifier — skip
            return False

        result = await session.execute(exists_stmt)
        if result.scalar_one_or_none():
            return False  # duplicate

        session.add(SkillView(skill_id=skill_id, user_id=user_id, ip_address=ip_address))

        # Update denormalized counter on Skill
        skill_result = await session.execute(select(Skill).where(Skill.id == skill_id))
        skill = skill_result.scalar_one_or_none()
        if skill:
            skill.view_count = skill.view_count + 1

        await session.commit()
        return True

    # ------------------------------------------------------------------
    # Comments
    # ------------------------------------------------------------------

    @staticmethod
    async def get_comments(session: AsyncSession, skill_id: UUID) -> list[dict]:
        """Return top-level comments with nested replies (max 1 level)."""
        stmt = (
            select(SkillComment)
            .options(
                selectinload(SkillComment.user),
                selectinload(SkillComment.replies).selectinload(SkillComment.user),
            )
            .where(
                SkillComment.skill_id == skill_id,
                SkillComment.parent_id.is_(None),
                SkillComment.is_deleted.is_(False),
            )
            .order_by(SkillComment.created_at.asc())
        )
        result = await session.execute(stmt)
        comments = result.scalars().all()
        return [SkillEngagementService._serialize_comment(c) for c in comments]

    @staticmethod
    def _serialize_comment(comment: SkillComment) -> dict:
        replies = []
        for r in (comment.replies or []):
            if not r.is_deleted and r.deleted_at is None:
                replies.append(SkillEngagementService._serialize_comment(r))
        return {
            "id": comment.id,
            "skill_id": comment.skill_id,
            "user_id": comment.user_id,
            "parent_id": comment.parent_id,
            "content": comment.content if comment.deleted_at is None else "[deleted]",
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "user": {
                "id": comment.user.id,
                "full_name": comment.user.full_name,
                "avatar_url": comment.user.avatar_url,
            } if comment.user else None,
            "replies": replies,
        }

    @staticmethod
    async def add_comment(
        session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
        content: str,
        parent_id: int | None = None,
    ) -> dict:
        """Add a comment. Validates parent exists and is top-level (max 1 nesting)."""
        if parent_id is not None:
            parent_stmt = select(SkillComment).where(SkillComment.id == parent_id)
            parent_result = await session.execute(parent_stmt)
            parent = parent_result.scalar_one_or_none()
            if not parent:
                raise ValueError("Parent comment not found")
            if parent.parent_id is not None:
                raise ValueError("Replies can only be made to top-level comments")

        comment = SkillComment(
            skill_id=skill_id,
            user_id=user_id,
            content=content,
            parent_id=parent_id,
            created_by=user_id,
        )
        session.add(comment)
        await session.commit()
        await session.refresh(comment)

        # Load user for serialization
        stmt = (
            select(SkillComment)
            .options(selectinload(SkillComment.user))
            .where(SkillComment.id == comment.id)
        )
        result = await session.execute(stmt)
        comment = result.scalar_one()
        return SkillEngagementService._serialize_comment(comment)

    @staticmethod
    async def delete_comment(
        session: AsyncSession, comment_id: int, requesting_user_id: UUID, is_admin: bool
    ) -> bool:
        """Soft-delete a comment. Only owner or admin can delete."""
        stmt = select(SkillComment).where(SkillComment.id == comment_id)
        result = await session.execute(stmt)
        comment = result.scalar_one_or_none()
        if not comment:
            return False
        if not is_admin and comment.user_id != requesting_user_id:
            return False

        comment.deleted_at = datetime.now(timezone.utc)
        comment.deleted_by = requesting_user_id
        await session.commit()
        return True
