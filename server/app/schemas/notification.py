from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    link: str | None = None

class NotificationCreate(NotificationBase):
    user_id: UUID

class NotificationOut(NotificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
