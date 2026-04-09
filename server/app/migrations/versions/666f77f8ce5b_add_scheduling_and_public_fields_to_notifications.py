"""add_scheduling_and_public_fields_to_notifications

Revision ID: 666f77f8ce5b
Revises: 093bc1eda71d
Create Date: 2026-04-09 10:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '666f77f8ce5b'
down_revision = '093bc1eda71d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('notifications', sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('notifications', sa.Column('status', sa.String(length=20), nullable=False, server_default='published'))
    op.add_column('notifications', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('notifications', sa.Column('show_as_modal', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(
        'ix_notifications_status_scheduled',
        'notifications',
        ['status', 'scheduled_at'],
        postgresql_where=sa.text("status = 'scheduled'"),
    )


def downgrade() -> None:
    op.drop_index('ix_notifications_status_scheduled', table_name='notifications')
    op.drop_column('notifications', 'show_as_modal')
    op.drop_column('notifications', 'is_public')
    op.drop_column('notifications', 'status')
    op.drop_column('notifications', 'scheduled_at')
