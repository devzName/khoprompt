from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.models.prompt import Prompt
from app.models.prompt_tag import PromptTag
from app.constants.prompt_status import PromptStatus


class PromptRepository:

    @staticmethod
    async def create(session: AsyncSession, prompt_data: dict, user_id: UUID) -> Prompt:
        tag_ids = prompt_data.pop('tags', [])
        
        prompt = Prompt(
            **prompt_data,
            user_id=user_id,
            status=PromptStatus.DRAFT
        )
        
        if tag_ids:
            stmt = select(PromptTag).where(PromptTag.id.in_(tag_ids))
            result = await session.execute(stmt)
            tags = result.scalars().all()
            prompt.tags = tags
        
        session.add(prompt)
        await session.commit()
        await session.refresh(prompt)
        return prompt

    @staticmethod
    async def get_by_id(session: AsyncSession, prompt_id: int) -> Prompt | None:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.id == prompt_id)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_approved_prompts(session: AsyncSession) -> list[Prompt]:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.APPROVED)
            .order_by(Prompt.created_at.desc())
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_user(session: AsyncSession, user_id: UUID) -> list[Prompt]:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.user_id == user_id)
            .order_by(Prompt.created_at.desc())
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_pending_prompts(session: AsyncSession, limit: int = 100) -> list[Prompt]:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.PENDING)
            .order_by(Prompt.created_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_featured_prompts(session: AsyncSession, limit: int = 6) -> list[Prompt]:
        """Get featured prompts based on engagement metrics (likes, views) and recency"""
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.APPROVED)
            .order_by(
                # Order by engagement score: (like_count * 2 + view_count) descending
                (Prompt.like_count * 2 + Prompt.view_count).desc(),
                Prompt.created_at.desc()
            )
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update(session: AsyncSession, prompt: Prompt, update_data: dict) -> Prompt:
        # Extract tags from update_data
        tag_ids = update_data.pop('tags', None)
        
        for field, value in update_data.items():
            if hasattr(prompt, field):
                setattr(prompt, field, value)
        
        if tag_ids is not None:
            stmt = select(PromptTag).where(PromptTag.id.in_(tag_ids))
            result = await session.execute(stmt)
            tags = result.scalars().all()
            prompt.tags = tags
        
        await session.commit()
        await session.refresh(prompt)
        return prompt

    @staticmethod
    async def delete(session: AsyncSession, prompt: Prompt) -> None:
        await session.delete(prompt)
        await session.commit()