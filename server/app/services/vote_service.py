from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.repositories.vote_repo import VoteRepository
from app.repositories.prompt_repo import PromptRepository


class VoteService:

    @staticmethod
    async def vote_prompt(session: AsyncSession, user_id: UUID, prompt_id: int, is_helpful: bool) -> dict:
        """Vote for a prompt (helpful or not helpful)"""
        # Check if prompt exists
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise ValueError("Prompt not found")
        
        # Check if user is trying to vote on their own prompt
        if prompt.user_id == user_id:
            raise ValueError("Cannot vote on your own prompt")
        
        # Create or update vote
        vote = await VoteRepository.create_or_update_vote(session, user_id, prompt_id, is_helpful)
        
        # Update prompt vote counts
        await VoteRepository.update_prompt_vote_counts(session, prompt_id)
        
        # Get updated stats
        stats = await VoteRepository.get_vote_stats(session, prompt_id)
        
        return {
            "vote_id": vote.id,
            "is_helpful": vote.is_helpful,
            "like_count": stats['like_count'],
            "dislike_count": stats['dislike_count'],
            "message": "Vote recorded successfully"
        }

    @staticmethod
    async def remove_vote(session: AsyncSession, user_id: UUID, prompt_id: int) -> dict:
        """Remove user's vote for a prompt"""
        # Check if prompt exists
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise ValueError("Prompt not found")
        
        # Delete vote
        deleted = await VoteRepository.delete_vote(session, user_id, prompt_id)
        if not deleted:
            raise ValueError("No vote found to remove")
        
        # Update prompt vote counts
        await VoteRepository.update_prompt_vote_counts(session, prompt_id)
        
        # Get updated stats
        stats = await VoteRepository.get_vote_stats(session, prompt_id)
        
        return {
            "like_count": stats['like_count'],
            "dislike_count": stats['dislike_count'],
            "message": "Vote removed successfully"
        }

    @staticmethod
    async def get_user_vote(session: AsyncSession, user_id: UUID, prompt_id: int) -> dict | None:
        """Get user's vote for a specific prompt"""
        # Check if prompt exists
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise ValueError("Prompt not found")
        
        # Get user's vote
        vote = await VoteRepository.get_user_vote(session, user_id, prompt_id)
        if not vote:
            return None
        
        return {
            "prompt_id": prompt_id,
            "is_helpful": vote.is_helpful,
            "created_at": vote.created_at,
            "updated_at": vote.updated_at
        }

    @staticmethod
    async def get_vote_stats(session: AsyncSession, prompt_id: int, user_id: UUID | None = None) -> dict:
        """Get vote statistics for a prompt, including user's vote if authenticated"""
        # Check if prompt exists
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise ValueError("Prompt not found")
        
        # Get vote stats
        stats = await VoteRepository.get_vote_stats(session, prompt_id)
        
        # Get user's vote if authenticated
        user_vote = None
        if user_id:
            vote = await VoteRepository.get_user_vote(session, user_id, prompt_id)
            if vote:
                user_vote = vote.is_helpful
        
        return {
            "prompt_id": prompt_id,
            "helpful_count": stats['like_count'],
            "not_helpful_count": stats['dislike_count'],
            "view_count": prompt.view_count,
            "user_vote": user_vote
        }