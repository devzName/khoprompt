from __future__ import annotations

from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.prompt import Prompt
from app.models.prompt_category import PromptCategory
from app.models.prompt_tag import PromptTag
from app.constants.prompt_status import PromptStatus


class SearchService:

    @staticmethod
    async def get_suggestions(session: AsyncSession, query: str, limit: int = 10) -> dict:
        """
        Get search suggestions for prompts, categories, and tags
        """
        query_lower = query.lower().strip()
        
        # Search prompts
        prompt_stmt = (
            select(Prompt.id, Prompt.title, PromptCategory.name.label('category'))
            .join(PromptCategory, Prompt.category_id == PromptCategory.id)
            .where(
                and_(
                    Prompt.status == PromptStatus.APPROVED,
                    or_(
                        func.lower(Prompt.title).contains(query_lower),
                        func.lower(Prompt.description).contains(query_lower)
                    )
                )
            )
            .limit(limit)
        )
        
        # Search categories
        category_stmt = (
            select(
                PromptCategory.id,
                PromptCategory.name,
                func.count(Prompt.id).label('count')
            )
            .outerjoin(Prompt, and_(
                PromptCategory.id == Prompt.category_id,
                Prompt.status == PromptStatus.APPROVED
            ))
            .where(func.lower(PromptCategory.name).contains(query_lower))
            .group_by(PromptCategory.id, PromptCategory.name)
            .limit(limit)
        )
        
        # Search tags - simplified approach
        from app.models.prompt import prompt_tags_association
        
        tag_subquery = (
            select(
                prompt_tags_association.c.tag_id,
                func.count(prompt_tags_association.c.prompt_id).label('prompt_count')
            )
            .select_from(prompt_tags_association)
            .join(Prompt, prompt_tags_association.c.prompt_id == Prompt.id)
            .where(Prompt.status == PromptStatus.APPROVED)
            .group_by(prompt_tags_association.c.tag_id)
        ).subquery()
        
        tag_stmt = (
            select(
                PromptTag.id,
                PromptTag.name,
                func.coalesce(tag_subquery.c.prompt_count, 0).label('count')
            )
            .outerjoin(tag_subquery, PromptTag.id == tag_subquery.c.tag_id)
            .where(func.lower(PromptTag.name).contains(query_lower))
            .limit(limit)
        )
        
        # Execute queries
        prompt_result = await session.execute(prompt_stmt)
        category_result = await session.execute(category_stmt)
        tag_result = await session.execute(tag_stmt)
        
        prompts = [
            {
                "id": row.id,
                "title": row.title,
                "category": row.category
            }
            for row in prompt_result.all()
        ]
        
        categories = [
            {
                "id": row.id,
                "name": row.name,
                "count": row.count
            }
            for row in category_result.all()
        ]
        
        tags = [
            {
                "id": row.id,
                "name": row.name,
                "count": row.count
            }
            for row in tag_result.all()
        ]
        
        return {
            "prompts": prompts,
            "categories": categories,
            "tags": tags
        }

    @staticmethod
    async def search_prompts(
        session: AsyncSession,
        query: str = None,
        tag: str = None,
        category: str = None,
        page: int = 1,
        limit: int = 20
    ) -> dict:
        """
        Search prompts with various filters
        """
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.category),
                selectinload(Prompt.tags),
                selectinload(Prompt.user)
            )
            .where(Prompt.status == PromptStatus.APPROVED)
        )
        
        # Apply filters
        if query:
            query_lower = query.lower().strip()
            stmt = stmt.where(
                or_(
                    func.lower(Prompt.title).contains(query_lower),
                    func.lower(Prompt.description).contains(query_lower),
                    func.lower(Prompt.content).contains(query_lower)
                )
            )
        
        if category:
            stmt = stmt.join(PromptCategory).where(
                or_(
                    PromptCategory.slug == category,
                    func.lower(PromptCategory.name) == category.lower()
                )
            )
        
        if tag:
            from app.models.prompt import prompt_tags_association
            stmt = stmt.join(
                prompt_tags_association,
                Prompt.id == prompt_tags_association.c.prompt_id
            ).join(
                PromptTag,
                prompt_tags_association.c.tag_id == PromptTag.id
            ).where(
                func.lower(PromptTag.name) == tag.lower()
            )
        
        # Count total results
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await session.execute(count_stmt)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        # Execute query
        result = await session.execute(stmt)
        prompts = result.scalars().all()
        
        # Format results
        formatted_prompts = []
        for prompt in prompts:
            formatted_prompts.append({
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "slug": prompt.slug,
                "category": {
                    "id": prompt.category.id,
                    "name": prompt.category.name,
                    "slug": prompt.category.slug
                } if prompt.category else None,
                "tags": [
                    {
                        "id": tag.id,
                        "name": tag.name
                    }
                    for tag in prompt.tags
                ],
                "user": {
                    "id": prompt.user.id,
                    "full_name": prompt.user.full_name,
                    "avatar_url": prompt.user.avatar_url
                } if prompt.user else None,
                "created_at": prompt.created_at.isoformat(),
                "view_count": prompt.view_count or 0
            })
        
        return {
            "data": formatted_prompts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }