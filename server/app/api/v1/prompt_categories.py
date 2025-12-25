from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DbSession
from app.services.prompt_category_service import PromptCategoryService
from app.schemas.prompt_category import PromptCategoryStatsResponse

router = APIRouter()

@router.get("/stats", response_model=PromptCategoryStatsResponse)
async def get_categories_stats(session: DbSession):
    """Get all categories with prompt counts and total prompts, ordered by display_order."""
    return await PromptCategoryService.get_categories_with_stats(session)

