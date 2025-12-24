from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone
from uuid import UUID

from app.models.prompt_log import PromptLog
from app.repositories.prompt_vote_repo import PromptVoteRepository
from app.repositories.prompt_view_repo import PromptViewRepository
from app.core.redis_client import get_redis
from app.core.fingerprint import FingerprintService

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.prompt import Prompt
from app.repositories.prompt_repo import PromptRepository
from app.repositories.prompt_tag_repo import PromptTagRepository
from app.schemas.prompt import PromptCreate, PromptOut, PromptSeed, PromptState, PromptUpdate
from app.schemas.user import UserOut, UserRole
from app.services.notification_service import NotificationService
from app.services.mock_prompts_loader import (
    MockPromptsParseError,
    default_mock_prompts_path,
    load_mock_prompts_from_js,
)


class PromptServiceError(RuntimeError):
    pass


class PromptNotFoundError(PromptServiceError):
    pass


class PromptCreateError(PromptServiceError):
    pass


class PromptSeedError(PromptServiceError):
    pass


class PromptPermissionError(PromptServiceError):
    pass


class PromptService:
    SCORE_VIEW = 1
    SCORE_LIKE = 5
    SCORE_DISLIKE = -3
    @staticmethod
    def _role_names(user) -> set[str]:
        return {getattr(r, "name", str(r)) for r in getattr(user, "roles", [])}

    @staticmethod
    def _is_admin(user) -> bool:
        return UserRole.ADMIN.value in PromptService._role_names(user)

    @staticmethod
    def _is_supervisor(user) -> bool:
        return UserRole.SUPERVISOR.value in PromptService._role_names(user)

    @staticmethod
    def _is_reviewer(user: UserOut) -> bool:
        return PromptService._is_admin(user) or PromptService._is_supervisor(user)

    @staticmethod
    def _assert_can_view(prompt, user: UserOut | None) -> None:
        if prompt.state == PromptState.APPROVED.value:
            return
        if not user:
            raise PromptPermissionError("Authentication required for non-approved prompts")
        if PromptService._is_reviewer(user):
            return
        if prompt.owner_id == user.id:
            return
        raise PromptPermissionError("Not allowed to view this prompt")

    @staticmethod
    def _assert_can_edit(prompt, user: UserOut) -> None:
        if PromptService._is_admin(user):
            return
        if prompt.owner_id == user.id and prompt.state in {PromptState.DRAFT.value, PromptState.REJECTED.value}:
            return
        raise PromptPermissionError("Not allowed to edit this prompt")

    @staticmethod
    def _assert_can_delete(prompt, user: UserOut) -> None:
        if PromptService._is_admin(user):
            return
        if prompt.owner_id == user.id and prompt.state == PromptState.DRAFT.value:
            return
        raise PromptPermissionError("Not allowed to delete this prompt")

    @staticmethod
    def _assert_can_submit(prompt, user: UserOut) -> None:
        if prompt.owner_id != user.id:
            raise PromptPermissionError("Only owner can submit")
        if prompt.state not in {PromptState.DRAFT.value, PromptState.REJECTED.value}:
            raise PromptPermissionError("Prompt cannot be submitted from this state")

    @staticmethod
    def _assert_can_approve(prompt, user: UserOut) -> None:
        if not PromptService._is_reviewer(user):
            raise PromptPermissionError("Only reviewers (admin/supervisor) can approve or reject prompts")
        if prompt.state != PromptState.SUBMITTED.value:
            raise PromptPermissionError(f"Prompt must be in SUBMITTED state to be approved/rejected. Current state: {prompt.state}")

    @staticmethod
    def _assert_can_archive(prompt, user: UserOut) -> None:
        if PromptService._is_admin(user):
            return
        if prompt.owner_id == user.id and prompt.state in {PromptState.APPROVED.value, PromptState.REJECTED.value}:
            return
        raise PromptPermissionError("Not allowed to archive this prompt")

    @staticmethod
    async def list_prompts(
        session: AsyncSession,
        *,
        q: str | None,
        category: str | None,
        category_id: int | None = None,
        tag: str | None,
        featured: bool | None,
        state: PromptState | None,
        limit: int,
        offset: int,
        current_user,
    ) -> tuple[list[PromptOut], int]:
        owner_filter = None if PromptService._is_reviewer(current_user) else current_user.id
            
        state_filter = state.value if state else None
        items = await PromptRepository.list(
            session,
            q=q,
            category=category,
            category_id=category_id,
            tag=tag,
            featured=featured,
            state=state_filter,
            owner_id=owner_filter,
            limit=limit,
            offset=offset,
        )
        total = await PromptRepository.count(
            session,
            q=q,
            category=category,
            category_id=category_id,
            tag=tag,
            featured=featured,
            state=state_filter,
            owner_id=owner_filter,
        )
        return [PromptOut.model_validate(item) for item in items], total

    @staticmethod
    async def list_my_prompts(
        session: AsyncSession,
        *,
        q: str | None = None,
        limit: int,
        offset: int,
        current_user,
    ) -> tuple[list[PromptOut], int]:
        items = await PromptRepository.list(
            session,
            q=q,
            category=None,
            category_id=None,
            tag=None,
            featured=None,
            state=None,
            owner_id=current_user.id,
            limit=limit,
            offset=offset,
        )
        total = await PromptRepository.count(
            session,
            q=q,
            category=None,
            category_id=None,
            tag=None,
            featured=None,
            state=None,
            owner_id=current_user.id,
        )
        return [PromptOut.model_validate(item) for item in items], total

    @staticmethod
    async def get_prompt(session: AsyncSession, prompt_id: int, current_user) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        PromptService._assert_can_view(prompt, current_user)
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def create_prompt(session: AsyncSession, data: PromptCreate, current_user) -> PromptOut:
        try:
            payload = data.model_dump()
            tag_ids = payload.pop("tag_ids", [])
            
            prompt = await PromptRepository.create(
                session,
                data,
                owner_id=current_user.id,
                state=PromptState.DRAFT.value,
            )
            
            if tag_ids:
                for tid in tag_ids:
                    tag = await PromptTagRepository.get_by_id(session, tid)
                    if tag:
                        prompt.tag_refs.append(tag)
            
            await session.commit()
            await session.refresh(prompt)
            session.add(
                PromptLog(
                    prompt_id=prompt.id,
                    user_id=current_user.id,
                    action="create",
                    new_state=prompt.state,
                    data=data.model_dump(),
                )
            )
            return PromptOut.model_validate(prompt)
        except IntegrityError as e:
            await session.rollback()
            raise PromptCreateError("Could not create prompt") from e

    @staticmethod
    async def update_prompt(
        session: AsyncSession, prompt_id: int, data: PromptUpdate, current_user
    ) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        PromptService._assert_can_edit(prompt, current_user)
        prev_state = prompt.state
        update_data = data.model_dump(exclude_unset=True)
        tag_ids = update_data.pop("tag_ids", None)
        
        prompt = await PromptRepository.update_by_id(session, prompt_id, data)
        
        if tag_ids is not None:
            # Replace tags
            prompt.tag_refs = []
            for tid in tag_ids:
                tag = await PromptTagRepository.get_by_id(session, tid)
                if tag:
                    prompt.tag_refs.append(tag)
        
        await session.commit()
        await session.refresh(prompt)
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="update",
                old_state=prev_state,
                new_state=prompt.state,
                data=data.model_dump(exclude_none=True),
            )
        )
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def delete_prompt(session: AsyncSession, prompt_id: int, current_user) -> None:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        PromptService._assert_can_delete(prompt, current_user)
        prompt = prompt  # type: Prompt
        prompt.is_deleted = True
        prompt.deleted_at = datetime.now(timezone.utc)
        prompt.deleted_by = current_user.id
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="delete",
                old_state=prompt.state,
                new_state=prompt.state,
            )
        )
        await session.commit()

    @staticmethod
    async def submit_prompt(session: AsyncSession, prompt_id: int, current_user) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        PromptService._assert_can_submit(prompt, current_user)
        prev_state = prompt.state
        prompt.state = PromptState.SUBMITTED.value
        await session.commit()
        await session.refresh(prompt)
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="submit",
                old_state=prev_state,
                new_state=prompt.state,
            )
        )
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def approve_prompt(session: AsyncSession, prompt_id: int, current_user) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        if prompt.state == PromptState.APPROVED.value:
            return PromptOut.model_validate(prompt)
        PromptService._assert_can_approve(prompt, current_user)
        prev_state = prompt.state
        prompt.state = PromptState.APPROVED.value
        await session.commit()
        await session.refresh(prompt)
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="approve",
                old_state=prev_state,
                new_state=prompt.state,
            )
        )
        if prompt.owner_id:
            await NotificationService.notify_prompt_approved(
                session, prompt.owner_id, prompt.title, prompt.id
            )
            await session.commit()
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def reject_prompt(session: AsyncSession, prompt_id: int, current_user) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        if prompt.state == PromptState.REJECTED.value:
            return PromptOut.model_validate(prompt)
        PromptService._assert_can_approve(prompt, current_user)
        prev_state = prompt.state
        prompt.state = PromptState.REJECTED.value
        await session.commit()
        await session.refresh(prompt)
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="reject",
                old_state=prev_state,
                new_state=prompt.state,
            )
        )
        if prompt.owner_id:
            await NotificationService.notify_prompt_rejected(
                session, prompt.owner_id, prompt.title
            )
            await session.commit()
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def archive_prompt(session: AsyncSession, prompt_id: int, current_user) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        PromptService._assert_can_archive(prompt, current_user)
        prev_state = prompt.state
        prompt.state = PromptState.ARCHIVED.value
        await session.commit()
        await session.refresh(prompt)
        session.add(
            PromptLog(
                prompt_id=prompt.id,
                user_id=current_user.id,
                action="archive",
                old_state=prev_state,
                new_state=prompt.state,
            )
        )
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def seed_from_mock_js(
        session: AsyncSession, *, source_path: Path | None = None
    ) -> dict[str, int]:
        source_path = source_path or default_mock_prompts_path()
        if not source_path:
            raise PromptSeedError("mockPrompts.js not found; pass source_path or keep client/ in repo")

        try:
            records = load_mock_prompts_from_js(source_path)
        except MockPromptsParseError as e:
            raise PromptSeedError(str(e)) from e
        created = 0
        skipped = 0

        for rec in records:
            exists = await PromptRepository.get_by_id(session, rec.id)
            if exists:
                skipped += 1
                continue
            data = PromptSeed(
                id=rec.id,
                title=rec.title,
                description=rec.description,
                category=rec.category,
                tags=rec.tags,
                rating=rec.rating,
                uses=rec.uses,
                author=rec.author,
                featured=rec.featured,
                views=rec.views,
                likes=rec.likes,
                dislikes=rec.dislikes,
                full_description=rec.full_description,
                content=rec.content,
                state=PromptState.APPROVED,
            )
            await PromptRepository.create(session, data, id_override=data.id, state=data.state.value)
            created += 1

        await session.commit()
        return {"created": created, "skipped": skipped}

    @staticmethod
    async def increment_created_counter() -> None:
        try:
            redis = get_redis()
            await redis.incr("prompt:created:1h")
            await redis.expire("prompt:created:1h", 3600)
        except Exception:
            pass

    @staticmethod
    async def get_created_last_hour() -> int:
        try:
            redis = get_redis()
            val = await redis.get("prompt:created:1h")
            return int(val or 0)
        except Exception:
            return 0

    @staticmethod
    async def top_recent_prompts(session: AsyncSession, limit: int = 10) -> list[PromptOut]:
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        result = await session.execute(
            select(Prompt)
            .where(Prompt.created_at >= one_hour_ago)
            .order_by(desc(Prompt.created_at))
            .limit(limit)
        )
        prompts = result.scalars().all()
        return [PromptOut.model_validate(p) for p in prompts]

    @staticmethod
    async def register_view(prompt_id: int, fp: str | None) -> None:
        # use redis to dedupe by fingerprint
        if not fp:
            fp = f"anon-{prompt_id}-{datetime.now(timezone.utc).timestamp()}"
        redis = get_redis()
        key = f"view:{prompt_id}:{fp}"
        try:
            is_new = await redis.set(key, "1", ex=300, nx=True)
            if is_new:
                await redis.incr(f"view:{prompt_id}")
                await redis.zincrby("prompt:ranking", PromptService.SCORE_VIEW, prompt_id)
        except Exception:
            return

    @staticmethod
    async def flush_views_to_db(session: AsyncSession) -> dict[str, int]:
        redis = get_redis()
        updated = 0
        try:
            keys = await redis.keys("view:*")
            deltas: dict[int, int] = {}
            for k in keys:
                parts = k.split(":")
                if len(parts) == 2:
                    # aggregate counter
                    pid = int(parts[1])
                    deltas[pid] = int(await redis.get(k) or 0)
            for pid, delta in deltas.items():
                await session.execute(
                    update(Prompt).where(Prompt.id == pid).values(views=Prompt.views + delta)
                )
                updated += 1
            await session.commit()
            if keys:
                await redis.delete(*keys)
        except Exception:
            await session.rollback()
        return {"updated": updated}

    @staticmethod
    async def vote_prompt(session: AsyncSession, prompt_id: int, user_id, value: int) -> PromptOut:
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        if not prompt:
            raise PromptNotFoundError("Prompt not found")
        if str(prompt.owner_id) == str(user_id):
            raise PromptPermissionError("You cannot vote on your own prompt")
        old_vote = await PromptVoteRepository.get_vote(session, prompt_id, user_id)
        old_value = old_vote.value if old_vote else None
        await PromptVoteRepository.upsert_vote(session, prompt_id, user_id, value)
        await PromptVoteRepository.apply_vote_delta(session, prompt_id, old_value, value)
        await session.commit()
        prompt = await PromptRepository.get_by_id(session, prompt_id)
        # update ranking score
        try:
            redis = get_redis()
            delta_score = 0
            if old_value == 1:
                delta_score -= PromptService.SCORE_LIKE
            if old_value == -1:
                delta_score -= PromptService.SCORE_DISLIKE
            if value == 1:
                delta_score += PromptService.SCORE_LIKE
            if value == -1:
                delta_score += PromptService.SCORE_DISLIKE
            if delta_score:
                await redis.zincrby("prompt:ranking", delta_score, prompt_id)
        except Exception:
            pass
        session.add(
            PromptLog(
                prompt_id=prompt_id,
                user_id=user_id,
                action="like" if value == 1 else "dislike",
                old_state=prompt.state,
                new_state=prompt.state,
            )
        )
        return PromptOut.model_validate(prompt)

    @staticmethod
    async def top_prompts(session: AsyncSession, limit: int = 10) -> list[PromptOut]:
        redis = get_redis()
        prompts: list[Prompt] = []
        try:
            ids = await redis.zrevrange("prompt:ranking", 0, limit - 1, withscores=False)
            if ids:
                for pid in ids:
                    prompt = await PromptRepository.get_by_id(session, int(pid))
                    if prompt:
                        prompts.append(prompt)
                if len(prompts) >= limit:
                    return [PromptOut.model_validate(p) for p in prompts]
        except Exception:
            pass

        expr = (
            Prompt.views * PromptService.SCORE_VIEW
            + Prompt.likes * PromptService.SCORE_LIKE
            + Prompt.dislikes * PromptService.SCORE_DISLIKE
        )
        result = await session.execute(select(Prompt).order_by(desc(expr)).limit(limit))
        prompts = result.scalars().all()
        return [PromptOut.model_validate(p) for p in prompts]

    @staticmethod
    async def record_view_validated(
        session: AsyncSession,
        prompt_id: int,
        user_id: UUID | None,
        ip_address: str,
        user_agent: str,
        read_time: int | None = None,
        scroll_depth: int | None = None,
    ) -> dict:
        """
        Record a validated view with anti-bot measures.
        
        Returns: {"counted": bool, "reason": str}
        """
        # 1. Bot detection
        if FingerprintService.is_bot(user_agent):
            return {"counted": False, "reason": "bot_detected"}

        # 2. Validation checks
        if read_time is not None and read_time < 3:
            return {"counted": False, "reason": "insufficient_read_time"}

        if scroll_depth is not None and scroll_depth < 30:
            return {"counted": False, "reason": "insufficient_scroll"}

        # 3. Generate fingerprint for guests
        viewer_hash = None
        if not user_id:
            date_str = FingerprintService.get_date_string()
            viewer_hash = FingerprintService.generate_viewer_hash(ip_address, user_agent, date_str)

        # 4. Atomic insert (idempotent)
        is_new_view = await PromptViewRepository.try_record_view(
            session, prompt_id, user_id, viewer_hash, ip_address, user_agent, read_time, scroll_depth
        )

        if not is_new_view:
            return {"counted": False, "reason": "duplicate_view"}

        # 5. Increment counter in DB (primary) and Redis (secondary optimization)
        from sqlalchemy import update
        
        # Always update DB directly for consistency
        await session.execute(
            update(Prompt).where(Prompt.id == prompt_id).values(views=Prompt.views + 1)
        )
        
        # Also try to update Redis for hot ranking/caching
        try:
            redis = get_redis()
            await redis.zincrby("prompt:ranking", PromptService.SCORE_VIEW, prompt_id)
        except Exception:
            # Redis is optional, DB is source of truth
            pass

        await session.commit()
        return {"counted": True, "reason": "success"}
