from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role_id", "permission_id", name="uq_role_permissions_role_perm"),)

    role_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True
    )
