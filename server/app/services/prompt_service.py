from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.repositories.prompt_repo import PromptRepository
from app.schemas.prompt import PromptCreate, PromptUpdate
from app.constants.prompt_status import PromptStatus


class PromptService:

    @staticmethod
    async def create_prompt(session: AsyncSession, prompt_data: PromptCreate, user_id: UUID) -> dict:
        prompt = await PromptRepository.create(
            session, 
            prompt_data.model_dump(), 
            user_id
        )
        
        return {
            "id": prompt.id,
            "title": prompt.title,
            "description": prompt.description,
            "content": prompt.content,
            "full_description": prompt.full_description,
            "status": prompt.status,
            "category_id": prompt.category_id,
            "user_id": str(prompt.user_id),
            "view_count": prompt.view_count,
            "like_count": prompt.like_count,
            "dislike_count": prompt.dislike_count,
            "created_at": prompt.created_at,
            "updated_at": prompt.updated_at
        }

    @staticmethod
    async def get_prompt_by_id(session: AsyncSession, prompt_id: int) -> dict | None:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            return None
            
        return {
            "id": prompt.id,
            "title": prompt.title,
            "description": prompt.description,
            "content": prompt.content,
            "full_description": prompt.full_description,
            "status": prompt.status,
            "category_id": prompt.category_id,
            "user_id": str(prompt.user_id),
            "view_count": prompt.view_count,
            "like_count": prompt.like_count,
            "dislike_count": prompt.dislike_count,
            "created_at": prompt.created_at,
            "updated_at": prompt.updated_at,
            "user": {
                "id": str(prompt.user.id),
                "full_name": prompt.user.full_name,
                "email": prompt.user.email
            } if prompt.user else None,
            "category": {
                "id": prompt.category.id,
                "name": prompt.category.name,
                "slug": prompt.category.slug
            } if prompt.category else None,
            "tags": [
                {"id": tag.id, "name": tag.name} 
                for tag in prompt.tags
            ]
        }

    @staticmethod
    async def get_user_prompts(session: AsyncSession, user_id: UUID, limit: int = 100) -> list[dict]:
        prompts = await PromptRepository.get_by_user(session, user_id, limit)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "content": prompt.content,
                "full_description": prompt.full_description,
                "status": prompt.status,
                "category_id": prompt.category_id,
                "user_id": str(prompt.user_id),
                "view_count": prompt.view_count,
                "like_count": prompt.like_count,
                "dislike_count": prompt.dislike_count,
                "created_at": prompt.created_at,
                "updated_at": prompt.updated_at
            }
            for prompt in prompts
        ]

    @staticmethod
    async def get_approved_prompts(session: AsyncSession) -> list[dict]:
        prompts = await PromptRepository.get_approved_prompts(session)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "content": prompt.content,
                "full_description": prompt.full_description,
                "status": prompt.status,
                "category_id": prompt.category_id,
                "user_id": str(prompt.user_id),
                "view_count": prompt.view_count,
                "like_count": prompt.like_count,
                "dislike_count": prompt.dislike_count,
                "created_at": prompt.created_at,
                "updated_at": prompt.updated_at,
                "user": {
                    "id": str(prompt.user.id),
                    "full_name": prompt.user.full_name,
                    "email": prompt.user.email
                } if prompt.user else None,
                "category": {
                    "id": prompt.category.id,
                    "name": prompt.category.name,
                    "slug": prompt.category.slug
                } if prompt.category else None,
                "tags": [
                    {"id": tag.id, "name": tag.name} 
                    for tag in prompt.tags
                ]
            }
            for prompt in prompts
        ]

    @staticmethod
    async def get_user_prompts_with_details(session: AsyncSession, user_id: UUID) -> list[dict]:
        prompts = await PromptRepository.get_by_user(session, user_id)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "content": prompt.content,
                "full_description": prompt.full_description,
                "status": prompt.status,
                "category_id": prompt.category_id,
                "user_id": str(prompt.user_id),
                "view_count": prompt.view_count,
                "like_count": prompt.like_count,
                "dislike_count": prompt.dislike_count,
                "created_at": prompt.created_at,
                "updated_at": prompt.updated_at,
                "user": None,
                "category": {
                    "id": prompt.category.id,
                    "name": prompt.category.name,
                    "slug": prompt.category.slug
                } if prompt.category else None,
                "tags": [
                    {"id": tag.id, "name": tag.name} 
                    for tag in prompt.tags
                ]
            }
            for prompt in prompts
        ]

    @staticmethod
    async def update_prompt(session: AsyncSession, prompt_id: int, prompt_data: PromptUpdate, user_id: UUID) -> dict | None:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt or prompt.user_id != user_id:
            return None
            
        # Allow updating draft prompts and approved prompts
        # If approved prompt is updated, change status to PENDING for re-review
        if prompt.status not in [PromptStatus.DRAFT, PromptStatus.APPROVED]:
            return None
        
        # Prepare update data
        update_data = prompt_data.model_dump(exclude_unset=True)
        
        # If updating an approved prompt, change status to PENDING
        if prompt.status == PromptStatus.APPROVED:
            update_data["status"] = PromptStatus.PENDING
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            update_data
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "description": updated_prompt.description,
            "content": updated_prompt.content,
            "full_description": updated_prompt.full_description,
            "status": updated_prompt.status,
            "category_id": updated_prompt.category_id,
            "user_id": str(updated_prompt.user_id),
            "view_count": updated_prompt.view_count,
            "like_count": updated_prompt.like_count,
            "dislike_count": updated_prompt.dislike_count,
            "created_at": updated_prompt.created_at,
            "updated_at": updated_prompt.updated_at
        }

    @staticmethod
    async def submit_prompt_for_review(session: AsyncSession, prompt_id: int, user_id: UUID) -> dict | None:
        """Submit a draft prompt for review (change status from DRAFT to PENDING)"""
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt or prompt.user_id != user_id:
            return None
            
        # Only allow submitting draft prompts
        if prompt.status != PromptStatus.DRAFT:
            return None
            
        # Update status to PENDING
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            {"status": PromptStatus.PENDING}
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "description": updated_prompt.description,
            "content": updated_prompt.content,
            "full_description": updated_prompt.full_description,
            "status": updated_prompt.status,
            "category_id": updated_prompt.category_id,
            "user_id": str(updated_prompt.user_id),
            "view_count": updated_prompt.view_count,
            "like_count": updated_prompt.like_count,
            "dislike_count": updated_prompt.dislike_count,
            "created_at": updated_prompt.created_at,
            "updated_at": updated_prompt.updated_at
        }

    @staticmethod
    async def delete_prompt(session: AsyncSession, prompt_id: int, user_id: UUID) -> bool:
        """Delete a prompt (user can delete their own prompts in any status)"""
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt or prompt.user_id != user_id:
            return False
            
        # Delete the prompt
        await PromptRepository.delete(session, prompt)
        return True