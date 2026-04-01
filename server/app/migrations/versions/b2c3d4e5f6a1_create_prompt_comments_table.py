"""create_prompt_comments_table

Revision ID: b2c3d4e5f6a1
Revises: a1b2c3d4e5f6
Create Date: 2026-04-01 16:08:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a1'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'prompt_comments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        # AuditMixin columns
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['prompt_comments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_index('ix_prompt_comments_prompt_id', 'prompt_comments', ['prompt_id'], unique=False)
    op.create_index('ix_prompt_comments_user_id', 'prompt_comments', ['user_id'], unique=False)
    op.create_index('ix_prompt_comments_parent_id', 'prompt_comments', ['parent_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_prompt_comments_parent_id', table_name='prompt_comments')
    op.drop_index('ix_prompt_comments_user_id', table_name='prompt_comments')
    op.drop_index('ix_prompt_comments_prompt_id', table_name='prompt_comments')
    op.drop_table('prompt_comments')
