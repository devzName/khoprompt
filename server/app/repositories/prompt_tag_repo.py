from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_tag import PromptTag


class PromptTagRepository:

    @staticmethod
    async def get_all(session: AsyncSession) -> list[PromptTag]:
        stmt = select(PromptTag).order_by(PromptTag.name)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(session: AsyncSession, tag_id: int) -> PromptTag | None:
        stmt = select(PromptTag).where(PromptTag.id == tag_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def count_prompts_using_tag(session: AsyncSession, tag_id: int) -> int:
        """Count how many prompts are using this tag"""
        from app.models.prompt import prompt_tags_association
        from sqlalchemy import func
        
        stmt = (
            select(func.count(prompt_tags_association.c.prompt_id))
            .where(prompt_tags_association.c.tag_id == tag_id)
        )
        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def create(session: AsyncSession, tag_data: dict) -> PromptTag:
        tag = PromptTag(**tag_data)
        session.add(tag)
        await session.commit()
        await session.refresh(tag)
        return tag

    @staticmethod
    async def update(session: AsyncSession, tag: PromptTag, update_data: dict) -> PromptTag:
        for key, value in update_data.items():
            setattr(tag, key, value)
        await session.commit()
        await session.refresh(tag)
        return tag

    @staticmethod
    async def delete(session: AsyncSession, tag: PromptTag) -> None:
        await session.delete(tag)
        await session.commit()

    @staticmethod
    async def remove_tag_from_all_prompts(session: AsyncSession, tag_id: int) -> int:
        """Remove tag from all prompts that use it. Returns count of affected prompts."""
        from app.models.prompt import prompt_tags_association
        from sqlalchemy import delete
        
        stmt = delete(prompt_tags_association).where(
            prompt_tags_association.c.tag_id == tag_id
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount