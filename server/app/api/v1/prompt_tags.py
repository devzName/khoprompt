from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import DbSession, get_current_user
from app.repositories.prompt_tag_repo import PromptTagRepository
from app.schemas.prompt_tag import PromptTagCreate, PromptTagOut, PromptTagUpdate

router = APIRouter()

@router.get("/", response_model=list[PromptTagOut])
async def list_tags(session: DbSession) -> list[PromptTagOut]:
    return await PromptTagRepository.get_all(session)

@router.post("/", response_model=PromptTagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(
    data: PromptTagCreate,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> PromptTagOut:
    # Only admin/supervisor can create tags
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles and "supervisor" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    existing = await PromptTagRepository.get_by_slug(session, data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Tag with this slug already exists"
        )
    return await PromptTagRepository.create(session, data)

@router.patch("/{tag_id}", response_model=PromptTagOut)
async def update_tag(
    tag_id: int,
    data: PromptTagUpdate,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> PromptTagOut:
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles and "supervisor" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    tag = await PromptTagRepository.get_by_id(session, tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    return await PromptTagRepository.update(session, tag, data)

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> None:
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete tags")

    tag = await PromptTagRepository.get_by_id(session, tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    await PromptTagRepository.delete(session, tag)
