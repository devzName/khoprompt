from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Skill Spec — stored as JSONB in the DB
# ---------------------------------------------------------------------------

class SkillSpec(BaseModel):
    version: str = "1.0"
    metadata: dict[str, Any]  # {name: str, description: str}
    steps: list[str]
    tools: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Agent-specific compilation settings (not persisted on the model itself)
# ---------------------------------------------------------------------------

class AgentSettings(BaseModel):
    copilot_apply_to: str = "**/*"
    cursor_always_apply: bool = False
    cursor_globs: str | None = None


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------

class SkillCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None
    spec: SkillSpec
    tags: list[str] = Field(default_factory=list)
    category: str | None = Field(None, max_length=50)
    agent_settings: AgentSettings = Field(default_factory=AgentSettings)


class SkillUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    description: str | None = None
    spec: SkillSpec | None = None
    tags: list[str] | None = None
    category: str | None = Field(None, max_length=50)
    is_public: bool | None = None
    agent_settings: AgentSettings | None = None


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------

class CompilationOut(BaseModel):
    agent: str
    output: str
    file_path: str | None

    model_config = {"from_attributes": True}


class SkillAuthorOut(BaseModel):
    id: UUID
    full_name: str
    avatar_url: str | None

    model_config = {"from_attributes": True}


class SkillOut(BaseModel):
    id: UUID
    name: str
    description: str | None
    spec: dict[str, Any]
    tags: list[str]
    category: str | None
    is_public: bool
    approval_status: str
    created_by: UUID | None
    user: SkillAuthorOut | None
    created_at: datetime
    updated_at: datetime
    compilations: list[CompilationOut]
    view_count: int
    like_count: int
    dislike_count: int
    bookmark_count: int
    comment_count: int

    model_config = {"from_attributes": True}


class SkillListOut(BaseModel):
    """Lightweight version for list endpoints — no compilations."""

    id: UUID
    name: str
    description: str | None
    tags: list[str]
    category: str | None
    is_public: bool
    approval_status: str
    created_by: UUID | None
    user: SkillAuthorOut | None
    created_at: datetime
    updated_at: datetime
    view_count: int
    like_count: int
    dislike_count: int
    bookmark_count: int
    comment_count: int

    model_config = {"from_attributes": True}
