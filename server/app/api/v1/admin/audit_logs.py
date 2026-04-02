from __future__ import annotations

from datetime import datetime, timezone, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession
from app.api.auth_deps import get_current_user
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("")
async def list_audit_logs(
    session: DbSession,
    current_user: User = Depends(_require_admin),
    user_id: UUID | None = Query(None),
    action: str | None = Query(None),
    from_date: datetime | None = Query(None),
    to_date: datetime | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
) -> dict:
    """Paginated audit log list with optional filters and joined username."""
    # Build base query with user join
    stmt = (
        select(AuditLog, User.email, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
    )

    if user_id is not None:
        stmt = stmt.where(AuditLog.user_id == user_id)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if from_date:
        stmt = stmt.where(AuditLog.created_at >= from_date)
    if to_date:
        stmt = stmt.where(AuditLog.created_at <= to_date)

    # Total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await session.execute(count_stmt)).scalar_one()

    # Paginated results ordered newest first
    stmt = stmt.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit)
    rows = (await session.execute(stmt)).all()

    items = [
        {
            "id": row.AuditLog.id,
            "user_id": str(row.AuditLog.user_id) if row.AuditLog.user_id else None,
            "email": row.email,
            "full_name": row.full_name,
            "action": row.AuditLog.action,
            "ip_address": row.AuditLog.ip_address,
            "user_agent": row.AuditLog.user_agent,
            "extra": row.AuditLog.extra,
            "created_at": row.AuditLog.created_at,
        }
        for row in rows
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/stats")
async def get_audit_log_stats(
    session: DbSession,
    current_user: User = Depends(_require_admin),
    days: int = Query(30, ge=1, le=365),
) -> dict:
    """Daily login counts and top active users for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Daily login_success counts
    daily_stmt = (
        select(
            func.date_trunc("day", AuditLog.created_at).label("date"),
            func.count().label("count"),
        )
        .where(AuditLog.action == "login_success")
        .where(AuditLog.created_at >= since)
        .group_by(func.date_trunc("day", AuditLog.created_at))
        .order_by(func.date_trunc("day", AuditLog.created_at))
    )
    daily_rows = (await session.execute(daily_stmt)).all()
    daily_logins = [
        {"date": row.date.strftime("%Y-%m-%d"), "count": row.count}
        for row in daily_rows
    ]

    # Top 10 users by login_success count
    top_stmt = (
        select(
            AuditLog.user_id,
            User.email,
            User.full_name,
            func.count().label("count"),
        )
        .outerjoin(User, AuditLog.user_id == User.id)
        .where(AuditLog.action == "login_success")
        .where(AuditLog.created_at >= since)
        .where(AuditLog.user_id.isnot(None))
        .group_by(AuditLog.user_id, User.email, User.full_name)
        .order_by(func.count().desc())
        .limit(10)
    )
    top_rows = (await session.execute(top_stmt)).all()
    top_users = [
        {
            "user_id": str(row.user_id),
            "email": row.email,
            "full_name": row.full_name,
            "count": row.count,
        }
        for row in top_rows
    ]

    return {"daily_logins": daily_logins, "top_users": top_users}


@router.get("/users/{user_id}/activity")
async def get_user_activity(
    user_id: UUID,
    session: DbSession,
    current_user: User = Depends(_require_admin),
) -> dict:
    """Login/logout history for a specific user over the last 90 days."""
    since = datetime.now(timezone.utc) - timedelta(days=90)

    stmt = (
        select(AuditLog)
        .where(AuditLog.user_id == user_id)
        .where(AuditLog.created_at >= since)
        .order_by(AuditLog.created_at.desc())
        .limit(200)
    )
    rows = (await session.execute(stmt)).scalars().all()

    # Fetch user info
    user_stmt = select(User).where(User.id == user_id)
    user = (await session.execute(user_stmt)).scalar_one_or_none()

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
        }
        if user
        else None,
        "activity": [
            {
                "id": row.id,
                "action": row.action,
                "ip_address": row.ip_address,
                "user_agent": row.user_agent,
                "extra": row.extra,
                "created_at": row.created_at,
            }
            for row in rows
        ],
    }
