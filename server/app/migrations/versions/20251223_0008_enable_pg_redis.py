"""enable pg_redis extension

Revision ID: 20251223_0008
Revises: 20251223_0007
Create Date: 2025-12-23
"""

from alembic import op

revision = "20251223_0008"
down_revision = "20251223_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_redis') THEN
            CREATE EXTENSION IF NOT EXISTS pg_redis;
          END IF;
        END$$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_redis') THEN
            DROP EXTENSION IF EXISTS pg_redis;
          END IF;
        END$$;
        """
    )
