import asyncio
import json
import re
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Mock import of models to avoid relative import issues in script
import sys
import os
sys.path.append(os.getcwd())

from app.models.prompt_category import PromptCategory
from app.models.prompt import Prompt
from app.core.config import get_settings

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

async def seed_categories():
    settings = get_settings()
    db_url = settings.database_url
    # If running from host but .env has 'db' (container name)
    if 'db:5432' in db_url:
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Path to mockPrompts.js
    mock_file = Path("../client/src/data/mockPrompts.js")
    if not mock_file.exists():
        print(f"File {mock_file} not found")
        return

    content = mock_file.read_text(encoding='utf-8')
    # Basic regex to extract categories. In a real app we'd use a JS parser or export to JSON.
    categories = set(re.findall(r"category:\s*'([^']+)'", content))
    
    async with async_session() as session:
        for cat_name in categories:
            slug = slugify(cat_name)
            stmt = select(PromptCategory).where(PromptCategory.slug == slug)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                print(f"Adding category: {cat_name} ({slug})")
                session.add(PromptCategory(name=cat_name, slug=slug))
        
        await session.commit()
        
        # Link existing prompts to categories
        result = await session.execute(select(Prompt))
        prompts = result.scalars().all()
        for prompt in prompts:
            if not prompt.category_id:
                slug = slugify(prompt.category)
                cat_result = await session.execute(select(PromptCategory).where(PromptCategory.slug == slug))
                category = cat_result.scalar_one_or_none()
                if category:
                    print(f"Linking prompt '{prompt.title}' to category '{category.name}'")
                    prompt.category_id = category.id
        
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_categories())
