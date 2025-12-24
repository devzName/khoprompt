from __future__ import annotations

from contextvars import ContextVar
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import event
from sqlalchemy.orm import Session

current_actor: ContextVar[UUID | None] = ContextVar("current_actor", default=None)


def set_current_actor(user_id: UUID | None) -> None:
    current_actor.set(user_id)


@event.listens_for(Session, "before_flush", propagate=True)
def set_audit_fields(session: Session, flush_context, instances) -> None:
    actor = current_actor.get()
    now = datetime.now(timezone.utc)

    for obj in session.new:
        if hasattr(obj, "created_by") and getattr(obj, "created_by", None) is None:
            setattr(obj, "created_by", actor)
        if hasattr(obj, "updated_by"):
            setattr(obj, "updated_by", actor)
        if hasattr(obj, "updated_at"):
            setattr(obj, "updated_at", now)
        if hasattr(obj, "is_deleted") and getattr(obj, "is_deleted", None) is None:
            setattr(obj, "is_deleted", False)

    for obj in session.dirty:
        if session.is_modified(obj, include_collections=False):
            if hasattr(obj, "updated_by"):
                setattr(obj, "updated_by", actor)
            if hasattr(obj, "updated_at"):
                setattr(obj, "updated_at", now)

    for obj in list(session.deleted):
        if hasattr(obj, "is_deleted"):
            session.add(obj)
            setattr(obj, "is_deleted", True)
            if hasattr(obj, "deleted_by"):
                setattr(obj, "deleted_by", actor)
            if hasattr(obj, "deleted_at"):
                setattr(obj, "deleted_at", now)
            if hasattr(obj, "updated_by"):
                setattr(obj, "updated_by", actor)
            if hasattr(obj, "updated_at"):
                setattr(obj, "updated_at", now)
