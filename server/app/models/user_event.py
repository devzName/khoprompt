from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserEvent(Base):
    """Tracks individual user interaction events for interest profiling."""

    __tablename__ = "user_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    # Event type: view, copy, bookmark, search, dismiss, etc.
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    prompt_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("prompts.id", ondelete="SET NULL"), nullable=True
    )
    # Flexible payload: query, tags, duration_ms, etc.
    # Named 'event_metadata' to avoid conflict with SQLAlchemy's reserved 'metadata' attribute.
    event_metadata: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
