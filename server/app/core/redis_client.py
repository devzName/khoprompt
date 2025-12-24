from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import Any

from redis.asyncio import Redis

from app.core.config import get_settings


@lru_cache
def _build_client() -> Redis:
    settings = get_settings()
    if settings.redis_url:
        return Redis.from_url(settings.redis_url)
    return Redis(host=settings.redis_host, port=settings.redis_port, decode_responses=True)


def get_redis() -> Redis:
    return _build_client()


async def close_redis() -> None:
    client = _build_client()
    try:
        await client.close()
    except Exception:
        pass
