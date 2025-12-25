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
