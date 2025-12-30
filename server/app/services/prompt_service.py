from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import math

from app.repositories.prompt_repo import PromptRepository
from app.schemas.prompt import PromptCreate, PromptUpdate
from app.schemas.pagination import PaginatedResponse, PaginationMeta
from app.constants.prompt_status import PromptStatus


class PromptService:

    @staticmethod
    async def create_prompt(session: AsyncSession, prompt_data: PromptCreate, user_id: UUID, user_type: str = None) -> dict:
        prompt = await PromptRepository.create(
            session, 
            prompt_data.model_dump(), 
            user_id
        )
        
        if user_type == 'admin':
            prompt = await PromptRepository.update(
                session,
                prompt,
                {"status": PromptStatus.APPROVED}
            )
        
        return {
            "id": prompt.id,
            "title": prompt.title,
            "slug": prompt.slug,
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
            "slug": prompt.slug,
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
                "email": prompt.user.email,
                "avatar_url": prompt.user.avatar_url
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
    async def get_prompt_by_slug(session: AsyncSession, slug: str) -> dict | None:
        prompt = await PromptRepository.get_by_slug(session, slug)
        if not prompt:
            return None
            
        return {
            "id": prompt.id,
            "title": prompt.title,
            "slug": prompt.slug,
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
                "email": prompt.user.email,
                "avatar_url": prompt.user.avatar_url
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
                "slug": prompt.slug,
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
    async def get_approved_prompts_paginated(session: AsyncSession, category_id: int | None = None, search: str | None = None, page: int = 1, limit: int = 9) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_approved_prompts_count(session, category_id, search)
        
        # Get paginated data
        prompts = await PromptRepository.get_approved_prompts(session, category_id, search, page, limit)
        
        # Calculate pagination metadata
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
        has_next = page < total_pages
        has_prev = page > 1
        
        # Format prompts data
        prompts_data = [
            {
                "id": prompt.id,
                "title": prompt.title,
                "slug": prompt.slug,
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
                    "email": prompt.user.email,
                    "avatar_url": prompt.user.avatar_url
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
        
        return PaginatedResponse(
            data=prompts_data,
            pagination=PaginationMeta(
                current_page=page,
                per_page=limit,
                total=total_count,
                total_pages=total_pages,
                has_next=has_next,
                has_prev=has_prev
            )
        )

    @staticmethod
    async def get_featured_prompts(session: AsyncSession, limit: int = 6, category_id: int | None = None) -> list[dict]:
        """Get featured prompts based on engagement metrics"""
        prompts = await PromptRepository.get_featured_prompts(session, limit, category_id)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "slug": prompt.slug,
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
                    "email": prompt.user.email,
                    "avatar_url": prompt.user.avatar_url
                } if prompt.user else None,
                "category": {
                    "id": prompt.category.id,
                    "name": prompt.category.name,
                    "slug": prompt.category.slug
                } if prompt.category else None,
                "tags": [
                    {"id": tag.id, "name": tag.name} 
                    for tag in prompt.tags
                ],
                "rating": round((prompt.like_count * 2 + prompt.view_count * 0.1) / max(1, prompt.like_count + prompt.dislike_count + 1), 1),
                "author": prompt.user.full_name if prompt.user else "Unknown"
            }
            for prompt in prompts
        ]

    @staticmethod
    async def get_user_prompts_with_details_paginated(session: AsyncSession, user_id: UUID, page: int = 1, limit: int = 9) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_user_prompts_count(session, user_id)
        
        # Get paginated data
        prompts = await PromptRepository.get_user_prompts_paginated(session, user_id, page, limit)
        
        # Calculate pagination metadata
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
        has_next = page < total_pages
        has_prev = page > 1
        
        # Format prompts data
        prompts_data = [
            {
                "id": prompt.id,
                "title": prompt.title,
                "slug": prompt.slug,
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
                    "email": prompt.user.email,
                    "avatar_url": prompt.user.avatar_url,
                    "user_type": prompt.user.user_type
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
        
        return PaginatedResponse(
            data=prompts_data,
            pagination=PaginationMeta(
                current_page=page,
                per_page=limit,
                total=total_count,
                total_pages=total_pages,
                has_next=has_next,
                has_prev=has_prev
            )
        )
        prompts = await PromptRepository.get_by_user(session, user_id)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "slug": prompt.slug,
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
                    "email": prompt.user.email,
                    "avatar_url": prompt.user.avatar_url,
                    "user_type": prompt.user.user_type
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
    async def get_pending_prompts(session: AsyncSession, limit: int = 100) -> list[dict]:
        prompts = await PromptRepository.get_pending_prompts(session, limit)
        
        return [
            {
                "id": prompt.id,
                "title": prompt.title,
                "slug": prompt.slug,
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
                    "email": prompt.user.email,
                    "avatar_url": prompt.user.avatar_url
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
    async def update_prompt(session: AsyncSession, prompt_id: int, prompt_data: PromptUpdate, user_id: UUID, user_type: str = None) -> dict | None:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt or prompt.user_id != user_id:
            return None
            
        if prompt.status not in [PromptStatus.DRAFT, PromptStatus.APPROVED]:
            return None
        
        update_data = prompt_data.model_dump(exclude_unset=True)
        
        # If updating an approved prompt, change status to PENDING unless user is admin
        if prompt.status == PromptStatus.APPROVED and user_type != 'admin':
            update_data["status"] = PromptStatus.PENDING
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            update_data
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
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
            
        if prompt.status != PromptStatus.DRAFT:
            return None
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            {"status": PromptStatus.PENDING}
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
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
            
        await PromptRepository.delete(session, prompt)
        return True

    @staticmethod
    async def approve_prompt(session: AsyncSession, prompt_id: int, admin_user_id: UUID) -> dict | None:
        """Approve a prompt (admin only)"""
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            return None
            
        if prompt.status != PromptStatus.PENDING:
            return None
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            {"status": PromptStatus.APPROVED}
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
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
    async def reject_prompt(session: AsyncSession, prompt_id: int, admin_user_id: UUID) -> dict | None:
        """Reject a prompt (admin only)"""
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            return None
            
        if prompt.status != PromptStatus.PENDING:
            return None
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            {"status": PromptStatus.REJECTED}
        )
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
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