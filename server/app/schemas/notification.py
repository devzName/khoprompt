from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class NotificationGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class NotificationGroupCreate(NotificationGroupBase):
    pass

class NotificationGroupUpdate(NotificationGroupBase):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class NotificationGroupResponse(NotificationGroupBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    content: str
    notification_group_id: Optional[UUID] = None
    target_audience: str = "all"  # all, specific_users, user_groups
    target_user_ids: Optional[List[UUID]] = None
    is_pinned: bool = False
    is_active: bool = True
    scheduled_at: Optional[datetime] = None
    is_public: bool = False
    show_as_modal: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    title: Optional[str] = None
    content: Optional[str] = None
    notification_group_id: Optional[UUID] = None
    target_audience: Optional[str] = None
    target_user_ids: Optional[List[UUID]] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    is_public: Optional[bool] = None
    show_as_modal: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: UUID
    status: str = "published"
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserNotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    notification_id: UUID
    status: str  # unread, read, archived
    viewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    notification: NotificationResponse

    class Config:
        from_attributes = True

class UserNotificationJoinResponse(BaseModel):
    """Flat response for Lazy JOIN — notification fields + per-user read status"""
    id: UUID
    title: str
    content: str
    target_audience: str
    is_pinned: bool
    is_public: bool
    show_as_modal: bool
    status: str
    sent_at: Optional[datetime] = None
    created_at: datetime
    user_status: Optional[str] = "unread"
    viewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True