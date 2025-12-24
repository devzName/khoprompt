"""add prompt owner/state and user role

Revision ID: 20251223_0003
Revises: 20251223_0002
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20251223_0003"
down_revision = "20251223_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "prompts",
        sa.Column("state", sa.String(length=20), nullable=False, server_default=sa.text("'DRAFT'")),
    )
    op.add_column(
        "prompts",
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index("ix_prompts_state", "prompts", ["state"], unique=False)
    op.create_index("ix_prompts_owner_id", "prompts", ["owner_id"], unique=False)

    op.add_column(
        "users",
        sa.Column("role", sa.String(length=32), nullable=False, server_default=sa.text("'user'")),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
    op.drop_index("ix_prompts_owner_id", table_name="prompts")
    op.drop_index("ix_prompts_state", table_name="prompts")
    op.drop_column("prompts", "owner_id")
    op.drop_column("prompts", "state")
