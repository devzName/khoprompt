from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user
from app.services.prompt_service import PromptService
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptOut, PromptWithDetails
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=PromptOut)
async def create_prompt(
    prompt_data: PromptCreate,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Create a new prompt (requires authentication)"""
    try:
        result = await PromptService.create_prompt(session, prompt_data, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{prompt_id}", response_model=PromptWithDetails)
async def get_prompt(prompt_id: int, session: DbSession):
    """Get a prompt by ID"""
    prompt = await PromptService.get_prompt_by_id(session, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.get("/", response_model=list[PromptWithDetails])
async def get_user_prompts(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    limit: int = 100
):
    """Get current user's prompts with tags (requires authentication)"""
    prompts = await PromptService.get_user_prompts_with_details(session, current_user.id, limit)
    return prompts

@router.patch("/{prompt_id}", response_model=PromptOut)
async def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Update a prompt (requires authentication and ownership)"""
    result = await PromptService.update_prompt(session, prompt_id, prompt_data, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found or access denied")
    return result