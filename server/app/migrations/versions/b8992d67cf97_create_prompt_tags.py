"""create_prompt_tags

Revision ID: b8992d67cf97
Revises: 001_create_users_table
Create Date: 2025-12-26 11:15:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b8992d67cf97'
down_revision = '001_create_users_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the prompt_tags table
    op.create_table(
        'prompt_tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['prompt_categories.id'], ondelete='CASCADE')
    )
    
    # Create indexes
    op.create_index('ix_prompt_tags_name', 'prompt_tags', ['name'])
    op.create_index('ix_prompt_tags_category_id', 'prompt_tags', ['category_id'])


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_prompt_tags_category_id', 'prompt_tags')
    op.drop_index('ix_prompt_tags_name', 'prompt_tags')
    # Drop the entire table (foreign key will be dropped automatically)
    op.drop_table('prompt_tags')