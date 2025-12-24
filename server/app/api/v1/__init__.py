from fastapi import APIRouter

from app.api.v1.prompt import router as prompt_router
from app.api.v1.auth import router as auth_router

router = APIRouter()

router.include_router(prompt_router, prefix="/prompts", tags=["prompts"])
router.include_router(auth_router, prefix="/auth", tags=["auth"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
