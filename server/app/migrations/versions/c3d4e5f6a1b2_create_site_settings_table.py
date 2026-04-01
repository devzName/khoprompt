"""create_site_settings_table

Revision ID: c3d4e5f6a1b2
Revises: b2c3d4e5f6a1
Create Date: 2026-04-01 16:09:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a1b2'
down_revision = 'b2c3d4e5f6a1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'site_settings',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id']),
        sa.PrimaryKeyConstraint('key'),
    )

    # Seed default settings
    site_settings = table(
        'site_settings',
        column('key', String),
        column('value', String),
        column('description', Text),
    )
    op.bulk_insert(site_settings, [
        {
            'key': 'require_approval',
            'value': 'true',
            'description': 'Require admin approval before prompt goes live',
        },
    ])


def downgrade() -> None:
    op.drop_table('site_settings')
