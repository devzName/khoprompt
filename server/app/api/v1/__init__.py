from fastapi import APIRouter

from app.api.v1.prompt_categories import router as category_router

router = APIRouter()

router.include_router(category_router, prefix="/prompt-categories", tags=["prompt-categories"])


@router.get("/health")
async def health_check():
    return {"status": "ok"}
