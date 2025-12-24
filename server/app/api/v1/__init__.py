from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.prompt import router as prompt_router
from app.api.v1.prompt_categories import router as category_router
from app.api.v1.prompt_tags import router as tag_router
from app.api.v1.users import router as user_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(category_router, prefix="/prompt-categories", tags=["prompt-categories"])
api_router.include_router(tag_router, prefix="/prompt-tags", tags=["prompt-tags"])
api_router.include_router(prompt_router, prefix="/prompts", tags=["prompts"])
api_router.include_router(user_router, prefix="/users", tags=["users"])


@api_router.get("/health")
async def health_check():
    return {"status": "ok"}
