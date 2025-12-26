"""create_prompts_table

Revision ID: 545a3a6bdb7d
Revises: b8992d67cf97
Create Date: 2025-12-26 11:12:36.860665

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '545a3a6bdb7d'
down_revision = 'b8992d67cf97'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create prompts table
    op.create_table(
        'prompts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('full_description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('like_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('dislike_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['prompt_categories.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'])
    )
    
    # Create indexes
    op.create_index('ix_prompts_title', 'prompts', ['title'])
    op.create_index('ix_prompts_status', 'prompts', ['status'])
    
    # Create association table for many-to-many relationship between prompts and tags
    op.create_table(
        'prompt_tags_association',
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('prompt_id', 'tag_id'),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id']),
        sa.ForeignKeyConstraint(['tag_id'], ['prompt_tags.id'])
    )


def downgrade() -> None:
    # Drop association table first
    op.drop_table('prompt_tags_association')
    
    # Drop indexes
    op.drop_index('ix_prompts_status', 'prompts')
    op.drop_index('ix_prompts_title', 'prompts')
    
    # Drop prompts table
    op.drop_table('prompts')