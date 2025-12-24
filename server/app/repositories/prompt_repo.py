from __future__ import annotations
from typing import Any, TypeVar, Tuple
from uuid import UUID

from sqlalchemy import Select, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate, PromptUpdate
T = TypeVar("T", bound=Tuple[Any, ...])


class PromptRepository:
    @staticmethod
    def _apply_filters(
        stmt: Select[T],
        *,
        q: str | None,
        category: str | None,
        tag: str | None,
        featured: bool | None,
        state: str | None,
        owner_id: UUID | None,
    ) -> Select[T]:
        if q:
            like = f"%{q}%"
            stmt = stmt.where(
                or_(
                    Prompt.title.ilike(like),
                    Prompt.description.ilike(like),
                    Prompt.full_description.ilike(like),
                    Prompt.content.ilike(like),
                )
            )

        if category_id:
            stmt = stmt.where(Prompt.category_id == category_id)
        elif category:
            stmt = stmt.where(Prompt.category == category)

        if tag:
            stmt = stmt.where(Prompt.tags.any(tag))

        if featured is not None:
            stmt = stmt.where(Prompt.featured == featured)

        if state:
            stmt = stmt.where(Prompt.state == state)

        if owner_id:
            stmt = stmt.where(Prompt.owner_id == owner_id)

        stmt = stmt.where(Prompt.is_deleted.is_(False))
        return stmt

    @staticmethod
    async def list(
        session: AsyncSession,
        *,
        q: str | None,
        category: str | None,
        category_id: int | None = None,
        tag: str | None,
        featured: bool | None,
        state: str | None,
        owner_id: UUID | None,
        limit: int,
        offset: int,
    ) -> list[Prompt]:
        stmt = select(Prompt).order_by(Prompt.id).limit(limit).offset(offset)
        stmt = PromptRepository._apply_filters(
            stmt,
            q=q,
            category=category,
            category_id=category_id,
            tag=tag,
            featured=featured,
            state=state,
            owner_id=owner_id,
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count(
        session: AsyncSession,
        *,
        q: str | None,
        category: str | None,
        category_id: int | None = None,
        tag: str | None,
        featured: bool | None,
        state: str | None,
        owner_id: UUID | None,
    ) -> int:
        stmt = select(func.count(Prompt.id))
        stmt = PromptRepository._apply_filters(
            stmt.select_from(Prompt),
            q=q,
            category=category,
            category_id=category_id,
            tag=tag,
            featured=featured,
            state=state,
            owner_id=owner_id,
        )
        result = await session.execute(stmt)
        return int(result.scalar_one())

    @staticmethod
    async def get_by_id(session: AsyncSession, prompt_id: int) -> Prompt | None:
        result = await session.execute(
            select(Prompt).where(Prompt.id == prompt_id, Prompt.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        session: AsyncSession,
        data: PromptCreate,
        *,
        id_override: int | None = None,
        owner_id: UUID | None = None,
        state: str | None = None,
    ) -> Prompt:
        payload = data.model_dump()
        if owner_id is not None:
            payload["owner_id"] = owner_id
        if state is not None:
            payload["state"] = state
        prompt = Prompt(**payload)
        if id_override is not None:
            prompt.id = id_override
        session.add(prompt)
        await session.flush()
        return prompt

    @staticmethod
    async def update_by_id(
        session: AsyncSession, prompt_id: int, data: PromptUpdate
    ) -> Prompt | None:
        values = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not values:
            return await PromptRepository.get_by_id(session, prompt_id)
        await session.execute(update(Prompt).where(Prompt.id == prompt_id).values(**values))
        return await PromptRepository.get_by_id(session, prompt_id)

    @staticmethod
    async def delete_by_id(session: AsyncSession, prompt_id: int) -> bool:
        result = await session.execute(delete(Prompt).where(Prompt.id == prompt_id))
        count = getattr(result, "rowcount", 0)
        return count > 0
