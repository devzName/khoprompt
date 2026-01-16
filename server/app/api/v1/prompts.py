from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user, get_current_user_optional
from app.services.prompt_service import PromptService
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptOut, PromptWithDetails
from app.schemas.pagination import PaginatedResponse
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
        result = await PromptService.create_prompt(session, prompt_data, current_user.id, current_user.user_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pending", response_model=PaginatedResponse[PromptWithDetails])
async def get_pending_prompts(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 12,
    search: str | None = None
):
    """Get pending prompts for review (admin only)"""
    if current_user.user_type != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await PromptService.get_pending_prompts_paginated(session, page, limit, search)
    return result

@router.get("/all", response_model=PaginatedResponse[PromptWithDetails])
async def get_all_prompts(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 25,
    search: str | None = None,
    category: str | None = None,
    status: str | None = None,
    sort_by: str | None = None,
    sort_order: str = "desc"
):
    """Get all prompts for admin dashboard (admin only)"""
    if current_user.user_type != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await PromptService.get_all_prompts_paginated(
        session,
        page,
        limit,
        search,
        category,
        status,
        sort_by,
        sort_order
    )
    return result

@router.get("/my", response_model=PaginatedResponse[PromptWithDetails])
async def get_my_prompts(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 9,
    search: str | None = None,
    category: str | None = None,
    status: str | None = None,
    sort_by: str | None = None,
    sort_order: str = "desc"
):
    """Get current user's prompts (requires authentication)"""
    result = await PromptService.get_user_prompts_with_details_paginated(
        session, 
        current_user.id, 
        page, 
        limit, 
        search,
        category,
        status,
        sort_by,
        sort_order
    )
    return result

@router.get("/featured", response_model=list[PromptWithDetails])
async def get_featured_prompts(
    session: DbSession,
    limit: int = 6,
    category_id: int | None = None,
    tag_id: int | None = None
):
    """Get featured prompts based on engagement metrics (public access)"""
    prompts = await PromptService.get_featured_prompts(session, limit, category_id, tag_id)
    return prompts

@router.get("/{prompt_id}", response_model=PromptWithDetails)
async def get_prompt(prompt_id: int, session: DbSession):
    """Get a prompt by ID"""
    prompt = await PromptService.get_prompt_by_id(session, prompt_id)

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return prompt

@router.get("/slug/{slug}", response_model=PromptWithDetails)
async def get_prompt_by_slug(slug: str, session: DbSession):
    """Get a prompt by slug"""
    prompt = await PromptService.get_prompt_by_slug(session, slug)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.get("/", response_model=PaginatedResponse[PromptWithDetails])
async def get_approved_prompts(
    session: DbSession,
    category_id: int | None = None,
    search: str | None = None,
    tag: str | None = None,
    tag_id: int | None = None,
    page: int = 1,
    limit: int = 9
):
    """Get approved prompts (public access)"""
    result = await PromptService.get_approved_prompts_paginated(session, category_id, search, tag, tag_id, page, limit)
    return result

@router.patch("/{prompt_id}", response_model=PromptOut)
async def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Update a prompt (requires authentication and ownership, draft and approved prompts can be updated)"""
    result = await PromptService.update_prompt(session, prompt_id, prompt_data, current_user.id, current_user.user_type)
    if not result:
        # Check if prompt exists and belongs to user
        prompt = await PromptService.get_prompt_by_id(session, prompt_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        if prompt["user_id"] != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        # If prompt exists and belongs to user but update failed, it's in pending/rejected status
        raise HTTPException(status_code=400, detail="Only draft and approved prompts can be updated")
    return result

@router.post("/{prompt_id}/submit", response_model=PromptOut)
async def submit_prompt_for_review(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Submit a draft prompt for review (requires authentication and ownership)"""
    result = await PromptService.submit_prompt_for_review(session, prompt_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found, access denied, or prompt is not in draft status")
    return result

@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Delete a prompt (requires authentication and ownership)"""
    success = await PromptService.delete_prompt(session, prompt_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Prompt not found or access denied")
    return {"message": "Prompt deleted successfully"}

@router.post("/{prompt_id}/view")
async def track_prompt_view(
    prompt_id: int,
    request: Request,
    session: DbSession,
    current_user: User | None = Depends(get_current_user_optional)
):
    """Track a view for a prompt (optional authentication)"""
    try:
        user_id = current_user.id if current_user else None
        
        # Get client IP (handle proxy headers)
        client_ip = request.headers.get("x-forwarded-for")
        if client_ip:
            client_ip = client_ip.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else None
        
        # Get user agent
        user_agent = request.headers.get("user-agent")
        
        success = await PromptService.track_view(session, prompt_id, user_id, client_ip, user_agent)
        
        if success:
            return {"message": "View tracked successfully"}
        else:
            return {"message": "View not tracked (duplicate or spam prevention)"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{prompt_id}/approve", response_model=PromptOut)
async def approve_prompt(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Approve a prompt (admin only)"""
    if current_user.user_type != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await PromptService.approve_prompt(session, prompt_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found or cannot be approved")
    return result

@router.post("/{prompt_id}/reject", response_model=PromptOut)
async def reject_prompt(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Reject a prompt (admin only)"""
    if current_user.user_type != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await PromptService.reject_prompt(session, prompt_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found or cannot be rejected")
    return result