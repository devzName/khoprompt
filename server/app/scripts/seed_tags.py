"""
Script to seed tags data with correct category_id from database
Run: python -m app.scripts.seed_tags
"""
import asyncio
import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.prompt_category import PromptCategory
from app.models.prompt_tag import PromptTag


# Tags organized by category slug
TAGS_BY_CATEGORY = {
    'hr': [
        'Recruitment',
        'Interview',
        'Onboarding',
        'Performance Review',
        'Training',
    ],
    'administration': [
        'Documentation',
        'Meeting Notes',
        'Reporting',
        'Compliance',
    ],
    'testing': [
        'Jest',
        'Cypress',
        'Selenium',
        'Unit Testing',
    ],
    'development': [
        'React',
        'Vue',
        'Python',
        'Node.js',
        'Docker',
    ],
    'business-analysis': [
        'Requirements',
        'User Stories',
        'Process Flow',
        'Data Modeling',
    ],
    'project-management': [
        'Agile',
        'Scrum',
        'Kanban',
        'Risk Management',
        'Sprint Planning',
    ],
    'design': [
        'Figma',
        'UI/UX',
        'Wireframe',
        'Prototype',
    ],
    'marketing': [
        'SEO',
        'Content Writing',
        'Social Media',
        'Email Campaign',
    ],
    'data-analysis': [
        'SQL',
        'Python',
        'Tableau',
        'Power BI',
    ],
}


async def seed_tags():
    """Seed tags with correct category_id from database"""
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:Tinhvan123@localhost:5432/app")
    
    # If running from host but .env has 'db' (container name)
    if 'db:5432' in db_url and not os.getenv("IS_IN_DOCKER"):
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all categories
        result = await session.execute(select(PromptCategory))
        categories = result.scalars().all()
        
        # Create category slug to id mapping
        category_map = {cat.slug: cat.id for cat in categories}
        
        print(f"Found {len(categories)} categories:")
        for slug, cat_id in category_map.items():
            print(f"  - {slug}: {cat_id}")
        
        # Check if tags already exist
        existing_tags = await session.execute(select(PromptTag))
        if existing_tags.scalars().first():
            print("\n⚠️  Tags already exist. Skipping seed.")
            return
        
        # Insert tags
        tags_created = 0
        for category_slug, tag_names in TAGS_BY_CATEGORY.items():
            if category_slug not in category_map:
                print(f"\n⚠️  Category '{category_slug}' not found in database. Skipping...")
                continue
            
            category_id = category_map[category_slug]
            print(f"\nSeeding tags for '{category_slug}' (id={category_id}):")
            
            for tag_name in tag_names:
                tag = PromptTag(
                    name=tag_name,
                    category_id=category_id
                )
                session.add(tag)
                tags_created += 1
                print(f"  ✓ {tag_name}")
        
        await session.commit()
        print(f"\n✅ Successfully created {tags_created} tags!")


if __name__ == "__main__":
    asyncio.run(seed_tags())
