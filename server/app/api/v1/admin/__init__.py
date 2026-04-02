from fastapi import APIRouter

from app.api.v1.admin.settings import router as settings_router
from app.api.v1.admin.audit_logs import router as audit_logs_router

router = APIRouter()

router.include_router(settings_router, prefix="/settings", tags=["admin-settings"])
router.include_router(audit_logs_router, prefix="/audit-logs", tags=["admin-audit"])
