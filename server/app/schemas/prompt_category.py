from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PromptCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    description: str | None = None
    description_vi: str | None = None
    display_order: int | None = None


class PromptCategoryCreate(PromptCategoryBase):
    pass


class PromptCategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    description_vi: str | None = None
    display_order: int | None = None


class PromptCategoryOut(PromptCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PromptCategoryStats(PromptCategoryOut):
    prompt_count: int


class PromptCategoryStatsResponse(BaseModel):
    categories: list[PromptCategoryStats]
    total_prompts: int
