"""Repository for chat room and message database operations."""
from __future__ import annotations

from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_room import ChatRoom
from app.models.chat_message import ChatMessage


class ChatRepository:

    @staticmethod
    async def list_rooms(db: AsyncSession, user_id: UUID) -> list[ChatRoom]:
        result = await db.execute(
            select(ChatRoom)
            .where(ChatRoom.user_id == user_id, ChatRoom.is_deleted == False)
            .order_by(desc(ChatRoom.updated_at))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_room(db: AsyncSession, room_id: UUID, user_id: UUID) -> ChatRoom | None:
        result = await db.execute(
            select(ChatRoom).where(
                ChatRoom.id == room_id,
                ChatRoom.user_id == user_id,
                ChatRoom.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_room(
        db: AsyncSession,
        user_id: UUID,
        title: str,
        model: str,
        system_prompt: str | None = None,
        source_prompt_id: int | None = None,
    ) -> ChatRoom:
        room = ChatRoom(
            user_id=user_id,
            title=title,
            model=model,
            system_prompt=system_prompt,
            source_prompt_id=source_prompt_id,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)
        return room

    @staticmethod
    async def update_room(db: AsyncSession, room: ChatRoom, user_id: UUID, **kwargs) -> ChatRoom:
        for key, value in kwargs.items():
            if hasattr(room, key) and value is not None:
                setattr(room, key, value)
        room.updated_by = user_id
        await db.commit()
        await db.refresh(room)
        return room

    @staticmethod
    async def soft_delete_room(db: AsyncSession, room: ChatRoom, user_id: UUID) -> None:
        room.is_deleted = True
        room.deleted_by = user_id
        await db.commit()

    @staticmethod
    async def list_messages(
        db: AsyncSession, room_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[ChatMessage]:
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.room_id == room_id)
            .order_by(ChatMessage.created_at)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_message(
        db: AsyncSession,
        room_id: UUID,
        role: str,
        content: str,
        model: str | None = None,
        token_count: int | None = None,
    ) -> ChatMessage:
        message = ChatMessage(
            room_id=room_id,
            role=role,
            content=content,
            model=model,
            token_count=token_count,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message
