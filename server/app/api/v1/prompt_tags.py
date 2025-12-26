from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DbSession
from app.services.prompt_tag_service import PromptTagService
from app.schemas.prompt_tag import PromptTagOut

router = APIRouter()

@router.get("/", response_model=list[PromptTagOut])
async def get_all_tags(session: DbSession):
    return await PromptTagService.get_all_tags(session)