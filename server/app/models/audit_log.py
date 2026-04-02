from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AuditLog(Base):
    """Security audit log for tracking authentication events.

    action values: "login_success", "login_failed", "logout", "password_change"
    Retention policy: 90 days recommended (cleanup job out of scope).
    """

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    # action: login_success | login_failed | logout | password_change
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # Supports IPv4 (max 15) and IPv6 (max 45)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Flexible metadata: email_attempted, reason, etc. No passwords or tokens.
    extra: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    user = relationship("User", backref="audit_logs")
