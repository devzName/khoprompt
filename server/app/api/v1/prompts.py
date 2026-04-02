from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Query, Request, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Union
import os
import uuid
import json
from pathlib import Path

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user, get_current_user_optional
from app.services.prompt_service import PromptService
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptOut, PromptWithDetails, RejectRequest
from app.schemas.pagination import PaginatedResponse
from app.models.user import User

router = APIRouter()

@router.post("", response_model=PromptOut)
async def create_prompt(
    session: DbSession,
    current_user: User = Depends(get_current_user),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    content: str = Form(...),
    notes: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string of tag IDs
    images: List[UploadFile] = File(default=[])
):
    """Create a new prompt with form data and images (requires authentication)"""
    try:
        # Parse tags from JSON string
        tag_list = []
        if tags:
            try:
                tag_list = json.loads(tags) if isinstance(tags, str) else tags
                # Ensure it's a list of integers
                tag_list = [int(tag) for tag in tag_list if str(tag).isdigit()]
            except (json.JSONDecodeError, ValueError, TypeError):
                tag_list = []
        
        # Handle image uploads
        image_paths = []
        if images and len(images) > 0:
            # Filter out empty files
            valid_images = [img for img in images if img.filename and img.filename != '' and img.size > 0]
            
            if valid_images:
                # Create uploads directory with user email subfolder
                user_email = current_user.email.replace('@', '_').replace('.', '_')  # Sanitize email for folder name
                upload_dir = Path("uploads/prompts") / user_email
                upload_dir.mkdir(parents=True, exist_ok=True)
                
                for image in valid_images:
                    # Generate unique filename
                    file_extension = Path(image.filename).suffix
                    unique_filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = upload_dir / unique_filename
                    
                    # Save file
                    with open(file_path, "wb") as buffer:
                        image_content = await image.read()
                        buffer.write(image_content)
                    
                    # Store relative path
                    image_paths.append(str(file_path))
        
        # Create prompt data
        prompt_data = PromptCreate(
            title=title,
            description=description,
            content=content,
            notes=notes,
            category_id=category_id,
            tags=tag_list
        )
        
        result = await PromptService.create_prompt(
            session, 
            prompt_data, 
            current_user.id, 
            current_user.user_type,
            images=image_paths
        )
        return result
    except Exception as e:
        # Add more detailed error logging
        print(f"Error creating prompt: {str(e)}")
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

@router.get("/my/stats")
async def get_my_prompt_stats(
    session: DbSession,
    current_user: User = Depends(get_current_user),
):
    """Get prompt counts grouped by status for the current user."""
    from app.repositories.prompt_repo import PromptRepository
    stats = await PromptRepository.get_user_prompt_stats(session, current_user.id)
    return stats


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

@router.get("/trending", response_model=list[PromptWithDetails])
async def get_trending_prompts(
    session: DbSession,
    days: int = Query(7, ge=1, le=90, description="Window in days"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    """Get trending approved prompts scored by recent views + likes (public access)."""
    return await PromptService.get_trending_prompts(session, days=days, limit=limit)

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

@router.get("", response_model=PaginatedResponse[PromptWithDetails])
async def get_approved_prompts(
    session: DbSession,
    category_id: int | None = None,
    search: str | None = None,
    tag: str | None = None,
    tag_id: int | None = None,
    ai_model: Optional[str] = Query(None, description="Filter by AI model (e.g. gpt-4o)"),
    page: int = 1,
    limit: int = 9
):
    """Get approved prompts (public access)"""
    result = await PromptService.get_approved_prompts_paginated(session, category_id, search, tag, tag_id, page, limit, ai_model)
    return result

@router.patch("/{prompt_id}", response_model=PromptOut)
async def update_prompt(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user),
    # For JSON data
    prompt_data: Optional[PromptUpdate] = None,
    # For form data
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),
    existingImages: Optional[str] = Form(None),  # JSON string of existing images to keep
    images: List[UploadFile] = File(default=[])
):
    """Update a prompt (supports both JSON and form data)"""
    try:
        current_prompt = await PromptService.get_prompt_by_id(session, prompt_id)
        if not current_prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        
        if title is not None or any([description, content, notes, category_id, tags]):
            tag_list = []
            if tags:
                try:
                    tag_list = json.loads(tags) if isinstance(tags, str) else tags
                    tag_list = [int(tag) for tag in tag_list if str(tag).isdigit()]
                except (json.JSONDecodeError, ValueError, TypeError) as e:
                    tag_list = []
            else:
                # If tags is None or empty string, we should still pass empty list to clear tags
                tag_list = []
            
            existing_images_to_keep = []
            if existingImages:
                try:
                    existing_images_to_keep = json.loads(existingImages) if isinstance(existingImages, str) else existingImages
                except (json.JSONDecodeError, TypeError):
                    existing_images_to_keep = []
            
            new_image_paths = []
            if images and len(images) > 0:
                valid_images = [img for img in images if img.filename and img.filename != '' and img.size > 0]
                
                if valid_images:
                    user_email = current_user.email.replace('@', '_').replace('.', '_')
                    upload_dir = Path("uploads/prompts") / user_email
                    upload_dir.mkdir(parents=True, exist_ok=True)
                    
                    for image in valid_images:
                        file_extension = Path(image.filename).suffix
                        unique_filename = f"{uuid.uuid4()}{file_extension}"
                        file_path = upload_dir / unique_filename
                        
                        with open(file_path, "wb") as buffer:
                            image_content = await image.read()
                            buffer.write(image_content)
                        
                        new_image_paths.append(str(file_path))
            
            final_images = existing_images_to_keep + new_image_paths
            
            update_data = PromptUpdate(
                title=title,
                description=description,
                content=content,
                notes=notes,
                category_id=category_id,
                tags=tag_list  # Always pass tag_list, even if empty
            )
            
            result = await PromptService.update_prompt(
                session, 
                prompt_id, 
                update_data, 
                current_user.id, 
                current_user.user_type,
                existing_images_to_keep=existing_images_to_keep,
                new_images=new_image_paths
            )
        else:
            if not prompt_data:
                raise HTTPException(status_code=400, detail="No data provided")
            
            result = await PromptService.update_prompt(
                session, 
                prompt_id, 
                prompt_data, 
                current_user.id, 
                current_user.user_type
            )
        if not result:
            prompt = await PromptService.get_prompt_by_id(session, prompt_id)
            if not prompt:
                raise HTTPException(status_code=404, detail="Prompt not found")
            
            if prompt["user_id"] != str(current_user.id) and current_user.user_type != 'admin':
                raise HTTPException(status_code=403, detail="Access denied: You can only edit your own prompts")
            
            raise HTTPException(status_code=400, detail="Only draft and approved prompts can be updated")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Remove the PUT endpoint since we're handling both in PATCH
# @router.put("/{prompt_id}", response_model=PromptOut)
# async def update_prompt_form_data(...)

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
    body: RejectRequest,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Reject a pending prompt with a mandatory reason (admin only)."""
    if current_user.user_type != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await PromptService.reject_prompt(session, prompt_id, current_user.id, body.rejection_reason)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found or cannot be rejected")
    return result


@router.post("/{prompt_id}/resubmit", response_model=PromptOut)
async def resubmit_prompt(
    prompt_id: int,
    session: DbSession,
    current_user: User = Depends(get_current_user)
):
    """Re-submit a rejected prompt for review (owner only).

    Clears rejection fields. Status becomes 'pending' or 'approved' based
    on the require_approval site setting.
    """
    result = await PromptService.resubmit_prompt(session, prompt_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found, access denied, or prompt is not rejected")
    return result