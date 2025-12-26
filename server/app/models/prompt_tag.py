from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import AuditMixin


class PromptTag(AuditMixin, Base):
    __tablename__ = "prompt_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    
    # Relationship with prompts (many-to-many)
    prompts: Mapped[list['Prompt']] = relationship(
        'Prompt', 
        secondary='prompt_tags_association', 
        back_populates='tags'
    )