from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.prompt_category import PromptCategory
from app.models.prompt import Prompt
from app.constants.prompt_status import PromptStatus


class PromptCategoryRepository:

    @staticmethod
    async def get_categories_with_counts(session: AsyncSession) -> list[dict]:
        stmt = (
            select(
                PromptCategory.id,
                PromptCategory.name,
                PromptCategory.slug,
                PromptCategory.description,
                PromptCategory.description_vi,
                PromptCategory.display_order,
                func.count(Prompt.id).label('prompt_count')
            )
            .outerjoin(Prompt, (PromptCategory.id == Prompt.category_id) & (Prompt.status == PromptStatus.APPROVED))
            .group_by(
                PromptCategory.id,
                PromptCategory.name,
                PromptCategory.slug,
                PromptCategory.description,
                PromptCategory.description_vi,
                PromptCategory.display_order
            )
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "name": row.name,
                "slug": row.slug,
                "description": row.description,
                "description_vi": row.description_vi,
                "display_order": row.display_order,
                "prompt_count": row.prompt_count
            }
            for row in rows
        ]

    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptCategory]:
        stmt = (
            select(PromptCategory)
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_categories_with_tags(session: AsyncSession) -> list[PromptCategory]:
        stmt = (
            select(PromptCategory)
            .options(selectinload(PromptCategory.tags))
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
