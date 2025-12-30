from __future__ import annotations

from sqlalchemy import Integer, String, Text, Boolean, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from uuid import UUID

from app.models.base import Base
from app.models.mixins import AuditMixin

# Association table for many-to-many relationship between prompts and tags
prompt_tags_association = Table(
    'prompt_tags_association',
    Base.metadata,
    Column('prompt_id', Integer, ForeignKey('prompts.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('prompt_tags.id'), primary_key=True)
)

class Prompt(AuditMixin, Base):
    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Status: pending, approved, rejected
    status: Mapped[str] = mapped_column(String(20), nullable=False, default='pending', index=True)
    
    # Category relationship
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey('prompt_categories.id'), nullable=True)
    category: Mapped['PromptCategory'] = relationship('PromptCategory', back_populates='prompts')
    
    # User relationship
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    user: Mapped['User'] = relationship('User', back_populates='prompts')
    
    # Tags relationship (many-to-many)
    tags: Mapped[list['PromptTag']] = relationship(
        'PromptTag', 
        secondary=prompt_tags_association, 
        back_populates='prompts'
    )
    
    # Votes relationship
    votes: Mapped[list['PromptVote']] = relationship('PromptVote', back_populates='prompt')
    
    # Stats
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    dislike_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)