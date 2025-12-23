from __future__ import annotations

from uuid import UUID

from sqlalchemy import CheckConstraint, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PromptVote(Base):
    __tablename__ = "prompt_votes"
    __table_args__ = (
        UniqueConstraint("user_id", "prompt_id", name="uq_prompt_votes_user_prompt"),
        CheckConstraint("value in (-1, 1)", name="ck_prompt_votes_value"),
    )

    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    prompt_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
