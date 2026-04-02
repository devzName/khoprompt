"""create_audit_logs_table

Revision ID: e9e787f864dc
Revises: d4e5f6a1b2c3
Create Date: 2026-04-02 09:33:29.678203

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e9e787f864dc'
down_revision = 'd4e5f6a1b2c3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Retention policy note: 90-day cleanup recommended (scheduled job out of scope).
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('extra', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'], unique=False)
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'], unique=False)
    # Partial index: skips NULL user_id rows (login_failed entries) for efficiency
    op.create_index(
        'ix_audit_logs_user_id',
        'audit_logs',
        ['user_id'],
        unique=False,
        postgresql_where=sa.text('user_id IS NOT NULL'),
    )


def downgrade() -> None:
    op.drop_index('ix_audit_logs_user_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_action', table_name='audit_logs')
    op.drop_table('audit_logs')