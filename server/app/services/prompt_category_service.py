from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prompt_category_repo import PromptCategoryRepository


class PromptCategoryService:

    @staticmethod
    async def get_categories_with_stats(session: AsyncSession) -> dict:
        categories = await PromptCategoryRepository.get_categories_with_counts(session)
        total_prompts = sum(cat['prompt_count'] for cat in categories)

        return {
            'categories': categories,
            'total_prompts': total_prompts
        }

    @staticmethod
    async def get_all_categories(session: AsyncSession) -> list:
        categories = await PromptCategoryRepository.get_all(session)
        return [{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in categories]
