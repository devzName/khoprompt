from __future__ import annotations

import math
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.repositories.skill_repo import SkillRepository
from app.schemas.pagination import PaginatedResponse, PaginationMeta
from app.schemas.skill import SkillCreate, SkillUpdate
from app.services.compilers import COMPILERS


class SkillService:

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _compile_all(spec: dict, agent_settings: dict | None) -> list[dict]:
        """Run all compilers and return list of compilation dicts."""
        results = []
        for agent, compiler in COMPILERS.items():
            output = compiler.compile(spec, agent_settings)
            file_path = compiler.file_path(spec)
            results.append({"agent": agent, "output": output, "file_path": file_path})
        return results

    @staticmethod
    async def _build_skill_dict(session: AsyncSession, skill: Skill) -> dict:
        """Serialize a Skill ORM instance to a response dict with engagement counts."""
        engagement = await SkillRepository.get_engagement_counts(session, skill.id)

        user_dict = None
        if skill.user:
            user_dict = {
                "id": skill.user.id,
                "full_name": skill.user.full_name,
                "avatar_url": skill.user.avatar_url,
            }

        compilations = [
            {"agent": c.agent, "output": c.output, "file_path": c.file_path}
            for c in (skill.compilations or [])
        ]

        return {
            "id": skill.id,
            "name": skill.name,
            "description": skill.description,
            "spec": skill.spec,
            "tags": skill.tags or [],
            "category": skill.category,
            "is_public": skill.is_public,
            "approval_status": skill.approval_status,
            "created_by": skill.created_by,
            "user": user_dict,
            "created_at": skill.created_at,
            "updated_at": skill.updated_at,
            "compilations": compilations,
            "view_count": skill.view_count,
            "like_count": skill.like_count,
            "dislike_count": skill.dislike_count,
            **engagement,
        }

    @staticmethod
    def _build_list_dict(skill: Skill, engagement: dict) -> dict:
        """Lightweight serialization for list endpoints (no compilations)."""
        user_dict = None
        if skill.user:
            user_dict = {
                "id": skill.user.id,
                "full_name": skill.user.full_name,
                "avatar_url": skill.user.avatar_url,
            }
        return {
            "id": skill.id,
            "name": skill.name,
            "description": skill.description,
            "tags": skill.tags or [],
            "category": skill.category,
            "is_public": skill.is_public,
            "approval_status": skill.approval_status,
            "created_by": skill.created_by,
            "user": user_dict,
            "created_at": skill.created_at,
            "updated_at": skill.updated_at,
            "view_count": skill.view_count,
            "like_count": skill.like_count,
            "dislike_count": skill.dislike_count,
            **engagement,
        }

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    @staticmethod
    async def create_skill(
        session: AsyncSession,
        skill_data: SkillCreate,
        user_id: UUID,
    ) -> dict:
        spec_dict = skill_data.spec.model_dump()
        agent_settings = skill_data.agent_settings.model_dump() if skill_data.agent_settings else None

        skill_dict = {
            "name": skill_data.name,
            "description": skill_data.description,
            "spec": spec_dict,
            "tags": skill_data.tags,
            "category": skill_data.category,
            "created_by": user_id,
        }

        skill = await SkillRepository.create(session, skill_dict, user_id)

        # Compile all agents and persist
        compilations_data = SkillService._compile_all(spec_dict, agent_settings)
        for comp in compilations_data:
            await SkillRepository.upsert_compilation(
                session, skill.id, comp["agent"], comp["output"], comp["file_path"]
            )

        # Reload with relationships
        skill = await SkillRepository.get_by_id(session, skill.id)
        return await SkillService._build_skill_dict(session, skill)

    @staticmethod
    async def get_skill(session: AsyncSession, skill_id: UUID) -> dict | None:
        skill = await SkillRepository.get_by_id(session, skill_id)
        if not skill:
            return None
        return await SkillService._build_skill_dict(session, skill)

    @staticmethod
    async def list_skills(
        session: AsyncSession,
        page: int,
        limit: int,
        search: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> PaginatedResponse:
        skills = await SkillRepository.get_all_paginated(session, page, limit, search, category, tags)
        total = await SkillRepository.get_count(session, search, category, tags)
        total_pages = math.ceil(total / limit) if limit else 1

        items = []
        for skill in skills:
            engagement = await SkillRepository.get_engagement_counts(session, skill.id)
            items.append(SkillService._build_list_dict(skill, engagement))

        return PaginatedResponse(
            data=items,
            pagination=PaginationMeta(
                current_page=page,
                per_page=limit,
                total=total,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_prev=page > 1,
            ),
        )

    @staticmethod
    async def update_skill(
        session: AsyncSession,
        skill_id: UUID,
        update_data: SkillUpdate,
        user_id: UUID,
    ) -> dict | None:
        skill = await SkillRepository.get_by_id(session, skill_id)
        if not skill or skill.user_id != user_id:
            return None

        agent_settings = update_data.agent_settings.model_dump() if update_data.agent_settings else None
        changes: dict = update_data.model_dump(exclude_none=True, exclude={"agent_settings"})

        # Spec provided — recompile all agents
        if "spec" in changes:
            spec_dict = changes["spec"].model_dump() if hasattr(changes["spec"], "model_dump") else changes["spec"]
            changes["spec"] = spec_dict
            compilations_data = SkillService._compile_all(spec_dict, agent_settings)
            for comp in compilations_data:
                await SkillRepository.upsert_compilation(
                    session, skill.id, comp["agent"], comp["output"], comp["file_path"]
                )

        skill = await SkillRepository.update(session, skill, changes)
        skill = await SkillRepository.get_by_id(session, skill.id)
        return await SkillService._build_skill_dict(session, skill)

    @staticmethod
    async def delete_skill(session: AsyncSession, skill_id: UUID, user_id: UUID) -> bool:
        skill = await SkillRepository.get_by_id(session, skill_id)
        if not skill or skill.user_id != user_id:
            return False
        await SkillRepository.delete(session, skill)
        return True

    @staticmethod
    async def get_compilation(session: AsyncSession, skill_id: UUID, agent: str) -> dict | None:
        compilation = await SkillRepository.get_compilation(session, skill_id, agent)
        if not compilation:
            return None
        return {
            "agent": compilation.agent,
            "output": compilation.output,
            "file_path": compilation.file_path,
        }

    @staticmethod
    async def get_user_skills_paginated(
        session: AsyncSession, user_id: UUID, page: int, limit: int
    ) -> PaginatedResponse:
        skills = await SkillRepository.get_user_skills_paginated(session, user_id, page, limit)
        total = await SkillRepository.get_user_skills_count(session, user_id)
        total_pages = math.ceil(total / limit) if limit else 1

        items = []
        for skill in skills:
            engagement = await SkillRepository.get_engagement_counts(session, skill.id)
            items.append(SkillService._build_list_dict(skill, engagement))

        return PaginatedResponse(
            data=items,
            pagination=PaginationMeta(
                current_page=page,
                per_page=limit,
                total=total,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_prev=page > 1,
            ),
        )
