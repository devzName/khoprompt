from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class BookmarkBase(BaseModel):
    prompt_id: int


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkResponse(BookmarkBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookmarkToggleRequest(BaseModel):
    prompt_id: int


class BookmarkToggleResponse(BaseModel):
    is_bookmarked: bool
    message: str


class BookmarkStatusResponse(BaseModel):
    is_bookmarked: bool


class BookmarkedPromptResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    category: Optional[dict] = None
    tags: Optional[list] = None
    user: Optional[dict] = None
    created_at: datetime
    view_count: int = 0
    bookmark_created_at: datetime

    class Config:
        from_attributes = True