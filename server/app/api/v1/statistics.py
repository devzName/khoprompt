from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import DbSession
from app.models.prompt import Prompt
from app.models.prompt_vote import PromptVote
from app.models.prompt_category import PromptCategory

router = APIRouter()


@router.get("")
async def get_statistics(session: DbSession):
    """Get general statistics for the application"""
    try:
        # Count approved prompts
        approved_prompts_stmt = select(func.count(Prompt.id)).where(
            Prompt.status == 'approved'
        )
        approved_prompts_result = await session.execute(approved_prompts_stmt)
        approved_prompts_count = approved_prompts_result.scalar() or 0

        # Count total categories
        categories_stmt = select(func.count(PromptCategory.id))
        categories_result = await session.execute(categories_stmt)
        categories_count = categories_result.scalar() or 0

        # Calculate positive rating percentage
        total_votes_stmt = select(func.count(PromptVote.id))
        total_votes_result = await session.execute(total_votes_stmt)
        total_votes = total_votes_result.scalar() or 0

        positive_votes_stmt = select(func.count(PromptVote.id)).where(
            PromptVote.is_helpful == True
        )
        positive_votes_result = await session.execute(positive_votes_stmt)
        positive_votes = positive_votes_result.scalar() or 0

        # Calculate percentage
        positive_percentage = 0
        if total_votes > 0:
            positive_percentage = round((positive_votes / total_votes) * 100)

        # Count total views
        total_views_stmt = select(func.sum(Prompt.view_count)).where(
            Prompt.status == 'approved'
        )
        total_views_result = await session.execute(total_views_stmt)
        total_views = total_views_result.scalar() or 0

        return {
            "approved_prompts": approved_prompts_count,
            "categories": categories_count,
            "total_views": total_views,
            "total_votes": total_votes
        }
    except Exception as e:
        return {
            "approved_prompts": 0,
            "categories": 0,
            "total_views": 0,
            "total_votes": 0
        }