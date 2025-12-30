import redis
import json
from datetime import datetime, timedelta
from typing import Optional
import os

# Redis connection with error handling
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )
    redis_client.ping()
    REDIS_AVAILABLE = True
except Exception as e:
    print(f"Redis connection failed: {e}")
    redis_client = None
    REDIS_AVAILABLE = False

class ViewRateLimiter:
    
    @staticmethod
    def get_ip_key(ip: str) -> str:
        return f"view_rate_limit:ip:{ip}"
    
    @staticmethod
    async def check_ip_rate_limit(ip: str, max_views: int = 10, window_minutes: int = 10) -> bool:
        if not REDIS_AVAILABLE:
            return True
            
        try:
            key = ViewRateLimiter.get_ip_key(ip)
            current_count = redis_client.get(key)
            
            if current_count is None:
                redis_client.setex(key, window_minutes * 60, 1)
                return True
            
            if int(current_count) >= max_views:
                return False
            
            redis_client.incr(key)
            return True
            
        except Exception as e:
            print(f"Redis error in rate limiting: {e}")
            return True
    
    @staticmethod
    async def is_suspicious_pattern(ip: str, user_agent: Optional[str] = None) -> bool:
        if not REDIS_AVAILABLE:
            return False
            
        try:
            if user_agent:
                bot_indicators = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
                if any(indicator in user_agent.lower() for indicator in bot_indicators):
                    return True
            
            rapid_key = f"rapid_check:ip:{ip}"
            request_times = redis_client.lrange(rapid_key, 0, -1)
            
            now = datetime.now().timestamp()
            redis_client.lpush(rapid_key, now)
            redis_client.expire(rapid_key, 60)
            
            recent_requests = [
                float(ts) for ts in request_times 
                if now - float(ts) <= 30
            ]
            
            if len(recent_requests) >= 3:
                return True
            
            return False
            
        except Exception as e:
            print(f"Redis error in suspicious pattern detection: {e}")
            return False