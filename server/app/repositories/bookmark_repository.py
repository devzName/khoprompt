from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
from uuid import UUID

from app.models.bookmark import Bookmark
from app.models.prompt import Prompt


class BookmarkRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_and_prompt(self, user_id: UUID, prompt_id: int) -> Optional[Bookmark]:
        """Get a specific bookmark for a user and prompt"""
        stmt = select(Bookmark).where(
            and_(
                Bookmark.user_id == user_id,
                Bookmark.prompt_id == prompt_id
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, prompt_id: int) -> Bookmark:
        """Create a new bookmark"""
        bookmark = Bookmark(user_id=user_id, prompt_id=prompt_id)
        self.db.add(bookmark)
        await self.db.commit()
        await self.db.refresh(bookmark)
        return bookmark

    async def delete(self, bookmark: Bookmark) -> None:
        """Delete a bookmark"""
        await self.db.delete(bookmark)
        await self.db.commit()

    async def get_user_bookmarks_with_prompts(
        self, 
        user_id: UUID, 
        offset: int, 
        limit: int
    ) -> List[Bookmark]:
        """Get user's bookmarks with prompt details"""
        stmt = (
            select(Bookmark)
            .options(
                selectinload(Bookmark.prompt).selectinload(Prompt.category),
                selectinload(Bookmark.prompt).selectinload(Prompt.tags),
                selectinload(Bookmark.prompt).selectinload(Prompt.user)
            )
            .where(Bookmark.user_id == user_id)
            .order_by(desc(Bookmark.created_at))
            .offset(offset)
            .limit(limit)
        )
        
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def count_user_bookmarks(self, user_id: UUID) -> int:
        """Count total bookmarks for a user"""
        stmt = select(func.count(Bookmark.id)).where(Bookmark.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def exists(self, user_id: UUID, prompt_id: int) -> bool:
        """Check if bookmark exists"""
        stmt = select(Bookmark.id).where(
            and_(
                Bookmark.user_id == user_id,
                Bookmark.prompt_id == prompt_id
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_prompt_by_id(self, prompt_id: int) -> Optional[Prompt]:
        """Get prompt by ID"""
        stmt = select(Prompt).where(Prompt.id == prompt_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()