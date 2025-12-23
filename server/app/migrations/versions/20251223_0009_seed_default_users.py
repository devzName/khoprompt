"""seed default users for user/supervisor/admin roles

Revision ID: 20251223_0009
Revises: 20251223_0008
Create Date: 2025-12-23
"""

from alembic import op

revision = "20251223_0009"
down_revision = "20251223_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # bcrypt hash for sha256("password") using current security settings
    password_hash = "$2b$12$Pb8/mQjiivsTQdk0ygkWoOU9n2odignjgu2GJKYHXVaSm7HQmYJdO"
    op.execute(
        f"""
        WITH ensured_roles AS (
            INSERT INTO roles (id, name, description)
            VALUES
                (gen_random_uuid(), 'user', 'Default user'),
                (gen_random_uuid(), 'supervisor', 'Supervisor'),
                (gen_random_uuid(), 'admin', 'Administrator')
            ON CONFLICT (name) DO NOTHING
            RETURNING id, name
        ),
        role_ids AS (
            SELECT name, id FROM roles
        ),
        ins_users AS (
            INSERT INTO users (id, email, hashed_password, full_name, is_active)
            VALUES
                (gen_random_uuid(), 'user@example.com', '{password_hash}', 'Default User', true),
                (gen_random_uuid(), 'supervisor@example.com', '{password_hash}', 'Default Supervisor', true),
                (gen_random_uuid(), 'admin@example.com', '{password_hash}', 'Default Admin', true)
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email
        )
        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u
        JOIN role_ids r ON (
            (u.email = 'user@example.com' AND r.name = 'user') OR
            (u.email = 'supervisor@example.com' AND r.name = 'supervisor') OR
            (u.email = 'admin@example.com' AND r.name = 'admin')
        )
        ON CONFLICT (user_id, role_id) DO NOTHING;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM user_roles
        WHERE user_id IN (
            SELECT id FROM users WHERE email IN ('user@example.com','supervisor@example.com','admin@example.com')
        );
        DELETE FROM users WHERE email IN ('user@example.com','supervisor@example.com','admin@example.com');
        """
    )
