from __future__ import annotations

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import UUID as PyUUID

from app.models.base import Base


class PromptView(Base):
    __tablename__ = "prompt_views"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Nullable for anonymous views
    ip_address = Column(String(45), nullable=True)  # For anonymous tracking
    user_agent = Column(String(500), nullable=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prompt = relationship("Prompt", back_populates="views")
    user = relationship("User", back_populates="prompt_views")