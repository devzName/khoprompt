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
        tag_counts = await PromptCategoryRepository.get_tag_prompt_counts(session)
        
        stats_map = {stat['id']: stat['prompt_count'] for stat in stats}
        stats_order = {stat['id']: idx for idx, stat in enumerate(stats)}
        
        categories_with_tags = [
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
                        "count": tag_counts.get(tag.id, 0)
                    }
                    for tag in cat.tags
                ]
            }
            for cat in categories
        ]
        
        categories_with_tags.sort(key=lambda x: stats_order.get(x['id'], 999))
        
        return categories_with_tags

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
        
        # Sync with Elasticsearch
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.index_category(category))
        except Exception as e:
            print(f"Failed to index category {category.id} in Elasticsearch: {e}")
        
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
        
        if category.slug == 'other':
            raise ValueError("Cannot edit 'other' category. It is a system category.")
        
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
        
        # Sync with Elasticsearch
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.index_category(updated_category))
            
            # If category name or slug changed, reindex all prompts in this category
            if 'name' in data or 'slug' in data:
                affected_prompts = await PromptCategoryRepository.get_prompts_in_category(session, category_id)
                for prompt in affected_prompts:
                    if prompt.status == 'approved':  # Only reindex approved prompts
                        fresh_prompt = await PromptCategoryRepository.get_prompt_with_relations(session, prompt.id)
                        if fresh_prompt:
                            asyncio.create_task(elasticsearch_service.index_prompt(fresh_prompt))
        except Exception as e:
            print(f"Failed to update category {updated_category.id} in Elasticsearch: {e}")
        
        return {
            "id": updated_category.id,
            "name": updated_category.name,
            "slug": updated_category.slug,
            "description": updated_category.description,
            "description_vi": updated_category.description_vi,
            "display_order": updated_category.display_order
        }

    @staticmethod
    async def delete_category(session: AsyncSession, category_id: int) -> dict:
        """
        Delete a category and move all its prompts to 'other' category.
        Also removes all tags from the moved prompts.
        
        Returns:
            dict with success status and info about moved prompts
        """
        category = await PromptCategoryRepository.get_by_id(session, category_id)
        if not category:
            return {"success": False, "message": "Category not found"}
        
        # Prevent deleting 'other' category
        if category.slug == 'other':
            raise ValueError("Cannot delete 'other' category. It is a system category.")
        
        # Get 'other' category
        other_category = await PromptCategoryRepository.get_other_category(session)
        if not other_category:
            return {"success": False, "message": "'other' category not found. Please create it first."}
        
        # Count prompts in this category
        prompt_count = await PromptCategoryRepository.count_prompts_in_category(session, category_id)
        
        # Remove from Elasticsearch first
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.delete_category(category_id))
        except Exception as e:
            print(f"Failed to delete category {category_id} from Elasticsearch: {e}")
        
        if prompt_count > 0:
            # Get affected prompts before moving them (for reindexing)
            affected_prompts = await PromptCategoryRepository.get_prompts_in_category(session, category_id)
            
            # Move prompts to 'other' category and remove their tags
            moved_count = await PromptCategoryRepository.move_prompts_to_category(
                session, 
                category_id, 
                other_category.id
            )
            
            # Delete the category
            await PromptCategoryRepository.delete(session, category)
            
            # Reindex affected prompts to update their category info
            try:
                import asyncio
                from app.services.elasticsearch_service import elasticsearch_service
                for prompt in affected_prompts:
                    if prompt.status == 'approved':  # Only reindex approved prompts
                        fresh_prompt = await PromptCategoryRepository.get_prompt_with_relations(session, prompt.id)
                        if fresh_prompt:
                            asyncio.create_task(elasticsearch_service.index_prompt(fresh_prompt))
            except Exception as e:
                print(f"Failed to reindex affected prompts after category deletion: {e}")
            
            return {
                "success": True,
                "message": f"Category deleted successfully. {moved_count} prompt(s) moved to 'other' category and their tags removed.",
                "prompts_moved": moved_count
            }
        else:
            # No prompts in this category, safe to delete
            await PromptCategoryRepository.delete(session, category)
            return {
                "success": True,
                "message": "Category deleted successfully",
                "prompts_moved": 0
            }
