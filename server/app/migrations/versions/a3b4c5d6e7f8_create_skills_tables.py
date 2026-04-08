"""create_skills_tables

Revision ID: a3b4c5d6e7f8
Revises: 443e5da79ab3
Create Date: 2026-04-08 15:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

revision = 'a3b4c5d6e7f8'
down_revision = '443e5da79ab3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # skills table
    op.create_table(
        'skills',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('spec', JSONB, nullable=False),
        sa.Column('tags', ARRAY(sa.String), nullable=False, server_default='{}'),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('is_public', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('approval_status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('approved_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('view_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('like_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('dislike_count', sa.Integer, nullable=False, server_default='0'),
        # AuditMixin columns
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_by', UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean, nullable=False, server_default=sa.text('false')),
    )

    # skill_compilations table
    op.create_table(
        'skill_compilations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('agent', sa.String(20), nullable=False),
        sa.Column('output', sa.Text, nullable=False),
        sa.Column('file_path', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('skill_id', 'agent', name='uq_skill_compilation_agent'),
    )
    op.create_index('ix_skill_compilations_skill_id', 'skill_compilations', ['skill_id'])

    # skill_bookmarks table
    op.create_table(
        'skill_bookmarks',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'skill_id', name='uq_user_skill_bookmark'),
    )

    # skill_votes table
    op.create_table(
        'skill_votes',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_helpful', sa.Boolean, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'skill_id', name='uq_user_skill_vote'),
    )

    # skill_views table
    op.create_table(
        'skill_views',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('viewed_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_skill_views_skill_id', 'skill_views', ['skill_id'])

    # skill_comments table
    op.create_table(
        'skill_comments',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('parent_id', sa.Integer, sa.ForeignKey('skill_comments.id', ondelete='CASCADE'), nullable=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        # AuditMixin
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_by', UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_by', UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean, nullable=False, server_default=sa.text('false')),
    )


def downgrade() -> None:
    op.drop_table('skill_comments')
    op.drop_index('ix_skill_views_skill_id', 'skill_views')
    op.drop_table('skill_views')
    op.drop_table('skill_votes')
    op.drop_table('skill_bookmarks')
    op.drop_index('ix_skill_compilations_skill_id', 'skill_compilations')
    op.drop_table('skill_compilations')
    op.drop_table('skills')
