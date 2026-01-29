from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, description="Username or email")
    password: str = Field(min_length=1, description="Admin password")


class MicrosoftLoginRequest(BaseModel):
    token: str = Field(min_length=1, description="Microsoft ID token")


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