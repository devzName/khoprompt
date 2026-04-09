from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.api.auth_deps import CurrentUser, AdminUser
from app.schemas.notification import (
    NotificationGroupCreate, NotificationGroupUpdate, NotificationGroupResponse,
    NotificationCreate, NotificationUpdate, NotificationResponse,
    UserNotificationResponse, UserNotificationJoinResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(tags=["notifications"])

# --- Notification Groups (admin only) ---

@router.get("/groups", response_model=List[NotificationGroupResponse])
async def get_notification_groups(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
    skip: int = 0,
    limit: int = 100,
):
    return await NotificationService.get_notification_groups(db, skip, limit)

@router.get("/groups/{group_id}", response_model=NotificationGroupResponse)
async def get_notification_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    group = await NotificationService.get_notification_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Notification group not found")
    return group

@router.post("/groups", response_model=NotificationGroupResponse, status_code=201)
async def create_notification_group(
    group: NotificationGroupCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    return await NotificationService.create_notification_group(db, group)

@router.put("/groups/{group_id}", response_model=NotificationGroupResponse)
async def update_notification_group(
    group_id: UUID,
    group_update: NotificationGroupUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    updated = await NotificationService.update_notification_group(db, group_id, group_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification group not found")
    return updated

@router.delete("/groups/{group_id}", status_code=204)
async def delete_notification_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    deleted = await NotificationService.delete_notification_group(db, group_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification group not found")

# --- User notifications (must be before /{notification_id} to avoid route conflict) ---

@router.get("/public", response_model=List[NotificationResponse])
async def get_public_notifications(
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """Public notifications — no auth required"""
    return await NotificationService.get_public_notifications(db, limit)

@router.get("/me", response_model=List[UserNotificationJoinResponse])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = None,
):
    return await NotificationService.get_user_notifications(db, current_user.id)

@router.put("/me/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = None,
):
    updated = await NotificationService.mark_notification_as_read(db, current_user.id, notification_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/me/{notification_id}/archive")
async def archive_my_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = None,
):
    updated = await NotificationService.archive_notification(db, current_user.id, notification_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification archived"}

# --- Notifications CRUD (admin only) ---

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
    skip: int = 0,
    limit: int = 100,
):
    return await NotificationService.get_notifications(db, skip, limit)

@router.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(
    notification: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    return await NotificationService.create_notification(db, notification)

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    notification = await NotificationService.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: UUID,
    notification_update: NotificationUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    updated = await NotificationService.update_notification(db, notification_id, notification_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return updated

@router.delete("/{notification_id}", status_code=204)
async def delete_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = None,
):
    deleted = await NotificationService.delete_notification(db, notification_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification not found")
