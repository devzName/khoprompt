"""prompt log history fields

Revision ID: 20251223_0011
Revises: 20251223_0010
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20251223_0011"
down_revision = "20251223_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("prompt_logs", sa.Column("old_state", sa.String(length=20), nullable=True))
    op.add_column("prompt_logs", sa.Column("new_state", sa.String(length=20), nullable=True))
    op.add_column("prompt_logs", sa.Column("data", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("prompt_logs", "data")
    op.drop_column("prompt_logs", "new_state")
    op.drop_column("prompt_logs", "old_state")
