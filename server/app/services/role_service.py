from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.role_repo import RoleRepository
from app.schemas.user import UserRole


class RoleService:
    @staticmethod
    async def ensure_defaults(session: AsyncSession) -> None:
        await RoleRepository.ensure_seeded(session, [UserRole.USER, UserRole.SUPERVISOR, UserRole.ADMIN])
