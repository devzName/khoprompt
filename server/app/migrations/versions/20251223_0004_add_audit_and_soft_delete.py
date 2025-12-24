"""add audit fields and soft delete

Revision ID: 20251223_0004
Revises: 20251223_0003
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20251223_0004"
down_revision = "20251223_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "prompts",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "prompts",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "prompts",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "prompts",
        sa.Column("deleted_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "prompts",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.add_column(
        "users",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "users",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("deleted_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "deleted_by")
    op.drop_column("users", "updated_by")
    op.drop_column("users", "created_by")
    op.drop_column("users", "is_deleted")

    op.drop_column("prompts", "deleted_at")
    op.drop_column("prompts", "deleted_by")
    op.drop_column("prompts", "updated_by")
    op.drop_column("prompts", "created_by")
    op.drop_column("prompts", "is_deleted")
