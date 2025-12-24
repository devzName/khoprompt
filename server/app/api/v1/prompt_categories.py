from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession, get_current_user
from app.repositories.prompt_category_repo import PromptCategoryRepository
from app.schemas.prompt_category import (
    PromptCategoryCreate,
    PromptCategoryOut,
    PromptCategoryUpdate,
    PromptCategoryStats,
)

router = APIRouter()


@router.get("/", response_model=list[PromptCategoryOut])
async def list_categories(session: DbSession) -> list[PromptCategoryOut]:
    return await PromptCategoryRepository.get_all(session)


@router.get("/stats", response_model=list[PromptCategoryStats])
async def get_categories_stats(session: DbSession) -> list[PromptCategoryStats]:
    return await PromptCategoryRepository.get_categories_with_counts(session)


@router.get("/top", response_model=list[PromptCategoryStats])
async def get_top_categories(
    session: DbSession, limit: int = 5
) -> list[PromptCategoryStats]:
    """Get top categories ordered by number of approved prompts."""
    return await PromptCategoryRepository.get_top_categories(session, limit)


@router.post("/", response_model=PromptCategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: PromptCategoryCreate,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> PromptCategoryOut:
    # Only admin/supervisor can create categories
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles and "supervisor" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    existing = await PromptCategoryRepository.get_by_slug(session, data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this slug already exists"
        )
    return await PromptCategoryRepository.create(session, data)


@router.patch("/{category_id}", response_model=PromptCategoryOut)
async def update_category(
    category_id: int,
    data: PromptCategoryUpdate,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> PromptCategoryOut:
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles and "supervisor" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    category = await PromptCategoryRepository.get_by_id(session, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    return await PromptCategoryRepository.update(session, category, data)


@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(
    category_id: int,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> None:
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    category = await PromptCategoryRepository.get_by_id(session, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    await PromptCategoryRepository.delete(session, category)
    await session.commit()
