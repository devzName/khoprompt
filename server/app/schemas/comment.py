from __future__ import annotations

import re
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[int] = None

    @field_validator("content")
    @classmethod
    def strip_html(cls, v: str) -> str:
        """Strip HTML tags from comment content."""
        v = v.strip()
        v = re.sub(r"<[^>]+>", "", v)
        return v.strip()


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prompt_id: int
    user_id: UUID
    parent_id: Optional[int] = None
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    author_name: Optional[str] = None
    replies: List["CommentOut"] = []


# Resolve forward reference
CommentOut.model_rebuild()
