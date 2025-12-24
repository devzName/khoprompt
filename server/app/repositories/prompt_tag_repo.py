from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_tag import PromptTag
from app.schemas.prompt_tag import PromptTagCreate, PromptTagUpdate

class PromptTagRepository:
    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptTag]:
        result = await session.execute(select(PromptTag).order_by(PromptTag.name))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, tag_id: int) -> PromptTag | None:
        return await session.get(PromptTag, tag_id)

    @staticmethod
    async def get_by_slug(session: AsyncSession, slug: str) -> PromptTag | None:
        result = await session.execute(select(PromptTag).where(PromptTag.slug == slug))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_name(session: AsyncSession, name: str) -> PromptTag | None:
        result = await session.execute(select(PromptTag).where(PromptTag.name == name))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(session: AsyncSession, data: PromptTagCreate) -> PromptTag:
        tag = PromptTag(**data.model_dump())
        session.add(tag)
        await session.flush()
        return tag

    @staticmethod
    async def update(session: AsyncSession, tag: PromptTag, data: PromptTagUpdate) -> PromptTag:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tag, key, value)
        await session.flush()
        return tag

    @staticmethod
    async def delete(session: AsyncSession, tag: PromptTag) -> None:
        await session.delete(tag)
        await session.flush()
