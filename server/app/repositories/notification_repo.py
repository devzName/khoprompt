from __future__ import annotations

from uuid import UUID
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

class NotificationRepository:
    @staticmethod
    async def create(session: AsyncSession, data: NotificationCreate) -> Notification:
        notification = Notification(**data.model_dump())
        session.add(notification)
        await session.flush()
        return notification

    @staticmethod
    async def list_for_user(
        session: AsyncSession, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_deleted.is_(False))
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count_unread(session: AsyncSession, user_id: UUID) -> int:
        stmt = (
            select(func.count(Notification.id))
            .where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
                Notification.is_deleted.is_(False)
            )
        )
        result = await session.execute(stmt)
        return int(result.scalar_one())

    @staticmethod
    async def mark_as_read(session: AsyncSession, notification_id: UUID, user_id: UUID) -> bool:
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True, updated_at=func.now())
        )
        result = await session.execute(stmt)
        return getattr(result, "rowcount", 0) > 0

    @staticmethod
    async def mark_all_as_read(session: AsyncSession, user_id: UUID) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True, updated_at=func.now())
        )
        result = await session.execute(stmt)
        return getattr(result, "rowcount", 0)
