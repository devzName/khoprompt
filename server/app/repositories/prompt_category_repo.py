from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_category import PromptCategory


class PromptCategoryRepository:

    @staticmethod
    async def get_categories_with_counts(session: AsyncSession) -> list[dict]:
        stmt = (
            select(PromptCategory)
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        categories = result.scalars().all()

        return [
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "description": cat.description,
                "description_vi": cat.description_vi,
                "display_order": cat.display_order,
                "prompt_count": 0
            }
            for cat in categories
        ]

    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptCategory]:
        stmt = (
            select(PromptCategory)
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
