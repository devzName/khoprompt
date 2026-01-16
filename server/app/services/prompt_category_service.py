from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prompt_category_repo import PromptCategoryRepository
from app.schemas.prompt_category import PromptCategoryCreate, PromptCategoryUpdate
from app.utils.slug import slugify, generate_unique_slug


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

    @staticmethod
    async def create_category(session: AsyncSession, category_data: PromptCategoryCreate) -> dict:
        data = category_data.model_dump()
        
        if not data.get('slug'):
            base_slug = slugify(data['name'])
            data['slug'] = await generate_unique_slug(
                base_slug,
                lambda s: PromptCategoryRepository.slug_exists(session, s)
            )
        else:
            if await PromptCategoryRepository.slug_exists(session, data['slug']):
                raise ValueError(f"Slug '{data['slug']}' already exists")
        
        category = await PromptCategoryRepository.create(session, data)
        return {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "description_vi": category.description_vi,
            "display_order": category.display_order
        }

    @staticmethod
    async def update_category(session: AsyncSession, category_id: int, category_data: PromptCategoryUpdate) -> dict | None:
        category = await PromptCategoryRepository.get_by_id(session, category_id)
        if not category:
            return None
        
        data = category_data.model_dump(exclude_unset=True)
        
        if 'name' in data and 'slug' not in data:
            base_slug = slugify(data['name'])
            data['slug'] = await generate_unique_slug(
                base_slug,
                lambda s: PromptCategoryRepository.slug_exists(session, s, exclude_id=category_id)
            )
        elif 'slug' in data and data['slug']:
            if await PromptCategoryRepository.slug_exists(session, data['slug'], exclude_id=category_id):
                raise ValueError(f"Slug '{data['slug']}' already exists")
        
        updated_category = await PromptCategoryRepository.update(session, category, data)
        
        return {
            "id": updated_category.id,
            "name": updated_category.name,
            "slug": updated_category.slug,
            "description": updated_category.description,
            "description_vi": updated_category.description_vi,
            "display_order": updated_category.display_order
        }

    @staticmethod
    async def delete_category(session: AsyncSession, category_id: int) -> bool:
        category = await PromptCategoryRepository.get_by_id(session, category_id)
        if not category:
            return False
        
        await PromptCategoryRepository.delete(session, category)
        return True
