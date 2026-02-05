from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime


class PromptBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    content: str = Field(min_length=1)
    notes: str | None = None
    images: list[str] | None = None
    category_id: int | None = None


class PromptCreate(PromptBase):
    model_config = ConfigDict(extra='ignore')
    tags: list[int] = Field(default_factory=list)


class PromptUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    content: str | None = Field(default=None, min_length=1)
    notes: str | None = None
    images: list[str] | None = None
    category_id: int | None = None
    tags: list[int] | None = None


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


class PromptWithDetails(PromptOut):
    user: dict | None = None
    category: dict | None = None
    tags: list[dict] = Field(default_factory=list)
    rating: float | None = None
    simple_rating: float | None = None
    author: str | None = None