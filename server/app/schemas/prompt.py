from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class PromptState(StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"


class PromptBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    tags: list[str] = Field(default_factory=list)

    rating: float = 0.0
    uses: int = 0
    author: str = "Unknown"
    featured: bool = False

    views: int = 0
    likes: int = 0
    dislikes: int = 0

    full_description: str = Field(
        default="",
        validation_alias=AliasChoices("full_description", "fullDescription"),
        serialization_alias="fullDescription",
    )
    content: str = ""
    is_deleted: bool = False


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    tags: list[str] | None = None

    rating: float | None = None
    uses: int | None = None
    author: str | None = None
    featured: bool | None = None

    views: int | None = None
    likes: int | None = None
    dislikes: int | None = None

    full_description: str | None = None
    content: str | None = None


class PromptOut(PromptBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    state: PromptState
    owner_id: UUID | None = Field(default=None, serialization_alias="ownerId")


class PromptSeed(PromptCreate):
    id: int
    state: PromptState = PromptState.APPROVED
