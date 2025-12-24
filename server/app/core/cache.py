from __future__ import annotations

import time
from typing import Any, Callable

CacheKey = str


class TTLCache:
    def __init__(self) -> None:
        self._store: dict[CacheKey, tuple[float, Any]] = {}

    def get(self, key: CacheKey) -> Any | None:
        item = self._store.get(key)
        if not item:
            return None
        expires_at, value = item
        if expires_at < time.time():
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: CacheKey, value: Any, ttl_seconds: int) -> None:
        self._store[key] = (time.time() + ttl_seconds, value)

    def delete(self, key: CacheKey) -> None:
        self._store.pop(key, None)

    def clear_prefix(self, prefix: str) -> None:
        for k in list(self._store.keys()):
            if k.startswith(prefix):
                self._store.pop(k, None)


cache = TTLCache()


def cached(ttl_seconds: int, key_builder: Callable[..., str]):
    def decorator(func: Callable):
        async def wrapper(*args, **kwargs):
            key = key_builder(*args, **kwargs)
            hit = cache.get(key)
            if hit is not None:
                return hit
            result = await func(*args, **kwargs)
            cache.set(key, result, ttl_seconds)
            return result

        return wrapper

    return decorator
