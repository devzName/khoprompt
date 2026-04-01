from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.site_settings import SiteSettings


async def get_setting(db: AsyncSession, key: str, default: str | None = None) -> str | None:
    """Return the value for a site setting key, or default if not found."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = result.scalar_one_or_none()
    if setting is None:
        return default
    return setting.value


async def require_approval(db: AsyncSession) -> bool:
    """Return True if new prompts require admin approval before going live."""
    value = await get_setting(db, "require_approval", default="true")
    return (value or "true").lower() not in ("false", "0", "no")
