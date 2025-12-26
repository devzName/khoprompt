from fastapi import APIRouter

from app.api.v1.prompt_categories import router as category_router
from app.api.v1.prompt_tags import router as tag_router
from app.api.v1.prompts import router as prompt_router
from app.api.v1.auth import router as auth_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(category_router, prefix="/prompt-categories", tags=["prompt-categories"])
router.include_router(tag_router, prefix="/prompt-tags", tags=["prompt-tags"])
router.include_router(prompt_router, prefix="/prompts", tags=["prompts"])


@router.get("/health")
async def health_check():
    return {"status": "ok"}
