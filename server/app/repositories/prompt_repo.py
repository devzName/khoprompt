from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime, timezone

from app.models.prompt import Prompt
from app.models.prompt_tag import PromptTag
from app.models.prompt_category import PromptCategory
from app.models.prompt_view import PromptView
from app.constants.prompt_status import PromptStatus
from app.utils.slug import create_slug, ensure_unique_slug


class PromptRepository:

    @staticmethod
    async def create(session: AsyncSession, prompt_data: dict, user_id: UUID) -> Prompt:
        tag_ids = prompt_data.pop('tags', [])
        
        # Generate slug from title
        base_slug = create_slug(prompt_data['title'])
        
        # Get existing slugs to ensure uniqueness
        existing_slugs_stmt = select(Prompt.slug).where(Prompt.slug.like(f"{base_slug}%"))
        existing_slugs_result = await session.execute(existing_slugs_stmt)
        existing_slugs = [row[0] for row in existing_slugs_result.fetchall()]
        
        # Ensure unique slug
        unique_slug = ensure_unique_slug(base_slug, existing_slugs)
        
        prompt = Prompt(
            **prompt_data,
            slug=unique_slug,
            user_id=user_id,
            status=PromptStatus.DRAFT
        )
        
        if tag_ids:
            stmt = select(PromptTag).where(PromptTag.id.in_(tag_ids))
            result = await session.execute(stmt)
            tags = result.scalars().all()
            prompt.tags = tags
        
        session.add(prompt)
        await session.commit()
        await session.refresh(prompt)
        return prompt

    @staticmethod
    async def get_by_id(session: AsyncSession, prompt_id: int) -> Prompt | None:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.id == prompt_id)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(session: AsyncSession, slug: str) -> Prompt | None:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.slug == slug)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_approved_prompts_count(session: AsyncSession, category_id: int | None = None, search: str | None = None, tag: str | None = None, tag_id: int | None = None, ai_model: str | None = None) -> int:
        stmt = (
            select(func.count(Prompt.id))
            .where(Prompt.status == PromptStatus.APPROVED)
        )

        if category_id is not None:
            stmt = stmt.where(Prompt.category_id == category_id)

        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))

        if tag is not None:
            # Join with prompt_tags_association and PromptTag to filter by tag name
            stmt = stmt.join(Prompt.tags).where(PromptTag.name.ilike(f"%{tag}%"))

        if tag_id is not None:
            # Join with prompt_tags_association and PromptTag to filter by tag id
            stmt = stmt.join(Prompt.tags).where(PromptTag.id == tag_id)

        if ai_model is not None:
            stmt = stmt.where(Prompt.ai_model == ai_model)

        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_approved_prompts(session: AsyncSession, category_id: int | None = None, search: str | None = None, tag: str | None = None, tag_id: int | None = None, page: int = 1, limit: int = 9, ai_model: str | None = None) -> list[Prompt]:
        offset = (page - 1) * limit
        
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.APPROVED)
        )
        
        if category_id is not None:
            stmt = stmt.where(Prompt.category_id == category_id)
            
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
            
        if tag is not None:
            # Join with prompt_tags_association and PromptTag to filter by tag name
            stmt = stmt.join(Prompt.tags).where(PromptTag.name.ilike(f"%{tag}%"))
        
        if tag_id is not None:
            # Join with prompt_tags_association and PromptTag to filter by tag id
            stmt = stmt.join(Prompt.tags).where(PromptTag.id == tag_id)

        if ai_model is not None:
            stmt = stmt.where(Prompt.ai_model == ai_model)

        stmt = stmt.order_by(Prompt.created_at.desc()).offset(offset).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_user_prompts_count(
        session: AsyncSession, 
        user_id: UUID, 
        search: str | None = None,
        category: str | None = None,
        status: str | None = None
    ) -> int:
        stmt = select(func.count(Prompt.id)).where(Prompt.user_id == user_id)
        
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
        
        if category is not None:
            stmt = stmt.join(Prompt.category).where(PromptCategory.name == category)
        
        if status is not None:
            stmt = stmt.where(Prompt.status == status)
            
        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_user_prompts_paginated(
        session: AsyncSession, 
        user_id: UUID, 
        page: int = 1, 
        limit: int = 9, 
        search: str | None = None,
        category: str | None = None,
        status: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc"
    ) -> list[Prompt]:
        offset = (page - 1) * limit
        
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.user_id == user_id)
        )
        
        # Search filter
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
        
        # Category filter
        if category is not None:
            stmt = stmt.join(Prompt.category).where(PromptCategory.name == category)
        
        # Status filter
        if status is not None:
            stmt = stmt.where(Prompt.status == status)
        
        # Sorting
        if sort_by == "title":
            order_col = Prompt.title
        elif sort_by == "view_count":
            order_col = Prompt.view_count
        elif sort_by == "created_at":
            order_col = Prompt.created_at
        else:
            order_col = Prompt.created_at  # default
        
        if sort_order == "asc":
            stmt = stmt.order_by(order_col.asc())
        else:
            stmt = stmt.order_by(order_col.desc())
            
        stmt = stmt.offset(offset).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_pending_prompts_count(session: AsyncSession, search: str | None = None) -> int:
        stmt = select(func.count(Prompt.id)).where(Prompt.status == PromptStatus.PENDING)
        
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
            
        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_pending_prompts_paginated(session: AsyncSession, page: int = 1, limit: int = 12, search: str | None = None) -> list[Prompt]:
        offset = (page - 1) * limit
        
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.PENDING)
        )
        
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
            
        stmt = stmt.order_by(Prompt.created_at.desc()).offset(offset).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_pending_prompts(session: AsyncSession, limit: int = 100, search: str | None = None) -> list[Prompt]:
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(Prompt.status == PromptStatus.PENDING)
        )
        
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
            
        stmt = stmt.order_by(Prompt.created_at.desc()).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_featured_prompts(session: AsyncSession, limit: int = 6, category_id: int | None = None, tag_id: int | None = None) -> list[Prompt]:
        """Get featured prompts based on engagement metrics (likes, views) and recency.
        Only includes prompts with at least 1 helpful vote (like_count >= 1)."""
        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
            .where(
                Prompt.status == PromptStatus.APPROVED,
                Prompt.like_count >= 1  # At least 1 helpful vote
            )
        )
        
        if category_id is not None:
            stmt = stmt.where(Prompt.category_id == category_id)
        
        if tag_id is not None:
            # Join with prompt_tags_association and PromptTag to filter by tag id
            stmt = stmt.join(Prompt.tags).where(PromptTag.id == tag_id)
            
        stmt = stmt.order_by(
            # Order by engagement score: (like_count * 2 + view_count) descending
            (Prompt.like_count * 2 + Prompt.view_count).desc(),
            Prompt.created_at.desc()
        ).limit(limit)
        
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def update(session: AsyncSession, prompt: Prompt, update_data: dict) -> Prompt:
        # Extract tags from update_data
        tag_ids = update_data.pop('tags', None)
        
        # Check if title is being updated and regenerate slug if needed
        if 'title' in update_data and update_data['title'] != prompt.title:
            base_slug = create_slug(update_data['title'])
            
            # Get existing slugs to ensure uniqueness (excluding current prompt)
            existing_slugs_stmt = select(Prompt.slug).where(
                Prompt.slug.like(f"{base_slug}%"),
                Prompt.id != prompt.id
            )
            existing_slugs_result = await session.execute(existing_slugs_stmt)
            existing_slugs = [row[0] for row in existing_slugs_result.fetchall()]
            
            # Ensure unique slug
            unique_slug = ensure_unique_slug(base_slug, existing_slugs)
            update_data['slug'] = unique_slug
        
        # Update basic fields
        for field, value in update_data.items():
            if hasattr(prompt, field):
                setattr(prompt, field, value)
        
        # Handle tags relationship
        if tag_ids is not None:
            if len(tag_ids) > 0:
                stmt = select(PromptTag).where(PromptTag.id.in_(tag_ids))
                result = await session.execute(stmt)
                tags = result.scalars().all()
                prompt.tags = tags
            else:
                prompt.tags = []
        
        await session.commit()
        await session.refresh(prompt)
        return prompt

    @staticmethod
    async def delete(session: AsyncSession, prompt: Prompt) -> None:
        await session.delete(prompt)
        await session.commit()

    @staticmethod
    async def get_all_prompts_count(
        session: AsyncSession,
        search: str | None = None,
        category: str | None = None,
        status: str | None = None
    ) -> int:
        stmt = select(func.count(Prompt.id))
        
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))
        
        if category is not None:
            stmt = stmt.join(Prompt.category).where(PromptCategory.name == category)
        
        if status is not None:
            stmt = stmt.where(Prompt.status == status)
            
        result = await session.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_all_prompts_paginated(
        session: AsyncSession,
        page: int = 1,
        limit: int = 25,
        search: str | None = None,
        category: str | None = None,
        status: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc"
    ) -> list[Prompt]:
        offset = (page - 1) * limit

        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags)
            )
        )

        # Search filter
        if search is not None:
            stmt = stmt.where(Prompt.title.ilike(f"%{search}%"))

        # Category filter
        if category is not None:
            stmt = stmt.join(Prompt.category).where(PromptCategory.name == category)

        # Status filter
        if status is not None:
            stmt = stmt.where(Prompt.status == status)

        # Sorting
        if sort_by == "title":
            order_col = Prompt.title
        elif sort_by == "view_count":
            order_col = Prompt.view_count
        elif sort_by == "created_at":
            order_col = Prompt.created_at
        else:
            order_col = Prompt.created_at  # default

        if sort_order == "asc":
            stmt = stmt.order_by(order_col.asc())
        else:
            stmt = stmt.order_by(order_col.desc())

        stmt = stmt.offset(offset).limit(limit)
        result = await session.execute(stmt)
        return result.scalars().all()

    # ------------------------------------------------------------------
    # User stats
    # ------------------------------------------------------------------

    @staticmethod
    async def get_user_prompt_stats(session: AsyncSession, user_id: UUID) -> dict:
        """Single query: count prompts per status for the given user."""
        stmt = (
            select(Prompt.status, func.count(Prompt.id).label("cnt"))
            .where(Prompt.user_id == user_id)
            .group_by(Prompt.status)
        )
        result = await session.execute(stmt)
        rows = result.all()

        counts = {row.status: row.cnt for row in rows}
        total = sum(counts.values())
        return {
            "total": total,
            "approved": counts.get(PromptStatus.APPROVED, 0),
            "pending": counts.get(PromptStatus.PENDING, 0),
            "draft": counts.get(PromptStatus.DRAFT, 0),
            "rejected": counts.get(PromptStatus.REJECTED, 0),
        }

    # ------------------------------------------------------------------
    # Reject / re-submit helpers
    # ------------------------------------------------------------------

    @staticmethod
    async def reject_with_reason(
        session: AsyncSession,
        prompt: Prompt,
        rejection_reason: str,
        rejected_by: UUID,
    ) -> Prompt:
        """Set status=rejected and persist rejection metadata."""
        prompt.status = PromptStatus.REJECTED
        prompt.rejection_reason = rejection_reason
        prompt.rejected_at = datetime.now(timezone.utc)
        prompt.rejected_by = rejected_by
        await session.commit()
        await session.refresh(prompt)
        return prompt

    @staticmethod
    async def clear_rejection_and_submit(
        session: AsyncSession,
        prompt: Prompt,
        target_status: str,
    ) -> Prompt:
        """Clear rejection fields and move prompt to target_status (pending or approved)."""
        prompt.status = target_status
        prompt.rejection_reason = None
        prompt.rejected_at = None
        prompt.rejected_by = None
        await session.commit()
        await session.refresh(prompt)
        return prompt

    # ------------------------------------------------------------------
    # Trending
    # ------------------------------------------------------------------

    @staticmethod
    async def get_trending_prompts(
        session: AsyncSession,
        days: int = 7,
        limit: int = 10,
    ) -> list[Prompt]:
        """Return approved prompts ordered by trending score.

        score = (period_views * 0.3) + (like_count * 0.7)
        period_views = views in the last [days] days from prompt_views table.
        Falls back gracefully to view_count ordering when view table is sparse.
        """
        from sqlalchemy import literal
        from datetime import timedelta

        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        # Sub-query: count views per prompt within the period
        period_views_subq = (
            select(
                PromptView.prompt_id,
                func.count(PromptView.id).label("period_views"),
            )
            .where(PromptView.viewed_at >= cutoff)
            .group_by(PromptView.prompt_id)
            .subquery()
        )

        # Trending score — coalesce to 0 when no recent views recorded
        period_views_col = func.coalesce(period_views_subq.c.period_views, literal(0))
        score_expr = (period_views_col * 0.3 + Prompt.like_count * 0.7).label("score")

        stmt = (
            select(Prompt)
            .options(
                selectinload(Prompt.user),
                selectinload(Prompt.category),
                selectinload(Prompt.tags),
            )
            .outerjoin(period_views_subq, Prompt.id == period_views_subq.c.prompt_id)
            .where(Prompt.status == PromptStatus.APPROVED)
            .order_by(score_expr.desc(), Prompt.view_count.desc())
            .limit(limit)
        )

        result = await session.execute(stmt)
        return result.scalars().all()
