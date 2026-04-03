from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator
from uuid import UUID
from datetime import datetime
import re


class PromptBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    content: str = Field(min_length=1)
    content_format: str = Field(default='html')
    notes: str | None = None
    images: list[str] | None = None
    category_id: int | None = None
    ai_model: str | None = None


class PromptCreate(PromptBase):
    model_config = ConfigDict(extra='ignore')
    tags: list[int] = Field(default_factory=list)


class PromptUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    content: str | None = Field(default=None, min_length=1)
    content_format: str | None = None
    notes: str | None = None
    images: list[str] | None = None
    category_id: int | None = None
    tags: list[int] | None = None
    ai_model: str | None = None


class RejectRequest(BaseModel):
    """Body for the POST /prompts/{id}/reject endpoint."""
    rejection_reason: str = Field(min_length=10, max_length=1000)

    @field_validator("rejection_reason")
    @classmethod
    def strip_html(cls, v: str) -> str:
        # Strip leading/trailing whitespace and simple HTML tags
        v = v.strip()
        v = re.sub(r"<[^>]+>", "", v)
        return v.strip()


class PromptOut(PromptBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    status: str
    user_id: UUID
    view_count: int
    like_count: int
    dislike_count: int
    created_at: datetime
    updated_at: datetime
    # Rejection fields (None when not rejected)
    rejection_reason: str | None = None
    rejected_at: datetime | None = None
    rejected_by: UUID | None = None


class PromptWithDetails(PromptOut):
    user: dict | None = None
    category: dict | None = None
    tags: list[dict] = Field(default_factory=list)
    rating: float | None = None
    simple_rating: float | None = None
    author: str | None = None