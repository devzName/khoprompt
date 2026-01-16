from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.auth_deps import AdminUser
from app.services.prompt_tag_service import PromptTagService
from app.schemas.prompt_tag import PromptTagOut, PromptTagCreate, PromptTagUpdate

router = APIRouter()

@router.get("/", response_model=list[PromptTagOut])
async def get_all_tags(session: DbSession):
    return await PromptTagService.get_all_tags(session)

@router.post("/", response_model=PromptTagOut)
async def create_tag(
    tag_data: PromptTagCreate,
    session: DbSession,
    admin: AdminUser
):
    try:
        return await PromptTagService.create_tag(session, tag_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{tag_id}", response_model=PromptTagOut)
async def update_tag(
    tag_id: int,
    tag_data: PromptTagUpdate,
    session: DbSession,
    admin: AdminUser
):
    try:
        result = await PromptTagService.update_tag(session, tag_id, tag_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: int,
    session: DbSession,
    admin: AdminUser
):
    """
    Delete a tag and automatically remove it from all prompts that use it.
    """
    result = await PromptTagService.delete_tag(session, tag_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )
    return result