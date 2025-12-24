from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Any

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

    @staticmethod
    def _get_author(obj: Any) -> str:
        if obj.owner_ref and obj.owner_ref.full_name:
            return obj.owner_ref.full_name
        return obj.author or "Unknown"

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = super().model_validate(obj, **kwargs)
        if hasattr(obj, "owner_ref") and obj.owner_ref and obj.owner_ref.full_name:
            data.author = obj.owner_ref.full_name
        return data


class PromptSeed(PromptCreate):
    state: PromptState = PromptState.APPROVED
