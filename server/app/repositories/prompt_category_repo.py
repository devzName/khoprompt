from sqlalchemy import select, func, case
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
            .order_by(
                case((PromptCategory.slug == 'other', 1), else_=0),
                PromptCategory.display_order.nulls_last(),
                PromptCategory.name
            )
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
            .order_by(
                case((PromptCategory.slug == 'other', 1), else_=0),
                PromptCategory.display_order.nulls_last(),
                PromptCategory.name
            )
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_categories_with_tags(session: AsyncSession) -> list[PromptCategory]:
        stmt = (
            select(PromptCategory)
            .options(selectinload(PromptCategory.tags))
            .order_by(
                case((PromptCategory.slug == 'other', 1), else_=0),
                PromptCategory.display_order.nulls_last(),
                PromptCategory.name
            )
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_tag_prompt_counts(session: AsyncSession) -> dict[int, int]:
        """Get count of approved prompts for each tag"""
        from app.models.prompt import prompt_tags_association
        from app.models.prompt_tag import PromptTag
        
        stmt = (
            select(
                prompt_tags_association.c.tag_id,
                func.count(prompt_tags_association.c.prompt_id).label('prompt_count')
            )
            .select_from(prompt_tags_association)
            .join(Prompt, prompt_tags_association.c.prompt_id == Prompt.id)
            .where(Prompt.status == PromptStatus.APPROVED)
            .group_by(prompt_tags_association.c.tag_id)
        )
        
        result = await session.execute(stmt)
        rows = result.all()
        
        return {row.tag_id: row.prompt_count for row in rows}

    @staticmethod
    async def get_by_id(session: AsyncSession, category_id: int) -> PromptCategory | None:
        stmt = select(PromptCategory).where(PromptCategory.id == category_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(session: AsyncSession, slug: str) -> PromptCategory | None:
        stmt = select(PromptCategory).where(PromptCategory.slug == slug)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def slug_exists(session: AsyncSession, slug: str, exclude_id: int | None = None) -> bool:
        stmt = select(PromptCategory).where(PromptCategory.slug == slug)
        if exclude_id:
            stmt = stmt.where(PromptCategory.id != exclude_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def create(session: AsyncSession, category_data: dict) -> PromptCategory:
        category = PromptCategory(**category_data)
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category

    @staticmethod
    async def update(session: AsyncSession, category: PromptCategory, update_data: dict) -> PromptCategory:
        for key, value in update_data.items():
            setattr(category, key, value)
        await session.commit()
        await session.refresh(category)
        return category

    @staticmethod
    async def delete(session: AsyncSession, category: PromptCategory) -> None:
        await session.delete(category)
        await session.commit()
