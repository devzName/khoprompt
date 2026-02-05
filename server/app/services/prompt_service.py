from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
import math

from app.repositories.prompt_repo import PromptRepository
from app.models.prompt_view import PromptView
from app.schemas.prompt import PromptCreate, PromptUpdate
from app.schemas.pagination import PaginatedResponse, PaginationMeta
from app.constants.prompt_status import PromptStatus
from app.core.rate_limiter import ViewRateLimiter


class PromptService:

    @staticmethod
    def _calculate_simple_rating(prompt) -> float | None:
        """Calculate simple rating (1-5 stars based on like ratio)"""
        like_count = prompt.like_count or 0
        dislike_count = prompt.dislike_count or 0
        total_votes = like_count + dislike_count
        
        if total_votes == 0:
            return None
        
        like_ratio = like_count / total_votes
        return round(1 + (like_ratio * 4), 1)  # Convert [0,1] to [1,5]

    @staticmethod
    def _calculate_engagement_rating(prompt) -> float:
        """Calculate engagement rating (original algorithm)"""
        return round((prompt.like_count * 2 + prompt.view_count * 0.1) / max(1, prompt.like_count + prompt.dislike_count + 1), 1)

    @staticmethod
    async def create_prompt(session: AsyncSession, prompt_data: PromptCreate, user_id: UUID, user_type: str = None, images: list[str] = None) -> dict:
        # Add images to prompt data
        prompt_dict = prompt_data.model_dump()
        if images:
            prompt_dict['images'] = images
        
        prompt = await PromptRepository.create(
            session, 
            prompt_dict, 
            user_id
        )
        
        if user_type == 'admin':
            prompt = await PromptRepository.update(
                session,
                prompt,
                {"status": PromptStatus.APPROVED}
            )
            
        # Index in Elasticsearch if approved
        try:
            from app.services.search_service import SearchService
            import asyncio
            # Reload prompt with relationships to avoid greenlet issues
            fresh_prompt = await PromptRepository.get_by_id(session, prompt.id)
            if fresh_prompt:
                # Use create_task to ensure proper async context
                asyncio.create_task(SearchService.index_prompt(fresh_prompt))
        except Exception as e:
            print(f"Failed to index prompt {prompt.id} in Elasticsearch: {e}")
        
        return {
            "id": prompt.id,
            "title": prompt.title,
            "slug": prompt.slug,
            "description": prompt.description,
            "content": prompt.content,
            "notes": prompt.notes,
            "images": prompt.images,
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
            "notes": prompt.notes,
            "images": prompt.images,
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
            "rating": PromptService._calculate_engagement_rating(prompt),
            "simple_rating": PromptService._calculate_simple_rating(prompt),
            "author": prompt.user.full_name if prompt.user else "Unknown"
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
            "notes": prompt.notes,
            "images": prompt.images,
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
            "rating": PromptService._calculate_engagement_rating(prompt),
            "simple_rating": PromptService._calculate_simple_rating(prompt),
            "author": prompt.user.full_name if prompt.user else "Unknown"
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
                "notes": prompt.notes,
                "images": prompt.images,
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
    async def get_approved_prompts_paginated(session: AsyncSession, category_id: int | None = None, search: str | None = None, tag: str | None = None, tag_id: int | None = None, page: int = 1, limit: int = 9) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_approved_prompts_count(session, category_id, search, tag, tag_id)
        
        # Get paginated data
        prompts = await PromptRepository.get_approved_prompts(session, category_id, search, tag, tag_id, page, limit)
        
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
                "notes": prompt.notes,
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
    async def get_featured_prompts(session: AsyncSession, limit: int = 6, category_id: int | None = None, tag_id: int | None = None) -> list[dict]:
        """Get featured prompts based on engagement metrics, sorted by rating (5-star first)"""
        prompts = await PromptRepository.get_featured_prompts(session, limit, category_id, tag_id)
        
        # Calculate rating and sort by rating descending
        prompts_with_rating = []
        for prompt in prompts:
            # Calculate simple rating (1-5 stars based on like ratio)
            like_count = prompt.like_count or 0
            dislike_count = prompt.dislike_count or 0
            total_votes = like_count + dislike_count
            
            if total_votes > 0:
                like_ratio = like_count / total_votes
                simple_rating = 1 + (like_ratio * 4)  # Convert [0,1] to [1,5]
            else:
                simple_rating = 0  # No votes = lowest priority
            
            prompts_with_rating.append({
                "prompt": prompt,
                "simple_rating": simple_rating,
                "engagement_rating": round((prompt.like_count * 2 + prompt.view_count * 0.1) / max(1, prompt.like_count + prompt.dislike_count + 1), 1)
            })
        
        # Sort by simple_rating descending (5.0, 4.9, 4.8, ...), then by engagement as tiebreaker
        prompts_with_rating.sort(key=lambda x: (x["simple_rating"], x["engagement_rating"]), reverse=True)
        
        return [
            {
                "id": item["prompt"].id,
                "title": item["prompt"].title,
                "slug": item["prompt"].slug,
                "description": item["prompt"].description,
                "content": item["prompt"].content,
                "notes": item["prompt"].notes,
                "images": item["prompt"].images,
                "status": item["prompt"].status,
                "category_id": item["prompt"].category_id,
                "user_id": str(item["prompt"].user_id),
                "view_count": item["prompt"].view_count,
                "like_count": item["prompt"].like_count,
                "dislike_count": item["prompt"].dislike_count,
                "created_at": item["prompt"].created_at,
                "updated_at": item["prompt"].updated_at,
                "user": {
                    "id": str(item["prompt"].user.id),
                    "full_name": item["prompt"].user.full_name,
                    "email": item["prompt"].user.email,
                    "avatar_url": item["prompt"].user.avatar_url
                } if item["prompt"].user else None,
                "category": {
                    "id": item["prompt"].category.id,
                    "name": item["prompt"].category.name,
                    "slug": item["prompt"].category.slug
                } if item["prompt"].category else None,
                "tags": [
                    {"id": tag.id, "name": tag.name} 
                    for tag in item["prompt"].tags
                ],
                "rating": item["engagement_rating"],  # Keep original engagement rating for compatibility
                "simple_rating": round(item["simple_rating"], 1),  # Add simple rating for client
                "author": item["prompt"].user.full_name if item["prompt"].user else "Unknown"
            }
            for item in prompts_with_rating
        ]

    @staticmethod
    async def get_user_prompts_with_details_paginated(
        session: AsyncSession, 
        user_id: UUID, 
        page: int = 1, 
        limit: int = 9, 
        search: str | None = None,
        category: str | None = None,
        status: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc"
    ) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_user_prompts_count(session, user_id, search, category, status)
        
        # Get paginated data
        prompts = await PromptRepository.get_user_prompts_paginated(
            session, user_id, page, limit, search, category, status, sort_by, sort_order
        )
        
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
                "notes": prompt.notes,
                "images": prompt.images,
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

    @staticmethod
    async def get_pending_prompts_paginated(session: AsyncSession, page: int = 1, limit: int = 12, search: str | None = None) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_pending_prompts_count(session, search)
        
        # Get paginated data
        prompts = await PromptRepository.get_pending_prompts_paginated(session, page, limit, search)
        
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
                "notes": prompt.notes,
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
    async def get_all_prompts_paginated(
        session: AsyncSession,
        page: int = 1,
        limit: int = 25,
        search: str | None = None,
        category: str | None = None,
        status: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc"
    ) -> PaginatedResponse:
        # Get total count
        total_count = await PromptRepository.get_all_prompts_count(session, search, category, status)
        
        # Get paginated data
        prompts = await PromptRepository.get_all_prompts_paginated(
            session, page, limit, search, category, status, sort_by, sort_order
        )
        
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
                "notes": prompt.notes,
                "images": prompt.images,
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

    @staticmethod
    async def update_prompt(session: AsyncSession, prompt_id: int, prompt_data: PromptUpdate, user_id: UUID, user_type: str = None, existing_images_to_keep: list = None, new_images: list = None) -> dict | None:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            return None
        
        if prompt.user_id != user_id and user_type != 'admin':
            return None
            
        if prompt.status not in [PromptStatus.DRAFT, PromptStatus.APPROVED]:
            return None
        
        update_data = prompt_data.model_dump(exclude_unset=True)
        
        if existing_images_to_keep is not None or new_images is not None:
            current_images = prompt.images or []
            
            kept_images = existing_images_to_keep or []
            
            uploaded_images = new_images or []
            
            final_images = kept_images + uploaded_images
            
            images_to_delete = [img for img in current_images if img not in kept_images]
            
            from pathlib import Path
            for img_path in images_to_delete:
                try:
                    full_path = Path(img_path)
                    if full_path.exists():
                        full_path.unlink()
                        print(f"Deleted unused image: {img_path}")
                except Exception as e:
                    print(f"Error deleting image {img_path}: {e}")
            
            update_data["images"] = final_images if final_images else None
        
        if prompt.status == PromptStatus.APPROVED and user_type != 'admin':
            update_data["status"] = PromptStatus.PENDING
            
        updated_prompt = await PromptRepository.update(
            session, 
            prompt, 
            update_data
        )
        
        # Sync with Elasticsearch based on status
        try:
            from app.services.search_service import SearchService
            import asyncio
            if updated_prompt.status == PromptStatus.APPROVED:
                # Reload prompt with relationships to avoid greenlet issues
                fresh_prompt = await PromptRepository.get_by_id(session, updated_prompt.id)
                if fresh_prompt:
                    # Use create_task to ensure proper async context
                    asyncio.create_task(SearchService.index_prompt(fresh_prompt))
            else:
                # Remove from Elasticsearch if no longer approved
                asyncio.create_task(SearchService.delete_prompt_from_index(updated_prompt.id))
        except Exception as e:
            print(f"Failed to sync prompt {updated_prompt.id} with Elasticsearch: {e}")
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
            "description": updated_prompt.description,
            "content": updated_prompt.content,
            "notes": updated_prompt.notes,
            "images": updated_prompt.images,
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
            "notes": updated_prompt.notes,
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
        
        # Remove from Elasticsearch if it was approved
        if prompt.status == PromptStatus.APPROVED:
            try:
                from app.services.search_service import SearchService
                import asyncio
                # Use create_task to ensure proper async context
                asyncio.create_task(SearchService.delete_prompt_from_index(prompt_id))
            except Exception as e:
                print(f"Failed to delete prompt {prompt_id} from Elasticsearch: {e}")
            
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
        
        # Index in Elasticsearch when approved
        try:
            from app.services.search_service import SearchService
            import asyncio
            # Reload prompt with relationships to avoid greenlet issues
            fresh_prompt = await PromptRepository.get_by_id(session, updated_prompt.id)
            if fresh_prompt:
                # Use create_task to ensure proper async context
                asyncio.create_task(SearchService.index_prompt(fresh_prompt))
        except Exception as e:
            print(f"Failed to index approved prompt {updated_prompt.id} in Elasticsearch: {e}")
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
            "description": updated_prompt.description,
            "content": updated_prompt.content,
            "notes": updated_prompt.notes,
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
        
        # Remove from Elasticsearch if it was previously approved
        try:
            from app.services.search_service import SearchService
            import asyncio
            # Use create_task to ensure proper async context
            asyncio.create_task(SearchService.delete_prompt_from_index(updated_prompt.id))
        except Exception as e:
            print(f"Failed to remove rejected prompt {updated_prompt.id} from Elasticsearch: {e}")
        
        return {
            "id": updated_prompt.id,
            "title": updated_prompt.title,
            "slug": updated_prompt.slug,
            "description": updated_prompt.description,
            "content": updated_prompt.content,
            "notes": updated_prompt.notes,
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
    async def track_view(session: AsyncSession, prompt_id: int, user_id: UUID | None = None, ip_address: str | None = None, user_agent: str | None = None) -> bool:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt or prompt.status != PromptStatus.APPROVED:
            return False
        
        # Owner không tính view
        if user_id and prompt.user_id == user_id:
            return False
        
        # Check anti-spam patterns
        if ip_address:
            if await ViewRateLimiter.is_suspicious_pattern(ip_address, user_agent):
                return False
            
            # Check rapid request rate limit (10 views/10 minutes)
            if not await ViewRateLimiter.check_ip_rate_limit(ip_address, max_views=10, window_minutes=10):
                return False
            
            # Check device total view limit (50 views per device)
            if not await ViewRateLimiter.check_device_view_limit(ip_address, max_total_views=50):
                return False
        
        # Check if already viewed this prompt (by user or IP)
        if user_id:
            user_view_query = select(PromptView).where(
                PromptView.prompt_id == prompt_id,
                PromptView.user_id == user_id
            )
            result = await session.execute(user_view_query)
            if result.scalar_one_or_none():
                return False
        elif ip_address:
            ip_view_query = select(PromptView).where(
                PromptView.prompt_id == prompt_id,
                PromptView.ip_address == ip_address
            )
            result = await session.execute(ip_view_query)
            if result.scalar_one_or_none():
                return False
        
        # Create new view record
        new_view = PromptView(
            prompt_id=prompt_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        session.add(new_view)
        
        # Increment prompt view count
        await PromptRepository.update(session, prompt, {
            "view_count": prompt.view_count + 1
        })
        
        # Increment device total views
        if ip_address:
            await ViewRateLimiter.increment_device_views(ip_address, ttl_days=30)
        
        await session.commit()
        return True
