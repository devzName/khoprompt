from __future__ import annotations

import uuid
from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import AuditMixin


class Skill(AuditMixin, Base):
    """AI agent skill definition with spec and compilation outputs."""

    __tablename__ = "skills"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # JSONB stores the SkillSpec: {version, metadata, steps, tools, constraints}
    spec: Mapped[dict] = mapped_column(JSONB, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list, server_default="{}")
    category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)

    # Ownership — separate FK from AuditMixin.created_by for explicit relationship
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Moderation
    approval_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    approved_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Denormalized engagement counters (updated by service layer)
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    dislike_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skills", foreign_keys="Skill.user_id")
    compilations: Mapped[list["SkillCompilation"]] = relationship(
        "SkillCompilation", back_populates="skill", cascade="all, delete-orphan"
    )
    bookmarks: Mapped[list["SkillBookmark"]] = relationship("SkillBookmark", back_populates="skill")
    votes: Mapped[list["SkillVote"]] = relationship("SkillVote", back_populates="skill")
    views: Mapped[list["SkillView"]] = relationship("SkillView", back_populates="skill")
    comments: Mapped[list["SkillComment"]] = relationship("SkillComment", back_populates="skill")


class SkillCompilation(Base):
    """Compiled output for a specific AI agent format."""

    __tablename__ = "skill_compilations"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Agent identifier: claude | copilot | cursor | codex | opencode
    agent: Mapped[str] = mapped_column(String(20), nullable=False)
    output: Mapped[str] = mapped_column(Text, nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="compilations")

    from sqlalchemy import UniqueConstraint
    __table_args__ = (
        UniqueConstraint("skill_id", "agent", name="unique_skill_agent_compilation"),
    )
