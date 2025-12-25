from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prompt_category import PromptCategory


class PromptCategoryRepository:

    @staticmethod
    async def get_categories_with_counts(session: AsyncSession) -> list[dict]:
        from app.models.prompt import Prompt
        from app.schemas.prompt import PromptState

        stmt = (
            select(
                PromptCategory.id,
                PromptCategory.name,
                PromptCategory.slug,
                PromptCategory.description,
                PromptCategory.description_vi,
                PromptCategory.display_order,
                func.count(Prompt.id).label("prompt_count")
            )
            .outerjoin(Prompt, (Prompt.category_id == PromptCategory.id) & (Prompt.state == PromptState.APPROVED.value) & (Prompt.is_deleted.is_(False)))
            .group_by(PromptCategory.id)
            .order_by(PromptCategory.display_order.nulls_last(), PromptCategory.name)
        )
        result = await session.execute(stmt)
        return [dict(row._asdict()) for row in result.all()]
