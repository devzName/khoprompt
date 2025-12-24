from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRole(StrEnum):
    USER = "user"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    picture: str | None = None
    roles: list[UserRole] = Field(default_factory=lambda: [UserRole.USER])

    @field_validator("roles", mode="before")
    @classmethod
    def extract_role_names(cls, v):
        if isinstance(v, list):
            return [getattr(r, "value", getattr(r, "name", r)) for r in v]
        return v


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    is_deleted: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class TokenPayload(BaseModel):
    sub: str | None = None
    jti: str | None = None
    v: int = 0


class GoogleLogin(BaseModel):
    id_token: str
