from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user
from app.models.site_settings import SiteSettings
from app.models.user import User

router = APIRouter()


class SettingValueRequest(BaseModel):
    value: str


@router.get("")
async def get_all_settings(
    session: DbSession,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return all site settings as a key-value dict (admin only)."""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await session.execute(select(SiteSettings))
    settings = result.scalars().all()

    return {
        row.key: {
            "value": row.value,
            "description": row.description,
            "updated_at": row.updated_at,
        }
        for row in settings
    }


@router.put("/{key}")
async def update_setting(
    key: str,
    body: SettingValueRequest,
    session: DbSession,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Update a single site setting by key (admin only).

    Creates the row if it does not exist yet.
    """
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await session.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = result.scalar_one_or_none()

    if setting is None:
        setting = SiteSettings(key=key, value=body.value, updated_by=current_user.id)
        session.add(setting)
    else:
        setting.value = body.value
        setting.updated_by = current_user.id

    await session.commit()
    await session.refresh(setting)

    return {
        "key": setting.key,
        "value": setting.value,
        "description": setting.description,
        "updated_at": setting.updated_at,
    }
