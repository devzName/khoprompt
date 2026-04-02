from __future__ import annotations

from uuid import UUID

from fastapi import BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_action(
    db: AsyncSession,
    user_id: UUID | None,
    action: str,
    request: Request,
    extra: dict | None = None,
) -> None:
    """Write an audit log entry to the database.

    Designed to run as a background task to avoid adding latency to responses.
    Never log passwords, tokens, or other sensitive credentials in extra.
    """
    ip = request.client.host if request.client else None
    ua = (request.headers.get("user-agent") or "")[:500]

    entry = AuditLog(
        user_id=user_id,
        action=action,
        ip_address=ip,
        user_agent=ua,
        extra=extra,
    )
    db.add(entry)
    await db.commit()


def schedule_audit_log(
    background_tasks: BackgroundTasks,
    db: AsyncSession,
    user_id: UUID | None,
    action: str,
    request: Request,
    extra: dict | None = None,
) -> None:
    """Enqueue an audit log write as a background task."""
    background_tasks.add_task(log_action, db, user_id, action, request, extra)
