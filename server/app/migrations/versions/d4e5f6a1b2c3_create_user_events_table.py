"""create_user_events_table

Revision ID: d4e5f6a1b2c3
Revises: c3d4e5f6a1b2
Create Date: 2026-04-01 16:21:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'd4e5f6a1b2c3'
down_revision = 'c3d4e5f6a1b2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(length=30), nullable=False),
        sa.Column('prompt_id', sa.Integer(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Composite index for interest profile queries: user events by type over time
    op.create_index(
        'ix_user_events_user_type_created',
        'user_events',
        ['user_id', 'event_type', 'created_at'],
        unique=False,
    )

    # Partial index for prompt-specific lookups (skips NULLs for efficiency)
    op.create_index(
        'ix_user_events_prompt_id',
        'user_events',
        ['prompt_id'],
        unique=False,
        postgresql_where=sa.text('prompt_id IS NOT NULL'),
    )


def downgrade() -> None:
    op.drop_index('ix_user_events_prompt_id', table_name='user_events')
    op.drop_index('ix_user_events_user_type_created', table_name='user_events')
    op.drop_table('user_events')
