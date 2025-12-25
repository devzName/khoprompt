from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.models.user import User


class UserRepository:
    
    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> User | None:
        stmt = select(User).where(User.email == email, User.is_deleted == False)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_admin_by_email(session: AsyncSession, email: str) -> User | None:
        stmt = select(User).where(
            User.email == email, 
            User.user_type == "admin",
            User.is_deleted == False
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_google_id(session: AsyncSession, google_id: str) -> User | None:
        stmt = select(User).where(User.google_id == google_id, User.is_deleted == False)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: UUID) -> User | None:
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create(session: AsyncSession, user_data: dict) -> User:
        user = User(**user_data)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    
    @staticmethod
    async def update(session: AsyncSession, user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)
        await session.commit()
        await session.refresh(user)
        return user