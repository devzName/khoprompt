from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache
from app.core.cache_pg import pg_redis_del, pg_redis_get, pg_redis_set
from app.core.redis_client import get_redis
from app.models.access_token import AccessToken


class AccessTokenRepository:
    @staticmethod
    async def create(session: AsyncSession, user_id: UUID, jti: str, expires_at: datetime) -> AccessToken:
        token = AccessToken(user_id=user_id, jti=jti, expires_at=expires_at)
        session.add(token)
        await session.flush()
        
        ttl = int((expires_at - datetime.now(timezone.utc)).total_seconds())
        if ttl > 0:
            cache.set(f"access:{jti}", token, ttl_seconds=ttl)
            payload = {
                "user_id": str(user_id),
                "expires_at": expires_at.isoformat(),
                "revoked": False,
            }
            try:
                redis_client = get_redis()
                await redis_client.set(f"access:{jti}", json.dumps(payload), ex=ttl)
            except Exception:
                await pg_redis_set(session, f"access:{jti}", payload, ttl_seconds=ttl)
        return token

    @staticmethod
    async def get_by_jti(session: AsyncSession, jti: str) -> AccessToken | None:
        cached_token = cache.get(f"access:{jti}")
        if cached_token:
            return cached_token
        try:
            redis_client = get_redis()
            redis_meta_raw = await redis_client.get(f"access:{jti}")
            if redis_meta_raw:
                data = json.loads(redis_meta_raw)
                if data.get("revoked"):
                    return None
        except Exception:
            redis_meta = await pg_redis_get(session, f"access:{jti}")
            if isinstance(redis_meta, dict) and redis_meta.get("revoked"):
                return None
        result = await session.execute(
            select(AccessToken).where(AccessToken.jti == jti, AccessToken.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke(session: AsyncSession, jti: str) -> None:
        await session.execute(
            update(AccessToken)
            .where(AccessToken.jti == jti)
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        cache.delete(f"access:{jti}")
        try:
            redis_client = get_redis()
            await redis_client.delete(f"access:{jti}")
        except Exception:
            await pg_redis_del(session, f"access:{jti}")

    @staticmethod
    async def revoke_all_for_user(session: AsyncSession, user_id: UUID) -> None:
        await session.execute(
            update(AccessToken)
            .where(AccessToken.user_id == user_id)
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        cache.clear_prefix("access:")
        # We don't have a specific user_access_clear key but we could add it if needed
