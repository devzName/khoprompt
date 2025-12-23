from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class RoleOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None

    class Config:
        from_attributes = True
