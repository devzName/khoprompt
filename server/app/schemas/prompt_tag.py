from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PromptTagBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category_id: int


class PromptTagCreate(PromptTagBase):
    pass


class PromptTagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category_id: int | None = None


class PromptTagOut(PromptTagBase):
    model_config = ConfigDict(from_attributes=True)

    id: int