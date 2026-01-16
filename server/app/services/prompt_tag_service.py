from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.prompt_tag_repo import PromptTagRepository
from app.schemas.prompt_tag import PromptTagCreate, PromptTagUpdate


class PromptTagService:

    @staticmethod
    async def get_all_tags(session: AsyncSession) -> list:
        tags = await PromptTagRepository.get_all(session)
        return [{"id": tag.id, "name": tag.name, "category_id": tag.category_id} for tag in tags]

    @staticmethod
    async def create_tag(session: AsyncSession, tag_data: PromptTagCreate) -> dict:
        tag = await PromptTagRepository.create(session, tag_data.model_dump())
        return {
            "id": tag.id,
            "name": tag.name,
            "category_id": tag.category_id
        }

    @staticmethod
    async def update_tag(session: AsyncSession, tag_id: int, tag_data: PromptTagUpdate) -> dict | None:
        tag = await PromptTagRepository.get_by_id(session, tag_id)
        if not tag:
            return None
        
        updated_tag = await PromptTagRepository.update(
            session, 
            tag, 
            tag_data.model_dump(exclude_unset=True)
        )
        
        return {
            "id": updated_tag.id,
            "name": updated_tag.name,
            "category_id": updated_tag.category_id
        }

    @staticmethod
    async def delete_tag(session: AsyncSession, tag_id: int) -> bool:
        tag = await PromptTagRepository.get_by_id(session, tag_id)
        if not tag:
            return False
        
        await PromptTagRepository.delete(session, tag)
        return True