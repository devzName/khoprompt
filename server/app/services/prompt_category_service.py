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

    @staticmethod
    async def get_categories_with_tags(session: AsyncSession) -> list[dict]:
        categories = await PromptCategoryRepository.get_categories_with_tags(session)
        stats = await PromptCategoryRepository.get_categories_with_counts(session)
        stats_map = {stat['id']: stat['prompt_count'] for stat in stats}
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "count": stats_map.get(cat.id, 0),
                "tags": [
                    {
                        "id": tag.id,
                        "name": tag.name,
                        "slug": tag.name.lower().replace(' ', '-'),
                        "count": 0
                    }
                    for tag in cat.tags
                ]
            }
            for cat in categories
        ]
