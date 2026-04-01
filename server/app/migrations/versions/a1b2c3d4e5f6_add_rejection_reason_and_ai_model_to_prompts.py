"""add_rejection_reason_and_ai_model_to_prompts

Revision ID: a1b2c3d4e5f6
Revises: 58cbfe46569d
Create Date: 2026-04-01 16:07:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '58cbfe46569d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add rejection tracking columns (all nullable — zero downtime)
    op.add_column('prompts', sa.Column('rejection_reason', sa.Text(), nullable=True))
    op.add_column('prompts', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('prompts', sa.Column('rejected_by', postgresql.UUID(as_uuid=True), nullable=True))

    # Add AI model tag column
    op.add_column('prompts', sa.Column('ai_model', sa.String(length=50), nullable=True))

    # FK from rejected_by → users.id
    op.create_foreign_key(
        'fk_prompts_rejected_by_users',
        'prompts', 'users',
        ['rejected_by'], ['id']
    )

    # Index on ai_model for filtered queries
    op.create_index('ix_prompts_ai_model', 'prompts', ['ai_model'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_prompts_ai_model', table_name='prompts')
    op.drop_constraint('fk_prompts_rejected_by_users', 'prompts', type_='foreignkey')
    op.drop_column('prompts', 'ai_model')
    op.drop_column('prompts', 'rejected_by')
    op.drop_column('prompts', 'rejected_at')
    op.drop_column('prompts', 'rejection_reason')
