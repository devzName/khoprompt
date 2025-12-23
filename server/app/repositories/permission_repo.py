from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache
from app.core.cache_pg import pg_redis_get, pg_redis_set
from app.core.redis_client import get_redis
from app.models.permission import Permission


class PermissionRepository:
    @staticmethod
    async def get_by_code(session: AsyncSession, code: str) -> Permission | None:
        redis_client = get_redis()
        try:
            redis_perm = await redis_client.get(f"perm:{code}")
            if redis_perm:
                from json import loads

                data = loads(redis_perm)
                perm = Permission(**data)
                return session.merge(perm, load=False)
        except Exception:
            redis_perm = await pg_redis_get(session, f"perm:{code}")
            if isinstance(redis_perm, dict):
                perm = Permission(**redis_perm)
                return session.merge(perm, load=False)

        cached_perm = cache.get(f"perm:{code}")
        if cached_perm:
            return session.merge(cached_perm, load=False)
        result = await session.execute(select(Permission).where(Permission.code == code))
        perm = result.scalar_one_or_none()
        if perm:
            cache.set(f"perm:{code}", perm, ttl_seconds=300)
            payload = {"id": str(perm.id), "code": perm.code, "description": perm.description}
            try:
                await redis_client.set(f"perm:{code}", json.dumps(payload), ex=300)
            except Exception:
                await pg_redis_set(session, f"perm:{code}", payload, ttl_seconds=300)
        return perm

    @staticmethod
    async def list_codes(session: AsyncSession) -> list[str]:
        cached_codes = cache.get("perm:codes")
        if cached_codes:
            return cached_codes
        redis_client = get_redis()
        try:
            redis_codes = await redis_client.get("perm:codes")
            if redis_codes:
                from json import loads

                codes = loads(redis_codes)
                cache.set("perm:codes", codes, ttl_seconds=300)
                return codes
        except Exception:
            redis_codes = await pg_redis_get(session, "perm:codes")
            if isinstance(redis_codes, list):
                cache.set("perm:codes", redis_codes, ttl_seconds=300)
                return redis_codes
        result = await session.execute(select(Permission.code))
        codes = [row[0] for row in result.all()]
        cache.set("perm:codes", codes, ttl_seconds=300)
        await pg_redis_set(session, "perm:codes", codes, ttl_seconds=300)
        return codes
