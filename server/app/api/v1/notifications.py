from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import DbSession, get_current_user
from app.schemas.notification import NotificationOut
from app.services.notification_service import NotificationService

router = APIRouter()

@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    session: DbSession,
    current_user=Depends(get_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[NotificationOut]:
    return await NotificationService.list_notifications(session, current_user.id, limit, offset)

@router.get("/unread-count")
async def get_unread_count(
    session: DbSession,
    current_user=Depends(get_current_user),
) -> dict[str, int]:
    count = await NotificationService.get_unread_count(session, current_user.id)
    return {"count": count}

@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_as_read(
    notification_id: UUID,
    session: DbSession,
    current_user=Depends(get_current_user),
):
    await NotificationService.mark_read(session, notification_id, current_user.id)
    return {"status": "ok"}

@router.post("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    session: DbSession,
    current_user=Depends(get_current_user),
):
    count = await NotificationService.mark_all_read(session, current_user.id)
    return {"count": count}
