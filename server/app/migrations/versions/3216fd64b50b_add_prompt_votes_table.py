"""Add prompt votes table

Revision ID: 3216fd64b50b
Revises: 6337b7cc2afb
Create Date: 2025-12-30 17:18:21.562888

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '3216fd64b50b'
down_revision = '6337b7cc2afb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create prompt_votes table
    op.create_table(
        'prompt_votes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=False),
        sa.Column('is_helpful', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'prompt_id', name='unique_user_prompt_vote')
    )
    
    # Create indexes
    op.create_index('idx_prompt_votes_user_id', 'prompt_votes', ['user_id'])
    op.create_index('idx_prompt_votes_prompt_id', 'prompt_votes', ['prompt_id'])
    op.create_index('idx_prompt_votes_is_helpful', 'prompt_votes', ['is_helpful'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_prompt_votes_is_helpful', table_name='prompt_votes')
    op.drop_index('idx_prompt_votes_prompt_id', table_name='prompt_votes')
    op.drop_index('idx_prompt_votes_user_id', table_name='prompt_votes')
    
    # Drop table
    op.drop_table('prompt_votes')