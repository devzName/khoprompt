"""seed_prompt_categories

Revision ID: bac763ec5046
Revises: 46d7233375b6
Create Date: 2025-12-25 10:26:38.819991
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text, Integer
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'bac763ec5046'
down_revision = '46d7233375b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns
    op.add_column('prompt_categories', sa.Column('description_vi', sa.Text(), nullable=True))
    op.add_column('prompt_categories', sa.Column('display_order', sa.Integer(), nullable=True))

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
    # Delete all seeded categories
    op.execute(
        """
        DELETE FROM prompt_categories
        WHERE slug IN (
            'hr', 'administration', 'testing', 'development',
            'business-analysis', 'project-management', 'design',
            'marketing', 'data-analysis', 'other'
        )
        """
    )

    # Drop the new columns
    op.drop_column('prompt_categories', 'display_order')
    op.drop_column('prompt_categories', 'description_vi')

