from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class VoteCreate(BaseModel):
    prompt_id: int
    is_helpful: bool  # True = helpful, False = not helpful


class VoteResponse(BaseModel):
    id: int
    user_id: UUID
    prompt_id: int
    is_helpful: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VoteStats(BaseModel):
    prompt_id: int
    helpful_count: int = 0  # Rename to match client expectation
    not_helpful_count: int = 0  # Rename to match client expectation
    user_vote: bool | None = None  # None if user hasn't voted, True/False if voted

    @classmethod
    def from_service_response(cls, data: dict):
        """Convert service response to schema"""
        return cls(
            prompt_id=data["prompt_id"],
            helpful_count=data["like_count"],
            not_helpful_count=data["dislike_count"],
            user_vote=data["user_vote"]
        )