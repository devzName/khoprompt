from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_category import PromptCategory
from app.schemas.prompt_category import PromptCategoryCreate, PromptCategoryUpdate


class PromptCategoryRepository:
    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptCategory]:
        result = await session.execute(select(PromptCategory).order_by(PromptCategory.name))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, category_id: int) -> PromptCategory | None:
        result = await session.execute(
            select(PromptCategory).where(PromptCategory.id == category_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(session: AsyncSession, slug: str) -> PromptCategory | None:
        result = await session.execute(
            select(PromptCategory).where(PromptCategory.slug == slug)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(session: AsyncSession, data: PromptCategoryCreate) -> PromptCategory:
        category = PromptCategory(**data.model_dump())
        session.add(category)
        await session.flush()
        return category

    @staticmethod
    async def update(
        session: AsyncSession, category: PromptCategory, data: PromptCategoryUpdate
    ) -> PromptCategory:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        await session.flush()
        return category

    @staticmethod
    async def delete(session: AsyncSession, category: PromptCategory) -> None:
        await session.delete(category)
        await session.flush()
