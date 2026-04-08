from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.models.mixins import AuditMixin


class SkillBookmark(Base):
    """User bookmarks for skills — mirrors Bookmark model."""

    __tablename__ = "skill_bookmarks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skill_bookmarks")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="bookmarks")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="unique_user_skill_bookmark"),
    )


class SkillVote(Base):
    """User votes on skills — mirrors PromptVote model."""

    __tablename__ = "skill_votes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    skill_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    is_helpful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skill_votes")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="votes")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="unique_user_skill_vote"),
    )


class SkillView(Base):
    """View tracking for skills — mirrors PromptView model."""

    __tablename__ = "skill_views"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="views")
    user: Mapped["User | None"] = relationship("User", back_populates="skill_views")


class SkillComment(AuditMixin, Base):
    """User comments on skills with nested reply support — mirrors PromptComment."""

    __tablename__ = "skill_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("skill_comments.id", ondelete="CASCADE"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Soft-delete — AuditMixin also has deleted_at but we keep this explicit
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="comments")
    user: Mapped["User"] = relationship("User", back_populates="skill_comments")
    parent: Mapped["SkillComment | None"] = relationship(
        "SkillComment", remote_side="SkillComment.id", back_populates="replies"
    )
    replies: Mapped[list["SkillComment"]] = relationship(
        "SkillComment", back_populates="parent"
    )
