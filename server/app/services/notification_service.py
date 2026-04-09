from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.dialects.postgresql import insert as pg_insert
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional

from app.models.notification import NotificationGroup, Notification, UserNotification
from app.schemas.notification import (
    NotificationGroupCreate, NotificationGroupUpdate,
    NotificationCreate, NotificationUpdate
)

class NotificationService:
    
    @staticmethod
    async def get_notification_groups(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[NotificationGroup]:
        """Get all notification groups"""
        stmt = select(NotificationGroup).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def get_notification_group(db: AsyncSession, group_id: UUID) -> Optional[NotificationGroup]:
        """Get a specific notification group"""
        stmt = select(NotificationGroup).where(NotificationGroup.id == group_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_notification_group(db: AsyncSession, group: NotificationGroupCreate) -> NotificationGroup:
        """Create a new notification group"""
        db_group = NotificationGroup(**group.model_dump())
        db.add(db_group)
        await db.commit()
        await db.refresh(db_group)
        return db_group
    
    @staticmethod
    async def update_notification_group(db: AsyncSession, group_id: UUID, group_update: NotificationGroupUpdate) -> Optional[NotificationGroup]:
        """Update a notification group"""
        stmt = update(NotificationGroup).where(NotificationGroup.id == group_id)
        
        # Prepare update values
        update_values = group_update.model_dump(exclude_unset=True)
        if 'is_active' in update_values:
            update_values['updated_at'] = datetime.now(timezone.utc)
            
        stmt = stmt.values(**update_values)
        result = await db.execute(stmt)
        
        if result.rowcount == 0:
            return None
            
        await db.commit()
        return await NotificationService.get_notification_group(db, group_id)
    
    @staticmethod
    async def delete_notification_group(db: AsyncSession, group_id: UUID) -> bool:
        """Delete a notification group"""
        stmt = delete(NotificationGroup).where(NotificationGroup.id == group_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def get_notifications(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get all notifications"""
        stmt = select(Notification).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def get_notification(db: AsyncSession, notification_id: UUID) -> Optional[Notification]:
        """Get a specific notification"""
        stmt = select(Notification).where(Notification.id == notification_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_notification(db: AsyncSession, notification: NotificationCreate) -> Notification:
        """Create a new notification. Broadcast ('all') uses Lazy JOIN — no fan-out rows."""
        data = notification.model_dump()
        target_user_ids = data.get('target_user_ids')
        db_notification = Notification(**data)

        # Set scheduling status
        now = datetime.now(timezone.utc)
        if data.get('scheduled_at') and data['scheduled_at'] > now:
            db_notification.status = 'scheduled'
        else:
            db_notification.status = 'published'
            db_notification.sent_at = now

        db.add(db_notification)
        await db.flush()  # get the id before adding related rows

        # Only create UserNotification rows for specific_users targeting
        if data.get('target_audience') == 'specific_users' and target_user_ids:
            for uid in target_user_ids:
                db.add(UserNotification(user_id=uid, notification_id=db_notification.id))

        await db.commit()
        await db.refresh(db_notification)
        return db_notification
    
    @staticmethod
    async def update_notification(db: AsyncSession, notification_id: UUID, notification_update: NotificationUpdate) -> Optional[Notification]:
        """Update a notification"""
        stmt = update(Notification).where(Notification.id == notification_id)
        
        # Prepare update values
        update_values = notification_update.model_dump(exclude_unset=True)
        if 'is_active' in update_values:
            update_values['updated_at'] = datetime.now(timezone.utc)
            
        stmt = stmt.values(**update_values)
        result = await db.execute(stmt)
        
        if result.rowcount == 0:
            return None
            
        await db.commit()
        return await NotificationService.get_notification(db, notification_id)
    
    @staticmethod
    async def delete_notification(db: AsyncSession, notification_id: UUID) -> bool:
        """Delete a notification"""
        stmt = delete(Notification).where(Notification.id == notification_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def get_user_notifications(db: AsyncSession, user_id: UUID) -> List[dict]:
        """Get user's notifications via Lazy JOIN — returns broadcast + targeted notis."""
        stmt = (
            select(
                Notification.id,
                Notification.title,
                Notification.content,
                Notification.target_audience,
                Notification.is_pinned,
                Notification.is_public,
                Notification.show_as_modal,
                Notification.status,
                Notification.sent_at,
                Notification.created_at,
                UserNotification.status.label("user_status"),
                UserNotification.viewed_at,
            )
            .outerjoin(
                UserNotification,
                (UserNotification.notification_id == Notification.id) & (UserNotification.user_id == user_id)
            )
            .where(
                Notification.status == "published",
                Notification.is_active == True,
                (Notification.target_audience == "all") |
                (
                    (Notification.target_audience == "specific_users") &
                    (UserNotification.user_id == user_id)
                ),
            )
            .order_by(Notification.is_pinned.desc(), Notification.created_at.desc())
        )
        result = await db.execute(stmt)
        rows = result.mappings().all()
        return [dict(r) for r in rows]

    @staticmethod
    async def get_public_notifications(db: AsyncSession, limit: int = 50) -> List[Notification]:
        """Get public published notifications — no auth required."""
        stmt = (
            select(Notification)
            .where(
                Notification.is_public == True,
                Notification.status == "published",
                Notification.is_active == True,
            )
            .order_by(Notification.is_pinned.desc(), Notification.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def mark_notification_as_read(db: AsyncSession, user_id: UUID, notification_id: UUID) -> bool:
        """Mark a notification as read. Upserts so broadcast notis (no UserNotification row) are handled."""
        now = datetime.now(timezone.utc)
        stmt = pg_insert(UserNotification).values(
            user_id=user_id,
            notification_id=notification_id,
            status="read",
            viewed_at=now,
        ).on_conflict_do_update(
            index_elements=["user_id", "notification_id"],
            set_={"status": "read", "viewed_at": now},
        )
        await db.execute(stmt)
        await db.commit()
        return True

    @staticmethod
    async def archive_notification(db: AsyncSession, user_id: UUID, notification_id: UUID) -> bool:
        """Archive a notification. Upserts so broadcast notis (no UserNotification row) are handled."""
        stmt = pg_insert(UserNotification).values(
            user_id=user_id,
            notification_id=notification_id,
            status="archived",
        ).on_conflict_do_update(
            index_elements=["user_id", "notification_id"],
            set_={"status": "archived"},
        )
        await db.execute(stmt)
        await db.commit()
        return True