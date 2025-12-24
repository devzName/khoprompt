from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, desc

from app.core.database import AsyncSessionLocal
from app.core.redis_client import get_redis
from app.models.prompt import Prompt
from app.schemas.prompt import PromptOut

logger = logging.getLogger(__name__)


async def recover_latest_feed() -> None:
    """
    Background job to recover/repair the Redis latest prompt feed.
    
    Strategy:
    1. Query DB for all prompts created in last 1 hour
    2. Re-populate Redis caching keys (ZSET + String Cache)
    3. Remove any keys from ZSET that shouldn't be there (optional, handled by natural expiry/eviction logic usually)
    """
    try:
        redis = get_redis()
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        
        async with AsyncSessionLocal() as session:
            stmt = (
                select(Prompt)
                .where(Prompt.created_at >= one_hour_ago)
                .order_by(desc(Prompt.created_at))
                .limit(100)  # Reasonable upper bound for recovery
            )
            result = await session.execute(stmt)
            prompts = result.scalars().all()
        
        if not prompts:
            # If no prompts in last hour, ensure feed is empty?
            # Or just do nothing.
            return

        pipe = redis.pipeline()
        
        # 1. Clear existing sorted set to ensure full sync? 
        # Alternatively, just UPSERT. 
        # Safest for self-healing is UPSERT.
        
        for p in prompts:
            try:
                p_out = PromptOut.model_validate(p)
                p_json = p_out.model_dump_json()
                
                # Restore Cache Object
                pipe.setex(f"prompt:{p.id}", 3600, p_json)
                
                # Restore Feed Entry
                pipe.zadd("feed:latest:1h", {str(p.id): p.created_at.timestamp()})
            except Exception:
                continue
                
        # Trim old entries from feed that might have been missed
        cutoff = one_hour_ago.timestamp()
        pipe.zremrangebyscore("feed:latest:1h", 0, cutoff)
        
        await pipe.execute()
        logger.info(f"Recovered latest feed with {len(prompts)} prompts")
        
    except Exception as e:
        logger.error(f"Failed to recover latest feed: {e}")


async def run_periodically(interval: int = 300) -> None:
    while True:
        await recover_latest_feed()
        await asyncio.sleep(interval)


if __name__ == "__main__":
    # Can be run as standalone script
    logging.basicConfig(level=logging.INFO)
    asyncio.run(recover_latest_feed())
