from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_tag import PromptTag


class PromptTagRepository:

    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptTag]:
        stmt = select(PromptTag).order_by(PromptTag.name)
        result = await session.execute(stmt)
        return result.scalars().all()