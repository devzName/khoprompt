from __future__ import annotations

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_vote import PromptVote
from app.models.prompt import Prompt


class PromptVoteRepository:
    @staticmethod
    async def upsert_vote(session: AsyncSession, prompt_id: int, user_id: UUID, value: int) -> None:
        """Upsert vote using PostgreSQL-specific INSERT ... ON CONFLICT."""
        stmt = pg_insert(PromptVote).values(user_id=user_id, prompt_id=prompt_id, value=value)
        stmt = stmt.on_conflict_do_update(
            index_elements=["user_id", "prompt_id"], 
            set_={"value": value}
        )
        await session.execute(stmt)

    @staticmethod
    async def apply_vote_delta(session: AsyncSession, prompt_id: int, old_value: int | None, new_value: int) -> None:
        # adjust likes/dislikes in prompts table based on delta
        delta_like = 0
        delta_dislike = 0
        if old_value == new_value:
            return
        if old_value == 1:
            delta_like -= 1
        if old_value == -1:
            delta_dislike -= 1
        if new_value == 1:
            delta_like += 1
        if new_value == -1:
            delta_dislike += 1
        await session.execute(
            update(Prompt)
            .where(Prompt.id == prompt_id)
            .values(
                likes=Prompt.likes + delta_like,
                dislikes=Prompt.dislikes + delta_dislike,
            )
        )

    @staticmethod
    async def get_vote(session: AsyncSession, prompt_id: int, user_id: UUID) -> PromptVote | None:
        result = await session.execute(
            select(PromptVote).where(PromptVote.prompt_id == prompt_id, PromptVote.user_id == user_id)
        )
        return result.scalar_one_or_none()
