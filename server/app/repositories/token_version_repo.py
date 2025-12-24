from __future__ import annotations

from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import get_redis
from app.models.token_version import TokenVersion


class TokenVersionRepository:
    @staticmethod
    async def get_current_version(session: AsyncSession, user_id: UUID) -> int:
        redis_client = get_redis()
        cache_key = f"user_token_version:{user_id}"
        
        try:
            cached_version = await redis_client.get(cache_key)
            if cached_version is not None:
                return int(cached_version)
        except Exception:
            pass

        # Fallback to DB
        result = await session.execute(
            select(TokenVersion.version).where(TokenVersion.user_id == user_id)
        )
        version = result.scalar_one_or_none()
        
        if version is None:
            # First time setup
            version = 0
            token_version = TokenVersion(user_id=user_id, version=version)
            session.add(token_version)
            await session.flush()
        
        # Save to Redis
        try:
            await redis_client.set(cache_key, version, ex=3600 * 24) # 1 day cache
        except Exception:
            pass
            
        return version

    @staticmethod
    async def increment_version(session: AsyncSession, user_id: UUID) -> int:
        # Update in DB
        result = await session.execute(
            select(TokenVersion).where(TokenVersion.user_id == user_id).with_for_update()
        )
        tv = result.scalar_one_or_none()
        
        if tv:
            tv.version += 1
            new_version = tv.version
        else:
            new_version = 1
            tv = TokenVersion(user_id=user_id, version=new_version)
            session.add(tv)
        
        await session.flush()
        
        # Update Redis
        redis_client = get_redis()
        cache_key = f"user_token_version:{user_id}"
        try:
            await redis_client.set(cache_key, new_version, ex=3600 * 24)
        except Exception:
            pass
            
        return new_version
