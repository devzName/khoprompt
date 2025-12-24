from __future__ import annotations

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationOut

class NotificationService:
    @staticmethod
    async def notify_prompt_approved(session: AsyncSession, user_id: UUID, prompt_title: str, prompt_id: int):
        data = NotificationCreate(
            user_id=user_id,
            title="Prompt Approved",
            message=f"Your prompt '{prompt_title}' has been approved!",
            type="success",
            link=f"/prompt/{prompt_id}"
        )
        await NotificationRepository.create(session, data)

    @staticmethod
    async def notify_prompt_rejected(session: AsyncSession, user_id: UUID, prompt_title: str):
        data = NotificationCreate(
            user_id=user_id,
            title="Prompt Rejected",
            message=f"Your prompt '{prompt_title}' has been rejected. Please review and update it.",
            type="error",
            link="/my-prompts"
        )
        await NotificationRepository.create(session, data)

    @staticmethod
    async def list_notifications(
        session: AsyncSession, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[NotificationOut]:
        items = await NotificationRepository.list_for_user(session, user_id, limit, offset)
        return [NotificationOut.model_validate(item) for item in items]

    @staticmethod
    async def get_unread_count(session: AsyncSession, user_id: UUID) -> int:
        return await NotificationRepository.count_unread(session, user_id)

    @staticmethod
    async def mark_read(session: AsyncSession, notification_id: UUID, user_id: UUID) -> bool:
        success = await NotificationRepository.mark_as_read(session, notification_id, user_id)
        if success:
            await session.commit()
        return success

    @staticmethod
    async def mark_all_read(session: AsyncSession, user_id: UUID) -> int:
        count = await NotificationRepository.mark_all_as_read(session, user_id)
        if count > 0:
            await session.commit()
        return count
