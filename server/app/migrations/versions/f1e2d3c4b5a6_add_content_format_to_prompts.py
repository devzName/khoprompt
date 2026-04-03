"""add_content_format_to_prompts

Revision ID: f1e2d3c4b5a6
Revises: e9e787f864dc
Create Date: 2026-04-02 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1e2d3c4b5a6'
down_revision = 'e9e787f864dc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('prompts', sa.Column('content_format', sa.String(length=10), nullable=False, server_default='html'))
    op.create_index('ix_prompts_content_format', 'prompts', ['content_format'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_prompts_content_format', table_name='prompts')
    op.drop_column('prompts', 'content_format')
