from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from app.models.prompt_vote import PromptVote
from app.models.prompt import Prompt


class VoteRepository:

    @staticmethod
    async def get_user_vote(session: AsyncSession, user_id: UUID, prompt_id: int) -> PromptVote | None:
        """Get user's vote for a specific prompt"""
        stmt = select(PromptVote).where(
            and_(
                PromptVote.user_id == user_id,
                PromptVote.prompt_id == prompt_id
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_or_update_vote(session: AsyncSession, user_id: UUID, prompt_id: int, is_helpful: bool) -> PromptVote:
        """Create new vote or update existing vote"""
        # Check if vote already exists
        existing_vote = await VoteRepository.get_user_vote(session, user_id, prompt_id)
        
        if existing_vote:
            # Update existing vote
            existing_vote.is_helpful = is_helpful
            await session.commit()
            await session.refresh(existing_vote)
            return existing_vote
        else:
            # Create new vote
            vote = PromptVote(
                user_id=user_id,
                prompt_id=prompt_id,
                is_helpful=is_helpful
            )
            session.add(vote)
            await session.commit()
            await session.refresh(vote)
            return vote

    @staticmethod
    async def delete_vote(session: AsyncSession, user_id: UUID, prompt_id: int) -> bool:
        """Delete user's vote for a prompt"""
        existing_vote = await VoteRepository.get_user_vote(session, user_id, prompt_id)
        if existing_vote:
            await session.delete(existing_vote)
            await session.commit()
            return True
        return False

    @staticmethod
    async def get_vote_stats(session: AsyncSession, prompt_id: int) -> dict:
        """Get vote statistics for a prompt"""
        stmt = select(
            func.count().filter(PromptVote.is_helpful == True).label('like_count'),
            func.count().filter(PromptVote.is_helpful == False).label('dislike_count')
        ).where(PromptVote.prompt_id == prompt_id)
        
        result = await session.execute(stmt)
        stats = result.first()
        
        return {
            'like_count': stats.like_count or 0,
            'dislike_count': stats.dislike_count or 0
        }

    @staticmethod
    async def update_prompt_vote_counts(session: AsyncSession, prompt_id: int):
        """Update like_count and dislike_count in prompt table"""
        stats = await VoteRepository.get_vote_stats(session, prompt_id)
        
        # Update prompt table
        stmt = select(Prompt).where(Prompt.id == prompt_id)
        result = await session.execute(stmt)
        prompt = result.scalar_one_or_none()
        
        if prompt:
            prompt.like_count = stats['like_count']
            prompt.dislike_count = stats['dislike_count']
            await session.commit()