from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=1, description="Google ID token from frontend")


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, description="Username or email")
    password: str = Field(min_length=1, description="Admin password")


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: str | None = None
    user_type: str
    is_active: bool
    last_login_at: datetime | None = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut