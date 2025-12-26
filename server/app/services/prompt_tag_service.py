from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prompt_tag_repo import PromptTagRepository


class PromptTagService:

    @staticmethod
    async def get_all_tags(session: AsyncSession) -> list:
        tags = await PromptTagRepository.get_all(session)
        return [{"id": tag.id, "name": tag.name} for tag in tags]