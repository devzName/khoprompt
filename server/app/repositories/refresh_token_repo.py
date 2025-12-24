from __future__ import annotations

import json

from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache
from app.core.cache_pg import pg_redis_del, pg_redis_get, pg_redis_set
from app.core.redis_client import get_redis
from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    @staticmethod
    async def create(session: AsyncSession, user_id, jti: str, expires_at: datetime) -> RefreshToken:
        token = RefreshToken(user_id=user_id, jti=jti, expires_at=expires_at)
        session.add(token)
        await session.flush()
        cache.set(f"refresh:{jti}", token, ttl_seconds=int((expires_at - datetime.now(timezone.utc)).total_seconds()))
        ttl = int((expires_at - datetime.now(timezone.utc)).total_seconds())
        payload = {
            "user_id": str(user_id),
            "expires_at": expires_at.isoformat(),
            "revoked": False,
        }
        try:
            redis_client = get_redis()
            await redis_client.set(f"refresh:{jti}", json.dumps(payload), ex=ttl)
        except Exception:
            await pg_redis_set(session, f"refresh:{jti}", payload, ttl_seconds=ttl)
        return token

    @staticmethod
    async def get_by_jti(session: AsyncSession, jti: str) -> RefreshToken | None:
        cached_token = cache.get(f"refresh:{jti}")
        if cached_token:
            return cached_token
        try:
            redis_client = get_redis()
            redis_meta_raw = await redis_client.get(f"refresh:{jti}")
            if redis_meta_raw:
                data = json.loads(redis_meta_raw)
                if data.get("revoked"):
                    return None
        except Exception:
            redis_meta = await pg_redis_get(session, f"refresh:{jti}")
            if isinstance(redis_meta, dict) and redis_meta.get("revoked"):
                return None
        result = await session.execute(
            select(RefreshToken).where(RefreshToken.jti == jti, RefreshToken.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke(session: AsyncSession, jti: str) -> None:
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.jti == jti)
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        cache.delete(f"refresh:{jti}")
        try:
            redis_client = get_redis()
            await redis_client.delete(f"refresh:{jti}")
        except Exception:
            await pg_redis_del(session, f"refresh:{jti}")

    @staticmethod
    async def revoke_all_for_user(session: AsyncSession, user_id) -> None:
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        cache.clear_prefix("refresh:")
        await pg_redis_del(session, f"user_refresh_clear:{user_id}")
