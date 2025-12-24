from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.role_repo import RoleRepository
from app.schemas.user import UserRole


class UserRepository:
    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: UUID) -> User | None:
        result = await session.execute(
            select(User).where(User.id == user_id, User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> User | None:
        result = await session.execute(
            select(User).where(User.email == email, User.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(session: AsyncSession, data: UserCreate, hashed_password: str) -> User:
        user = User(
            email=data.email,
            hashed_password=hashed_password,
            full_name=data.full_name,
            is_active=True,
        )
        roles = await RoleRepository.get_default_roles(session, data.roles)
        user.roles = roles
        session.add(user)
        await session.flush()
        return user
