"""Business logic for chat rooms and AI streaming via OpenRouter."""
from __future__ import annotations

import json
from typing import AsyncGenerator, AsyncIterator
from uuid import UUID

import openai
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.chat_room import ChatRoom
from app.models.chat_message import ChatMessage
from app.repositories.chat_repo import ChatRepository

settings = get_settings()

# Hardcoded free models from OpenRouter
FREE_MODELS = [
    {"id": "openai/gpt-oss-120b:free", "name": "GPT-OSS 120B"},
    {"id": "google/gemma-3-27b-it:free", "name": "Gemma 3 27B"},
    {"id": "mistralai/mistral-small-3.1-24b-instruct:free", "name": "Mistral Small 3.1"},
    {"id": "meta-llama/llama-4-scout:free", "name": "Llama 4 Scout"},
    {"id": "deepseek/deepseek-r1:free", "name": "DeepSeek R1"},
]

DEFAULT_MODEL = FREE_MODELS[0]["id"]


class ChatService:

    @staticmethod
    def get_free_models() -> list[dict]:
        return FREE_MODELS

    @staticmethod
    async def list_rooms(db: AsyncSession, user_id: UUID) -> list[ChatRoom]:
        return await ChatRepository.list_rooms(db, user_id)

    @staticmethod
    async def create_room(
        db: AsyncSession,
        user_id: UUID,
        title: str = "New Chat",
        model: str = DEFAULT_MODEL,
        system_prompt: str | None = None,
        source_prompt_id: int | None = None,
    ) -> ChatRoom:
        return await ChatRepository.create_room(
            db, user_id, title, model, system_prompt, source_prompt_id
        )

    @staticmethod
    async def get_room(db: AsyncSession, room_id: UUID, user_id: UUID) -> ChatRoom | None:
        return await ChatRepository.get_room(db, room_id, user_id)

    @staticmethod
    async def update_room(
        db: AsyncSession, room: ChatRoom, user_id: UUID, **kwargs
    ) -> ChatRoom:
        return await ChatRepository.update_room(db, room, user_id, **kwargs)

    @staticmethod
    async def delete_room(db: AsyncSession, room: ChatRoom, user_id: UUID) -> None:
        await ChatRepository.soft_delete_room(db, room, user_id)

    @staticmethod
    async def get_messages(
        db: AsyncSession, room_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[ChatMessage]:
        return await ChatRepository.list_messages(db, room_id, limit, offset)

    @staticmethod
    async def send_message_stream(
        db: AsyncSession,
        room: ChatRoom,
        user_id: UUID,
        content: str,
    ) -> AsyncGenerator[str, None]:
        """
        Save user message, stream AI response as SSE events, then persist assistant message.
        Yields SSE-formatted strings.
        """
        # Save user message
        await ChatRepository.create_message(db, room.id, "user", content)

        # Check API key
        if not settings.openai_api_key:
            yield _sse("error", {"message": "OpenRouter API key not configured"})
            return

        # Build message history for the LLM
        history = await ChatRepository.list_messages(db, room.id, limit=50)
        messages = []
        if room.system_prompt:
            messages.append({"role": "system", "content": room.system_prompt})
        for msg in history:
            if msg.role in ("user", "assistant"):
                messages.append({"role": msg.role, "content": msg.content})

        # Stream from OpenRouter using async client to avoid blocking the event loop
        client = openai.AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openai_api_key,
            timeout=120.0,
        )

        full_response = ""
        token_count = None
        interrupted = False

        try:
            stream = await client.chat.completions.create(
                model=room.model,
                messages=messages,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    full_response += delta
                    yield _sse("chunk", {"content": delta})

                # Capture usage if provided in final chunk
                if hasattr(chunk, "usage") and chunk.usage:
                    token_count = chunk.usage.completion_tokens

        except openai.RateLimitError:
            interrupted = True
            yield _sse("error", {"message": "Rate limited by OpenRouter. Please try again later."})
        except openai.APITimeoutError:
            interrupted = True
            yield _sse("error", {"message": "Request timed out. Please try again."})
        except Exception as e:
            interrupted = True
            yield _sse("error", {"message": f"Unexpected error: {str(e)}"})

        # Persist assistant message (even if interrupted — save partial)
        if full_response:
            save_content = full_response if not interrupted else full_response + " [interrupted]"
            await ChatRepository.create_message(
                db, room.id, "assistant", save_content, model=room.model, token_count=token_count
            )

        if not interrupted:
            yield _sse("done", {"token_count": token_count})


def _sse(event_type: str, data: dict) -> str:
    """Format a dict as an SSE data line."""
    payload = {"type": event_type, **data}
    return f"data: {json.dumps(payload)}\n\n"
