from __future__ import annotations

from sqlalchemy import insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.models.prompt_view import PromptView


class PromptViewRepository:
    """Repository for atomic view tracking operations."""

    @staticmethod
    async def try_record_view(
        session: AsyncSession,
        prompt_id: int,
        user_id: UUID | None,
        viewer_hash: str | None,
        ip_address: str,
        user_agent: str,
        read_time: int | None = None,
        scroll_depth: int | None = None,
    ) -> bool:
        """
        Atomically insert view record. Returns True if inserted (new view).
        Uses INSERT ... ON CONFLICT DO NOTHING for idempotency.
        
        Args:
            session: Database session
            prompt_id: ID of the prompt being viewed
            user_id: User ID if authenticated, None for guests
            viewer_hash: SHA256 hash for guest identification
            ip_address: Client IP address
            user_agent: Client user agent string
            read_time: Seconds spent reading (optional)
            scroll_depth: Scroll percentage (optional)
            
        Returns:
            True if view was recorded (first time), False if duplicate
        """
        stmt = pg_insert(PromptView).values(
            prompt_id=prompt_id,
            user_id=user_id,
            viewer_hash=viewer_hash,
            ip_address=ip_address,
            user_agent=user_agent,
            read_time_seconds=read_time,
            scroll_depth_percent=scroll_depth,
        )
        
        # Use appropriate unique constraint based on user type
        if user_id:
            stmt = stmt.on_conflict_do_nothing(index_elements=["prompt_id", "user_id"])
        else:
            stmt = stmt.on_conflict_do_nothing(index_elements=["prompt_id", "viewer_hash"])
        
        result = await session.execute(stmt)
        await session.flush()
        
        # rowcount > 0 means insert succeeded (new view)
        # rowcount == 0 means conflict (duplicate view)
        return result.rowcount > 0

    @staticmethod
    async def get_view_count(session: AsyncSession, prompt_id: int) -> int:
        """Get total view count for a prompt from PromptView table."""
        from sqlalchemy import func
        
        stmt = select(func.count(PromptView.id)).where(PromptView.prompt_id == prompt_id)
        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def has_viewed(
        session: AsyncSession, prompt_id: int, user_id: UUID | None, viewer_hash: str | None
    ) -> bool:
        """Check if user/guest has already viewed this prompt."""
        if user_id:
            stmt = select(PromptView).where(
                PromptView.prompt_id == prompt_id, PromptView.user_id == user_id
            )
        else:
            stmt = select(PromptView).where(
                PromptView.prompt_id == prompt_id, PromptView.viewer_hash == viewer_hash
            )
        
        result = await session.execute(stmt)
        return result.scalar_one_or_none() is not None
