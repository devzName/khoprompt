from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DbSession
from app.services.prompt_category_service import PromptCategoryService
from app.schemas.prompt_category import PromptCategoryStatsResponse, PromptCategoryOut

router = APIRouter()

@router.get("/stats", response_model=PromptCategoryStatsResponse)
async def get_categories_stats(session: DbSession):
    return await PromptCategoryService.get_categories_with_stats(session)

@router.get("/", response_model=list[PromptCategoryOut])
async def get_all_categories(session: DbSession):
    return await PromptCategoryService.get_all_categories(session)

