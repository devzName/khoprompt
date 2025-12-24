from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.schemas.user import UserRole
from app.core.cache import cache
from app.core.cache_pg import pg_redis_get, pg_redis_set
from app.core.redis_client import get_redis
import json


class RoleRepository:
    @staticmethod
    async def get_by_name(session: AsyncSession, name: str) -> Role | None:
        redis_client = get_redis()
        try:
            redis_role = await redis_client.get(f"role:{name}")
            if redis_role:
                data = json.loads(redis_role)
                role = Role(**data)
                return await session.merge(role, load=False)
        except Exception:
            redis_role = await pg_redis_get(session, f"role:{name}")
            if isinstance(redis_role, dict):
                role = Role(**redis_role)
                return await session.merge(role, load=False)

        cached_role = cache.get(f"role:{name}")
        if cached_role:
            return await session.merge(cached_role, load=False)
        result = await session.execute(select(Role).where(Role.name == name))
        role = result.scalar_one_or_none()
        if role:
            cache.set(f"role:{name}", role, ttl_seconds=300)
            payload = {"id": str(role.id), "name": role.name, "description": role.description}
            try:
                await redis_client.set(f"role:{name}", json.dumps(payload), ex=300)
            except Exception:
                await pg_redis_set(session, f"role:{name}", payload, ttl_seconds=300)
        return role

    @staticmethod
    async def get_default_roles(session: AsyncSession, role_names: list[UserRole]) -> list[Role]:
        roles: list[Role] = []
        for role_name in role_names:
            role = await RoleRepository.get_by_name(session, role_name.value)
            if role:
                roles.append(role)
        return roles

    @staticmethod
    async def ensure_seeded(session: AsyncSession, role_names: list[UserRole]) -> None:
        for role_name in role_names:
            exists = await RoleRepository.get_by_name(session, role_name.value)
            if not exists:
                session.add(Role(name=role_name.value, description=f"{role_name.value} role"))
        await session.commit()
        cache.clear_prefix("role:")
        await pg_redis_set(session, "roles:seeded_marker", {"seeded": True}, ttl_seconds=60)
