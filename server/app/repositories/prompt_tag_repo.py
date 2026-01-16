from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_tag import PromptTag


class PromptTagRepository:

    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptTag]:
        stmt = select(PromptTag).order_by(PromptTag.name)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(session: AsyncSession, tag_id: int) -> PromptTag | None:
        stmt = select(PromptTag).where(PromptTag.id == tag_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(session: AsyncSession, tag_data: dict) -> PromptTag:
        tag = PromptTag(**tag_data)
        session.add(tag)
        await session.commit()
        await session.refresh(tag)
        return tag

    @staticmethod
    async def update(session: AsyncSession, tag: PromptTag, update_data: dict) -> PromptTag:
        for key, value in update_data.items():
            setattr(tag, key, value)
        await session.commit()
        await session.refresh(tag)
        return tag

    @staticmethod
    async def delete(session: AsyncSession, tag: PromptTag) -> None:
        await session.delete(tag)
        await session.commit()