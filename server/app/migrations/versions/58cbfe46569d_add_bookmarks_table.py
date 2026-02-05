"""add bookmarks table

Revision ID: 58cbfe46569d
Revises: 7735fd4d5510
Create Date: 2026-02-05 16:40:24.478307

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '58cbfe46569d'
down_revision = '7735fd4d5510'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create bookmarks table
    op.create_table('bookmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'prompt_id', name='unique_user_prompt_bookmark')
    )
    
    # Create indexes
    op.create_index(op.f('ix_bookmarks_id'), 'bookmarks', ['id'], unique=False)
    op.create_index('ix_bookmarks_user_id', 'bookmarks', ['user_id'], unique=False)
    op.create_index('ix_bookmarks_prompt_id', 'bookmarks', ['prompt_id'], unique=False)
    op.create_index('ix_bookmarks_created_at', 'bookmarks', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_bookmarks_created_at', table_name='bookmarks')
    op.drop_index('ix_bookmarks_prompt_id', table_name='bookmarks')
    op.drop_index('ix_bookmarks_user_id', table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_id'), table_name='bookmarks')
    
    # Drop table
    op.drop_table('bookmarks')