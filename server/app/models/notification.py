from __future__ import annotations

from sqlalchemy import String, Boolean, DateTime, Text, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum as PyEnum

from app.models.base import Base
from app.models.mixins import AuditMixin


class NotificationStatus(PyEnum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class NotificationGroup(Base):
    __tablename__ = "notification_groups"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_by: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    notifications: Mapped[list['Notification']] = relationship('Notification', back_populates='group')


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    notification_group_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("notification_groups.id", ondelete="SET NULL"), nullable=True
    )
    target_audience: Mapped[str] = mapped_column(String(50), nullable=False, default="all")
    target_user_ids: Mapped[list[UUID] | None] = mapped_column(JSONB, nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="published")
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    show_as_modal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    group: Mapped[NotificationGroup | None] = relationship('NotificationGroup', back_populates='notifications')
    user_notifications: Mapped[list['UserNotification']] = relationship('UserNotification', back_populates='notification')


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    notification_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="unread")
    viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    notification: Mapped[Notification] = relationship('Notification', back_populates='user_notifications')