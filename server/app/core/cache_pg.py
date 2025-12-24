from __future__ import annotations

import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_redis_available = True


async def _handle_error(session: AsyncSession) -> None:
    global _redis_available
    _redis_available = False
    try:
        await session.rollback()
    except Exception:
        pass


async def pg_redis_get(session: AsyncSession, key: str) -> Any | None:
    global _redis_available
    if not _redis_available:
        return None
    try:
        result = await session.execute(text("SELECT redis_get('default', :key) AS val"), {"key": key})
        val = result.scalar_one_or_none()
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return val
    except Exception:
        await _handle_error(session)
        return None


async def pg_redis_set(session: AsyncSession, key: str, value: Any, ttl_seconds: int) -> None:
    global _redis_available
    if not _redis_available:
        return
    try:
        payload = json.dumps(value)
        await session.execute(
            text("SELECT redis_set('default', :key, :value, 'EX', :ttl)"),
            {"key": key, "value": payload, "ttl": ttl_seconds},
        )
    except Exception:
        await _handle_error(session)
        return


async def pg_redis_del(session: AsyncSession, key: str) -> None:
    global _redis_available
    if not _redis_available:
        return
    try:
        await session.execute(text("SELECT redis_del('default', :key)"), {"key": key})
    except Exception:
        await _handle_error(session)
        return
