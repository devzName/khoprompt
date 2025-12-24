from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func, text, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import AuditMixin
from app.models.prompt_tag import prompt_tag_links


class Prompt(AuditMixin, Base):
    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("prompt_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=True, default=list)

    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    uses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    author: Mapped[str] = mapped_column(String(100), nullable=False, default="Unknown")
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    likes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    dislikes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    full_description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")

    state: Mapped[str] = mapped_column(String(20), nullable=False, server_default="DRAFT", index=True)
    owner_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True, server_default=text("NULL")
    )

    category_ref: Mapped["PromptCategory"] = relationship(
        "PromptCategory", back_populates="prompts", lazy="selectin"
    )

    tag_refs: Mapped[list["PromptTag"]] = relationship(
        "PromptTag", secondary=prompt_tag_links, back_populates="prompts", lazy="selectin"
    )
