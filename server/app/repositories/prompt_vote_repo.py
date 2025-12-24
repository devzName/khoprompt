from __future__ import annotations

from sqlalchemy import insert, update, select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_vote import PromptVote
from app.models.prompt import Prompt


class PromptVoteRepository:
    @staticmethod
    async def upsert_vote(session: AsyncSession, prompt_id: int, user_id, value: int) -> None:
        # upsert vote
        await session.execute(
            insert(PromptVote)
            .values(user_id=user_id, prompt_id=prompt_id, value=value)
            .on_conflict_do_update(
                index_elements=[PromptVote.user_id, PromptVote.prompt_id],
                set_={"value": value},
            )
        )

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
    async def get_vote(session: AsyncSession, prompt_id: int, user_id) -> PromptVote | None:
        result = await session.execute(
            select(PromptVote).where(PromptVote.prompt_id == prompt_id, PromptVote.user_id == user_id)
        )
        return result.scalar_one_or_none()
