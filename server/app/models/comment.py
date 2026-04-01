from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import UUID

from app.models.base import Base
from app.models.mixins import AuditMixin


class PromptComment(AuditMixin, Base):
    """User comments on prompts, supporting nested replies via parent_id."""

    __tablename__ = "prompt_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    prompt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    # Nullable parent — top-level comments have no parent
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("prompt_comments.id", ondelete="CASCADE"), nullable=True
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Soft-delete for comments (separate from AuditMixin.deleted_at intentionally
    # so the comment thread stays visible but content is hidden)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    prompt: Mapped["Prompt"] = relationship("Prompt", back_populates="comments")
    user: Mapped["User"] = relationship("User", back_populates="comments")
    parent: Mapped["PromptComment | None"] = relationship(
        "PromptComment", remote_side="PromptComment.id", back_populates="replies"
    )
    replies: Mapped[list["PromptComment"]] = relationship(
        "PromptComment", back_populates="parent"
    )
