"""create prompts table

Revision ID: 20251223_0001
Revises:
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20251223_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "prompts",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column(
            "tags",
            postgresql.ARRAY(sa.String(length=50)),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column("rating", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("uses", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("author", sa.String(length=100), nullable=False, server_default=sa.text("'Unknown'")),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("views", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("likes", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("dislikes", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("full_description", sa.Text(), nullable=False, server_default=sa.text("''")),
        sa.Column("content", sa.Text(), nullable=False, server_default=sa.text("''")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_index("ix_prompts_category", "prompts", ["category"], unique=False)
    op.create_index("ix_prompts_featured", "prompts", ["featured"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_prompts_featured", table_name="prompts")
    op.drop_index("ix_prompts_category", table_name="prompts")
    op.drop_table("prompts")

