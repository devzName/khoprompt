from fastapi import APIRouter

from app.api.v1.admin.settings import router as settings_router

router = APIRouter()

router.include_router(settings_router, prefix="/settings", tags=["admin-settings"])
