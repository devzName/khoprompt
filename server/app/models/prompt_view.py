from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PromptView(Base):
    """
    Tracks individual prompt views. Source of truth for view counting.
    
    Design:
    - Composite unique constraints ensure one view per user/fingerprint
    - user_id for authenticated users, viewer_hash for guests
    - Stores metadata for analytics and bot detection
    """
    __tablename__ = "prompt_views"
    __table_args__ = (
        UniqueConstraint("prompt_id", "user_id", name="uq_prompt_view_user"),
        UniqueConstraint("prompt_id", "viewer_hash", name="uq_prompt_view_hash"),
        Index("ix_prompt_views_prompt_id", "prompt_id"),
        Index("ix_prompt_views_viewed_at", "viewed_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    prompt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    viewer_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[str] = mapped_column(String(512), nullable=False)
    viewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    read_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scroll_depth_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
