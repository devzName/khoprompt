"""seed_prompt_categories

Revision ID: bac763ec5046
Revises: 
Create Date: 2025-12-25 10:26:38.819991
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text, Integer
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'bac763ec5046'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the prompt_categories table if it doesn't exist
    op.create_table(
        'prompt_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('description_vi', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    
    # Create indexes
    op.create_index('ix_prompt_categories_name', 'prompt_categories', ['name'])
    op.create_index('ix_prompt_categories_slug', 'prompt_categories', ['slug'])

    # Define the table structure for inserting data
    prompt_categories = table(
        'prompt_categories',
        column('name', String),
        column('slug', String),
        column('description', Text),
        column('description_vi', Text),
        column('display_order', Integer),
    )

    # Seed categories based on getIcon function from Categories.jsx
    categories_data = [
        {
            'name': 'HR',
            'slug': 'hr',
            'description': 'Human Resources related prompts for recruitment, employee management, and HR operations',
            'description_vi': 'Các prompt liên quan đến Nhân sự cho tuyển dụng, quản lý nhân viên và vận hành nhân sự',
            'display_order': 1,
        },
        {
            'name': 'Administration',
            'slug': 'administration',
            'description': 'Administrative tasks and office management prompts',
            'description_vi': 'Các prompt về công việc hành chính và quản lý văn phòng',
            'display_order': 2,
        },
        {
            'name': 'Testing',
            'slug': 'testing',
            'description': 'Software testing, QA, and quality assurance prompts',
            'description_vi': 'Các prompt về kiểm thử phần mềm, QA và đảm bảo chất lượng',
            'display_order': 3,
        },
        {
            'name': 'Development',
            'slug': 'development',
            'description': 'Software development, coding, and programming prompts',
            'description_vi': 'Các prompt về phát triển phần mềm, lập trình và coding',
            'display_order': 4,
        },
        {
            'name': 'Business Analysis',
            'slug': 'business-analysis',
            'description': 'Business analysis, requirements gathering, and process optimization prompts',
            'description_vi': 'Các prompt về phân tích kinh doanh, thu thập yêu cầu và tối ưu hóa quy trình',
            'display_order': 5,
        },
        {
            'name': 'Project Management',
            'slug': 'project-management',
            'description': 'Project planning, tracking, and management prompts',
            'description_vi': 'Các prompt về lập kế hoạch, theo dõi và quản lý dự án',
            'display_order': 6,
        },
        {
            'name': 'Design',
            'slug': 'design',
            'description': 'UI/UX design, graphic design, and creative prompts',
            'description_vi': 'Các prompt về thiết kế UI/UX, thiết kế đồ họa và sáng tạo',
            'display_order': 7,
        },
        {
            'name': 'Marketing',
            'slug': 'marketing',
            'description': 'Marketing, advertising, and promotional content prompts',
            'description_vi': 'Các prompt về marketing, quảng cáo và nội dung khuyến mãi',
            'display_order': 8,
        },
        {
            'name': 'Data Analysis',
            'slug': 'data-analysis',
            'description': 'Data analysis, statistics, and data science prompts',
            'description_vi': 'Các prompt về phân tích dữ liệu, thống kê và khoa học dữ liệu',
            'display_order': 9,
        },
        {
            'name': 'Other',
            'slug': 'other',
            'description': 'General prompts and miscellaneous content that don\'t fit into specific categories',
            'description_vi': 'Các prompt chung và nội dung linh tinh không thuộc các danh mục cụ thể',
            'display_order': 10,
        },
    ]

    # Insert the seed data
    op.bulk_insert(prompt_categories, categories_data)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_prompt_categories_slug', 'prompt_categories')
    op.drop_index('ix_prompt_categories_name', 'prompt_categories')
    # Drop the entire table
    op.drop_table('prompt_categories')

