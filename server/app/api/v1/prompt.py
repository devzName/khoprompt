from __future__ import annotations

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status

from app.api.deps import DbSession, get_current_user, get_optional_current_user
from app.schemas.prompt import PromptCreate, PromptOut, PromptState, PromptUpdate
from app.services.prompt_service import (
    PromptCreateError,
    PromptNotFoundError,
    PromptPermissionError,
    PromptSeedError,
    PromptService,
)

router = APIRouter()


@router.get("", response_model=list[PromptOut])
async def list_prompts(
    session: DbSession,
    current_user=Depends(get_current_user),
    q: str | None = None,
    category: str | None = None,
    category_id: int | None = Query(default=None, alias="categoryId"),
    tag: str | None = None,
    featured: bool | None = None,
    state: PromptState | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[PromptOut]:
    items, _total = await PromptService.list_prompts(
        session,
        q=q,
        category=category,
        category_id=category_id,
        tag=tag,
        featured=featured,
        state=state,
        limit=limit,
        offset=offset,
        current_user=current_user,
    )
    return items

@router.get("/me", response_model=list[PromptOut])
async def list_my_prompts(
    session: DbSession,
    current_user=Depends(get_current_user),
    q: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[PromptOut]:
    items, _total = await PromptService.list_my_prompts(
        session,
        q=q,
        limit=limit,
        offset=offset,
        current_user=current_user,
    )
    return items


@router.get("/top", response_model=list[PromptOut])
async def top_prompts(
    session: DbSession,
    limit: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_optional_current_user),
) -> list[PromptOut]:
    return await PromptService.top_prompts(session, limit)


@router.get("/recent", response_model=list[PromptOut])
async def recent_prompts(session: DbSession, limit: int = Query(default=10, ge=1, le=100)) -> list[PromptOut]:
    return await PromptService.top_recent_prompts(session, limit)


@router.get("/stats/created_last_hour")
async def stats_created_last_hour() -> dict[str, int]:
    count = await PromptService.get_created_last_hour()
    return {"count": count}


@router.post("/seed", status_code=200)
async def seed_from_mock(session: DbSession, source_path: str | None = None) -> dict[str, int]:
    path = Path(source_path) if source_path else None
    try:
        return await PromptService.seed_from_mock_js(session, source_path=path)
    except PromptSeedError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{prompt_id}", response_model=PromptOut)
async def get_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_optional_current_user)
) -> PromptOut:
    try:
        return await PromptService.get_prompt(session, prompt_id, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("", response_model=PromptOut, status_code=201)
async def create_prompt(
    data: PromptCreate, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        resp = await PromptService.create_prompt(session, data, current_user)
        await PromptService.increment_created_counter()
        return resp
    except PromptCreateError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.patch("/{prompt_id}", response_model=PromptOut)
async def update_prompt(
    prompt_id: int, data: PromptUpdate, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        return await PromptService.update_prompt(session, prompt_id, data, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.delete("/{prompt_id}", status_code=status.HTTP_200_OK)
async def delete_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_current_user)
) -> Response:
    try:
        await PromptService.delete_prompt(session, prompt_id, current_user)
        return Response(status_code=status.HTTP_200_OK)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("/{prompt_id}/submit", response_model=PromptOut)
async def submit_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        return await PromptService.submit_prompt(session, prompt_id, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("/{prompt_id}/view", status_code=200)
async def record_view(
    prompt_id: int,
    session: DbSession,
    request: Request,
    current_user=Depends(get_optional_current_user),
    read_time: int | None = Query(None, ge=0, description="Seconds spent reading"),
    scroll_depth: int | None = Query(None, ge=0, le=100, description="Scroll percentage"),
) -> dict:
    """
    Record a validated view with anti-bot measures.
    
    Query params:
    - read_time: seconds spent reading (optional, validated >= 3s)
    - scroll_depth: percentage scrolled (optional, validated >= 30%)
    
    Returns: {"counted": bool, "reason": str}
    """
    from app.core.fingerprint import FingerprintService
    
    ip, user_agent = FingerprintService.extract_client_info(request)
    user_id = current_user.id if current_user else None

    result = await PromptService.record_view_validated(
        session, prompt_id, user_id, ip, user_agent, read_time, scroll_depth
    )

    return result


@router.post("/{prompt_id}/like", response_model=PromptOut)
async def like_prompt(prompt_id: int, session: DbSession, current_user=Depends(get_current_user)) -> PromptOut:
    try:
        return await PromptService.vote_prompt(session, prompt_id, current_user.id, 1)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/{prompt_id}/dislike", response_model=PromptOut)
async def dislike_prompt(prompt_id: int, session: DbSession, current_user=Depends(get_current_user)) -> PromptOut:
    try:
        return await PromptService.vote_prompt(session, prompt_id, current_user.id, -1)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/{prompt_id}/approve", response_model=PromptOut)
async def approve_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        return await PromptService.approve_prompt(session, prompt_id, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("/{prompt_id}/reject", response_model=PromptOut)
async def reject_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        return await PromptService.reject_prompt(session, prompt_id, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("/{prompt_id}/archive", response_model=PromptOut)
async def archive_prompt(
    prompt_id: int, session: DbSession, current_user=Depends(get_current_user)
) -> PromptOut:
    try:
        return await PromptService.archive_prompt(session, prompt_id, current_user)
    except PromptNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PromptPermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post("/debug/flush-views", status_code=200)
async def flush_views_debug(session: DbSession) -> dict:
    """Debug endpoint to manually flush Redis view counts to database."""
    result = await PromptService.flush_views_to_db(session)
    return result
