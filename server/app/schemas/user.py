from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserRole(StrEnum):
    USER = "user"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    roles: list[UserRole] = Field(default_factory=lambda: [UserRole.USER])


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: UUID
    is_active: bool
    is_deleted: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class TokenPayload(BaseModel):
    sub: str | None = None


class GoogleLogin(BaseModel):
    id_token: str
