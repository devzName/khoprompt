"""prompt votes table

Revision ID: 20251223_0012
Revises: 20251223_0011
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa

revision = "20251223_0012"
down_revision = "20251223_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "prompt_votes",
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("prompt_id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.CheckConstraint("value in (-1, 1)", name="ck_prompt_votes_value"),
        sa.UniqueConstraint("user_id", "prompt_id", name="uq_prompt_votes_user_prompt"),
    )


def downgrade() -> None:
    op.drop_table("prompt_votes")
