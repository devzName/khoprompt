"""create_prompt_tags

Revision ID: b8992d67cf97
Revises: 001_create_users_table
Create Date: 2025-12-26 11:15:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String


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
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create indexes
    op.create_index('ix_prompt_tags_name', 'prompt_tags', ['name'])

    # Define the table structure for inserting data
    prompt_tags = table(
        'prompt_tags',
        column('name', String),
    )

    # Seed tags data
    tags_data = [
        {'name': 'Claude'},
        {'name': 'GPT-4'},
        {'name': 'Code'},
        {'name': 'ChatGPT'},
        {'name': 'SEO'},
        {'name': 'React'},
        {'name': 'Laravel'},
        {'name': 'Marketing'},
        {'name': 'Programming'},
        {'name': 'Gemini'},
        {'name': 'Development'},
        {'name': 'Content'},
        {'name': 'PHP'},
        {'name': 'Social Media'},
        {'name': 'Học tập'},
        {'name': 'Giáo dục'},
        {'name': 'Email'},
        {'name': 'Văn phòng'},
        {'name': 'Chuyên nghiệp'},
        {'name': 'Debug'},
        {'name': 'Midjourney'},
        {'name': 'Phong cảnh'},
        {'name': 'Nghệ thuật'},
        {'name': 'Facebook'},
        {'name': 'Sáng tạo'},
        {'name': 'Viết lách'},
        {'name': 'Truyện ngắn'},
        {'name': 'Blog'},
        {'name': 'Content Marketing'},
        {'name': 'Email Marketing'},
        {'name': 'Conversion'},
        {'name': 'AIDA'},
    ]

    # Insert the seed data
    op.bulk_insert(prompt_tags, tags_data)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_prompt_tags_name', 'prompt_tags')
    # Drop the entire table
    op.drop_table('prompt_tags')