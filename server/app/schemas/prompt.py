from __future__ import annotations

from enum import StrEnum
from typing import Annotated

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from app.schemas.prompt_category import PromptCategoryOut
from app.schemas.prompt_tag import PromptTagOut


class PromptState(StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"


class PromptBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category_id: int | None = Field(default=None, serialization_alias="categoryId")
    category: str = Field(min_length=1, max_length=100)
    tags: list[str] = Field(default_factory=list)
    tag_ids: list[int] = Field(default_factory=list)

    rating: float = 0.0
    uses: int = 0
    author: str = "Unknown"
    featured: bool = False

    views: int = 0
    likes: int = 0
    dislikes: int = 0

    full_description: str = ""
    content: str = ""


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    category_id: int | None = Field(default=None, serialization_alias="categoryId")
    category: str | None = Field(default=None, min_length=1, max_length=100)
    tags: list[str] | None = None
    tag_ids: list[int] | None = None

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
    model_config = ConfigDict(from_attributes=True)

    id: int
    state: PromptState
    category_info: PromptCategoryOut | None = Field(
        default=None, serialization_alias="categoryInfo", validation_alias=AliasChoices("category_ref", "category_info")
    )
    tags_info: list[PromptTagOut] = Field(default_factory=list, serialization_alias="tagsInfo", validation_alias=AliasChoices("tag_refs", "tags_info"))


class PromptSeed(PromptCreate):
    state: PromptState = PromptState.APPROVED
