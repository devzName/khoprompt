from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prompt_tag_repo import PromptTagRepository
from app.schemas.prompt_tag import PromptTagCreate, PromptTagUpdate


class PromptTagService:

    @staticmethod
    async def get_all_tags(session: AsyncSession) -> list:
        tags = await PromptTagRepository.get_all(session)
        return [{"id": tag.id, "name": tag.name, "category_id": tag.category_id} for tag in tags]

    @staticmethod
    async def create_tag(session: AsyncSession, tag_data: PromptTagCreate) -> dict:
        # Check if category is 'other'
        from app.repositories.prompt_category_repo import PromptCategoryRepository
        category = await PromptCategoryRepository.get_by_id(session, tag_data.category_id)
        
        if category and category.slug == 'other':
            raise ValueError("Cannot create tags for 'other' category. It is a system category without tags.")
        
        tag = await PromptTagRepository.create(session, tag_data.model_dump())
        
        # Sync with Elasticsearch
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.index_tag(tag))
        except Exception as e:
            print(f"Failed to index tag {tag.id} in Elasticsearch: {e}")
        
        return {
            "id": tag.id,
            "name": tag.name,
            "category_id": tag.category_id
        }

    @staticmethod
    async def update_tag(session: AsyncSession, tag_id: int, tag_data: PromptTagUpdate) -> dict | None:
        tag = await PromptTagRepository.get_by_id(session, tag_id)
        if not tag:
            return None
        
        # Check if trying to move tag to 'other' category
        if tag_data.category_id:
            from app.repositories.prompt_category_repo import PromptCategoryRepository
            category = await PromptCategoryRepository.get_by_id(session, tag_data.category_id)
            
            if category and category.slug == 'other':
                raise ValueError("Cannot move tags to 'other' category. It is a system category without tags.")
        
        updated_tag = await PromptTagRepository.update(
            session, 
            tag, 
            tag_data.model_dump(exclude_unset=True)
        )
        
        # Sync with Elasticsearch
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.index_tag(updated_tag))
        except Exception as e:
            print(f"Failed to update tag {updated_tag.id} in Elasticsearch: {e}")
        
        return {
            "id": updated_tag.id,
            "name": updated_tag.name,
            "category_id": updated_tag.category_id
        }

    @staticmethod
    async def delete_tag(session: AsyncSession, tag_id: int) -> dict:
        """
        Delete a tag and remove it from all prompts that use it.
        
        Args:
            session: Database session
            tag_id: ID of tag to delete
        
        Returns:
            dict with success status and info about affected prompts
        """
        tag = await PromptTagRepository.get_by_id(session, tag_id)
        if not tag:
            return {"success": False, "message": "Tag not found"}
        
        # Check if tag is being used by any prompts
        prompt_count = await PromptTagRepository.count_prompts_using_tag(session, tag_id)
        
        # Remove from Elasticsearch first
        try:
            import asyncio
            from app.services.elasticsearch_service import elasticsearch_service
            asyncio.create_task(elasticsearch_service.delete_tag(tag_id))
        except Exception as e:
            print(f"Failed to delete tag {tag_id} from Elasticsearch: {e}")
        
        if prompt_count > 0:
            # Get affected prompts before removing tag (for reindexing)
            affected_prompts = await PromptTagRepository.get_prompts_by_tag_removal(session, tag_id)
            
            # Remove tag from all prompts first
            removed_count = await PromptTagRepository.remove_tag_from_all_prompts(session, tag_id)
            await PromptTagRepository.delete(session, tag)
            
            # Reindex affected prompts to update their tag_ids and tag_names
            try:
                import asyncio
                from app.services.elasticsearch_service import elasticsearch_service
                for prompt in affected_prompts:
                    if prompt.status == 'approved':  # Only reindex approved prompts
                        fresh_prompt = await PromptTagRepository.get_prompt_with_relations(session, prompt.id)
                        if fresh_prompt:
                            asyncio.create_task(elasticsearch_service.index_prompt(fresh_prompt))
            except Exception as e:
                print(f"Failed to reindex affected prompts after tag deletion: {e}")
            
            return {
                "success": True,
                "message": f"Tag deleted successfully. Removed from {removed_count} prompt(s).",
                "prompts_affected": removed_count
            }
        else:
            # No prompts using this tag, safe to delete
            await PromptTagRepository.delete(session, tag)
            return {
                "success": True,
                "message": "Tag deleted successfully",
                "prompts_affected": 0
            }