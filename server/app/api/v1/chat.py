"""Chat room and message endpoints with SSE streaming for AI responses."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from app.api.auth_deps import CurrentUser
from app.api.deps import DbSession
from app.services.chat_service import ChatService, FREE_MODELS

router = APIRouter()


# --- Pydantic schemas ---

_ALLOWED_MODELS = {m["id"] for m in FREE_MODELS}


def _validate_model(value: str) -> str:
    if value not in _ALLOWED_MODELS:
        raise ValueError(f"Model '{value}' is not in the allowed free models list")
    return value


class RoomCreate(BaseModel):
    title: str = "New Chat"
    model: str
    system_prompt: str | None = None
    source_prompt_id: int | None = None

    @field_validator("model")
    @classmethod
    def model_must_be_allowed(cls, v: str) -> str:
        return _validate_model(v)


class RoomUpdate(BaseModel):
    title: str | None = None
    model: str | None = None

    @field_validator("model")
    @classmethod
    def model_must_be_allowed(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return _validate_model(v)


class RoomOut(BaseModel):
    id: UUID
    title: str
    model: str
    system_prompt: str | None
    source_prompt_id: int | None

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    id: int
    room_id: UUID
    role: str
    content: str
    model: str | None
    token_count: int | None

    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty_and_bounded(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message content cannot be empty")
        if len(stripped) > 16000:
            raise ValueError("Message content exceeds 16,000 character limit")
        return stripped


# --- Endpoints ---

@router.get("/models")
async def list_models():
    """Return the list of available free AI models."""
    return ChatService.get_free_models()


@router.get("/rooms", response_model=list[RoomOut])
async def list_rooms(db: DbSession, current_user: CurrentUser):
    rooms = await ChatService.list_rooms(db, current_user.id)
    return rooms


@router.post("/rooms", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(body: RoomCreate, db: DbSession, current_user: CurrentUser):
    room = await ChatService.create_room(
        db,
        user_id=current_user.id,
        title=body.title,
        model=body.model,
        system_prompt=body.system_prompt,
        source_prompt_id=body.source_prompt_id,
    )
    return room


@router.patch("/rooms/{room_id}", response_model=RoomOut)
async def update_room(room_id: UUID, body: RoomUpdate, db: DbSession, current_user: CurrentUser):
    room = await ChatService.get_room(db, room_id, current_user.id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    updated = await ChatService.update_room(
        db, room, current_user.id, title=body.title, model=body.model
    )
    return updated


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: UUID, db: DbSession, current_user: CurrentUser):
    room = await ChatService.get_room(db, room_id, current_user.id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await ChatService.delete_room(db, room, current_user.id)


@router.get("/rooms/{room_id}/messages", response_model=list[MessageOut])
async def get_messages(
    room_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    room = await ChatService.get_room(db, room_id, current_user.id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    messages = await ChatService.get_messages(db, room_id, limit=limit, offset=offset)
    return messages


@router.post("/rooms/{room_id}/messages")
async def send_message(
    room_id: UUID,
    body: SendMessageRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Send a user message and stream the AI response as SSE."""
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    room = await ChatService.get_room(db, room_id, current_user.id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return StreamingResponse(
        ChatService.send_message_stream(db, room, current_user.id, body.content),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
