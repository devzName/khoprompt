from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.skill import Skill, SkillCompilation
from app.models.skill_engagement import SkillBookmark, SkillComment, SkillVote


class SkillRepository:

    @staticmethod
    async def create(session: AsyncSession, skill_data: dict, user_id: UUID) -> Skill:
        """Persist a new Skill row and return the refreshed instance."""
        skill = Skill(**skill_data, user_id=user_id)
        session.add(skill)
        await session.commit()
        await session.refresh(skill)
        return skill

    @staticmethod
    def _base_query() -> select:
        return (
            select(Skill)
            .options(
                selectinload(Skill.compilations),
                selectinload(Skill.user),
            )
            .where(Skill.is_deleted.is_(False))
        )

    @staticmethod
    def _apply_filters(stmt, search: str | None, category: str | None, tags: list[str] | None):
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(Skill.name.ilike(pattern), Skill.description.ilike(pattern))
            )
        if category:
            stmt = stmt.where(Skill.category == category)
        if tags:
            # Match skills that have ANY of the requested tags
            stmt = stmt.where(Skill.tags.overlap(tags))
        return stmt

    @staticmethod
    async def get_by_id(session: AsyncSession, skill_id: UUID) -> Skill | None:
        stmt = SkillRepository._base_query().where(Skill.id == skill_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_paginated(
        session: AsyncSession,
        page: int,
        limit: int,
        search: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> list[Skill]:
        offset = (page - 1) * limit
        stmt = SkillRepository._base_query()
        stmt = SkillRepository._apply_filters(stmt, search, category, tags)
        stmt = stmt.order_by(Skill.created_at.desc()).offset(offset).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_count(
        session: AsyncSession,
        search: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(Skill).where(Skill.is_deleted.is_(False))
        stmt = SkillRepository._apply_filters(stmt, search, category, tags)
        result = await session.execute(stmt)
        return result.scalar_one()

    @staticmethod
    async def get_user_skills_paginated(
        session: AsyncSession, user_id: UUID, page: int, limit: int
    ) -> list[Skill]:
        offset = (page - 1) * limit
        stmt = (
            SkillRepository._base_query()
            .where(Skill.user_id == user_id)
            .order_by(Skill.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_user_skills_count(session: AsyncSession, user_id: UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(Skill)
            .where(Skill.user_id == user_id, Skill.is_deleted.is_(False))
        )
        result = await session.execute(stmt)
        return result.scalar_one()

    @staticmethod
    async def update(session: AsyncSession, skill: Skill, update_data: dict) -> Skill:
        for key, value in update_data.items():
            setattr(skill, key, value)
        await session.commit()
        await session.refresh(skill)
        return skill

    @staticmethod
    async def delete(session: AsyncSession, skill: Skill) -> None:
        """Soft-delete by setting is_deleted flag."""
        skill.is_deleted = True
        await session.commit()

    # ------------------------------------------------------------------
    # Compilation helpers
    # ------------------------------------------------------------------

    @staticmethod
    async def upsert_compilation(
        session: AsyncSession, skill_id: UUID, agent: str, output: str, file_path: str
    ) -> SkillCompilation:
        """Insert or update a compilation row for the given skill+agent pair."""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)

        stmt = select(SkillCompilation).where(
            SkillCompilation.skill_id == skill_id,
            SkillCompilation.agent == agent,
        )
        result = await session.execute(stmt)
        compilation = result.scalar_one_or_none()

        if compilation:
            compilation.output = output
            compilation.file_path = file_path
            compilation.updated_at = now
        else:
            compilation = SkillCompilation(
                skill_id=skill_id,
                agent=agent,
                output=output,
                file_path=file_path,
                created_at=now,
                updated_at=now,
            )
            session.add(compilation)

        await session.commit()
        await session.refresh(compilation)
        return compilation

    @staticmethod
    async def get_compilation(
        session: AsyncSession, skill_id: UUID, agent: str
    ) -> SkillCompilation | None:
        stmt = select(SkillCompilation).where(
            SkillCompilation.skill_id == skill_id,
            SkillCompilation.agent == agent,
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    # ------------------------------------------------------------------
    # Engagement count helpers (used by service to build response dicts)
    # ------------------------------------------------------------------

    @staticmethod
    async def get_engagement_counts(session: AsyncSession, skill_id: UUID) -> dict:
        bookmark_count = await session.scalar(
            select(func.count()).select_from(SkillBookmark).where(SkillBookmark.skill_id == skill_id)
        )
        comment_count = await session.scalar(
            select(func.count())
            .select_from(SkillComment)
            .where(SkillComment.skill_id == skill_id, SkillComment.deleted_at.is_(None))
        )
        return {
            "bookmark_count": bookmark_count or 0,
            "comment_count": comment_count or 0,
        }
