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

    # Seed tags data based on categories
    tags_data = [
        # HR tags
        {'name': 'Recruitment'},
        {'name': 'Tuyển dụng'},
        {'name': 'Interview'},
        {'name': 'Phỏng vấn'},
        {'name': 'Employee'},
        {'name': 'Nhân viên'},
        {'name': 'Performance'},
        {'name': 'Đánh giá'},
        
        # Administration tags
        {'name': 'Office'},
        {'name': 'Văn phòng'},
        {'name': 'Document'},
        {'name': 'Tài liệu'},
        {'name': 'Quy trình'},
        {'name': 'Management'},
        {'name': 'Quản lý'},
        
        # Testing tags
        {'name': 'QA'},
        {'name': 'Testing'},
        {'name': 'Kiểm thử'},
        {'name': 'Bug'},
        {'name': 'Debug'},
        {'name': 'Quality'},
        {'name': 'Chất lượng'},
        {'name': 'Automation'},
        
        # Development tags
        {'name': 'Code'},
        {'name': 'Programming'},
        {'name': 'Lập trình'},
        {'name': 'React'},
        {'name': 'Laravel'},
        {'name': 'PHP'},
        {'name': 'JavaScript'},
        {'name': 'Python'},
        {'name': 'API'},
        {'name': 'Database'},
        
        # Business Analysis tags
        {'name': 'Requirements'},
        {'name': 'Yêu cầu'},
        {'name': 'Analysis'},
        {'name': 'Phân tích'},
        {'name': 'Process'},
        {'name': 'Workflow'},
        {'name': 'Documentation'},
        {'name': 'Specification'},
        
        # Project Management tags
        {'name': 'Planning'},
        {'name': 'Kế hoạch'},
        {'name': 'Tracking'},
        {'name': 'Theo dõi'},
        {'name': 'Agile'},
        {'name': 'Scrum'},
        {'name': 'Timeline'},
        {'name': 'Budget'},
        
        # Design tags
        {'name': 'UI/UX'},
        {'name': 'Design'},
        {'name': 'Thiết kế'},
        {'name': 'Figma'},
        {'name': 'Photoshop'},
        {'name': 'Creative'},
        {'name': 'Sáng tạo'},
        {'name': 'Prototype'},
        {'name': 'Wireframe'},
        
        # Marketing tags
        {'name': 'Marketing'},
        {'name': 'SEO'},
        {'name': 'Content Marketing'},
        {'name': 'Social Media'},
        {'name': 'Facebook'},
        {'name': 'Email Marketing'},
        {'name': 'Advertising'},
        {'name': 'Quảng cáo'},
        {'name': 'Campaign'},
        {'name': 'Conversion'},
        {'name': 'AIDA'},
        
        # Data Analysis tags
        {'name': 'Data'},
        {'name': 'Dữ liệu'},
        {'name': 'Analytics'},
        {'name': 'Statistics'},
        {'name': 'Thống kê'},
        {'name': 'Excel'},
        {'name': 'SQL'},
        {'name': 'Visualization'},
        {'name': 'Report'},
        {'name': 'Báo cáo'},
        
        # AI/General tags
        {'name': 'Claude'},
        {'name': 'GPT-4'},
        {'name': 'ChatGPT'},
        {'name': 'Gemini'},
        {'name': 'AI'},
        {'name': 'Prompt'},
        {'name': 'Content'},
        {'name': 'Nội dung'},
        {'name': 'Writing'},
        {'name': 'Viết lách'},
        {'name': 'Blog'},
        {'name': 'Email'},
        {'name': 'Professional'},
        {'name': 'Chuyên nghiệp'},
    ]

    # Insert the seed data
    op.bulk_insert(prompt_tags, tags_data)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_prompt_tags_name', 'prompt_tags')
    # Drop the entire table
    op.drop_table('prompt_tags')