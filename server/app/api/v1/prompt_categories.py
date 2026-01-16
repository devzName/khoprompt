from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.auth_deps import AdminUser
from app.services.prompt_category_service import PromptCategoryService
from app.schemas.prompt_category import PromptCategoryStatsResponse, PromptCategoryOut, PromptCategoryCreate, PromptCategoryUpdate

router = APIRouter()

@router.get("/stats", response_model=PromptCategoryStatsResponse)
async def get_categories_stats(session: DbSession):
    return await PromptCategoryService.get_categories_with_stats(session)

@router.get("/tree")
async def get_categories_tree(session: DbSession):
    return await PromptCategoryService.get_categories_with_tags(session)

@router.get("/", response_model=list[PromptCategoryOut])
async def get_all_categories(session: DbSession):
    return await PromptCategoryService.get_all_categories(session)

@router.post("/", response_model=PromptCategoryOut)
async def create_category(
    category_data: PromptCategoryCreate,
    session: DbSession,
    admin: AdminUser
):
    try:
        return await PromptCategoryService.create_category(session, category_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{category_id}", response_model=PromptCategoryOut)
async def update_category(
    category_id: int,
    category_data: PromptCategoryUpdate,
    session: DbSession,
    admin: AdminUser
):
    try:
        result = await PromptCategoryService.update_category(session, category_id, category_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    session: DbSession,
    admin: AdminUser
):
    """
    Delete a category and automatically move all its prompts to 'other' category.
    All tags will be removed from the moved prompts.
    """
    result = await PromptCategoryService.delete_category(session, category_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if "not found" in result["message"].lower() else status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    return result

