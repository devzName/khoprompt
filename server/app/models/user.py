from __future__ import annotations

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from uuid import UUID, uuid4
from datetime import datetime

from app.models.base import Base
from app.models.mixins import AuditMixin


class User(AuditMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    user_type: Mapped[str] = mapped_column(String(50), nullable=False, default="google")
    
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    prompts: Mapped[list['Prompt']] = relationship('Prompt', back_populates='user')
    prompt_votes: Mapped[list['PromptVote']] = relationship('PromptVote', back_populates='user')