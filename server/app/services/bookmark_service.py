from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from uuid import UUID

from app.repositories.bookmark_repository import BookmarkRepository
from app.schemas.bookmark import BookmarkToggleResponse


class BookmarkService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bookmark_repo = BookmarkRepository(db)

    async def is_bookmarked(self, user_id: UUID, prompt_id: int) -> bool:
        """Check if a prompt is bookmarked by a user"""
        return await self.bookmark_repo.exists(user_id, prompt_id)

    async def add_bookmark(self, user_id: UUID, prompt_id: int):
        """Add a bookmark"""
        # Check if bookmark already exists
        existing_bookmark = await self.bookmark_repo.get_by_user_and_prompt(user_id, prompt_id)
        if existing_bookmark:
            return existing_bookmark

        # Create new bookmark
        return await self.bookmark_repo.create(user_id, prompt_id)

    async def remove_bookmark(self, user_id: UUID, prompt_id: int) -> bool:
        """Remove a bookmark"""
        bookmark = await self.bookmark_repo.get_by_user_and_prompt(user_id, prompt_id)
        if bookmark:
            await self.bookmark_repo.delete(bookmark)
            return True
        return False

    async def toggle_bookmark(self, user_id: UUID, prompt_id: int) -> BookmarkToggleResponse:
        """Toggle bookmark status"""
        # Check if prompt exists
        prompt = await self.bookmark_repo.get_prompt_by_id(prompt_id)
        if not prompt:
            raise ValueError("Prompt not found")

        # Check current bookmark status
        is_currently_bookmarked = await self.is_bookmarked(user_id, prompt_id)
        
        if is_currently_bookmarked:
            # Remove bookmark
            await self.remove_bookmark(user_id, prompt_id)
            return BookmarkToggleResponse(
                is_bookmarked=False,
                message="Bookmark removed successfully"
            )
        else:
            # Add bookmark
            await self.add_bookmark(user_id, prompt_id)
            return BookmarkToggleResponse(
                is_bookmarked=True,
                message="Bookmark added successfully"
            )

    async def get_user_bookmarked_prompts(
        self, 
        user_id: UUID, 
        page: int = 1, 
        limit: int = 20
    ) -> Dict[str, Any]:
        """Get paginated list of user's bookmarked prompts"""
        offset = (page - 1) * limit
        
        # Get bookmarks with prompt details
        bookmarks = await self.bookmark_repo.get_user_bookmarks_with_prompts(
            user_id, offset, limit
        )
        
        # Get total count
        total = await self.bookmark_repo.count_user_bookmarks(user_id)
        
        # Format response
        prompts = []
        for bookmark in bookmarks:
            prompt = bookmark.prompt
            if prompt and prompt.status == 'approved':  # Only return approved prompts
                prompt_data = {
                    "id": prompt.id,
                    "title": prompt.title,
                    "slug": prompt.slug,
                    "description": prompt.description,
                    "category": {
                        "id": prompt.category.id,
                        "name": prompt.category.name,
                        "slug": prompt.category.slug
                    } if prompt.category else None,
                    "tags": [
                        {"id": tag.id, "name": tag.name} 
                        for tag in prompt.tags
                    ] if prompt.tags else [],
                    "user": {
                        "id": str(prompt.user.id),
                        "full_name": prompt.user.full_name,
                        "avatar_url": prompt.user.avatar_url,
                        "email": prompt.user.email
                    } if prompt.user else None,
                    "created_at": prompt.created_at,
                    "view_count": prompt.view_count,
                    "bookmark_created_at": bookmark.created_at
                }
                prompts.append(prompt_data)
        
        pages = (total + limit - 1) // limit
        
        return {
            "data": prompts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": pages
            }
        }