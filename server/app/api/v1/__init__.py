from fastapi import APIRouter

from app.api.v1.prompt_categories import router as category_router
from app.api.v1.prompt_tags import router as tag_router
from app.api.v1.prompts import router as prompt_router
from app.api.v1.auth import router as auth_router
from app.api.v1.votes import router as vote_router
from app.api.v1.statistics import router as statistics_router
from app.api.v1.ai import router as ai_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(category_router, prefix="/prompt-categories", tags=["prompt-categories"])
router.include_router(tag_router, prefix="/prompt-tags", tags=["prompt-tags"])
router.include_router(prompt_router, prefix="/prompts", tags=["prompts"])
router.include_router(vote_router, prefix="/votes", tags=["votes"])
router.include_router(statistics_router, prefix="/statistics", tags=["statistics"])
router.include_router(ai_router, prefix="/ai", tags=["ai"])


@router.get("/health")
async def health_check():
    return {"status": "ok"}
