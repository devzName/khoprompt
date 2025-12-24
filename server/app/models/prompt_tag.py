from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import AuditMixin

# Association table for Prompt <-> PromptTag
prompt_tag_links = Table(
    "prompt_tag_links",
    Base.metadata,
    Column("prompt_id", Integer, ForeignKey("prompts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("prompt_tags.id", ondelete="CASCADE"), primary_key=True),
)


class PromptTag(AuditMixin, Base):
    __tablename__ = "prompt_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)

    prompts: Mapped[list["Prompt"]] = relationship(
        "Prompt", secondary=prompt_tag_links, back_populates="tag_refs"
    )
