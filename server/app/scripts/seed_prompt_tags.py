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

from app.models.prompt_tag import PromptTag
from app.models.prompt import Prompt
from app.core.config import get_settings

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

async def seed_tags():
    settings = get_settings()
    db_url = settings.database_url
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
    # Basic regex to extract tags. Tags are inside arrays like tags: ['AI', 'Productivity']
    tag_matches = re.findall(r"tags:\s*\[(.*?)\]", content)
    unique_tags = set()
    for match in tag_matches:
        tags = [t.strip().strip("'").strip('"') for t in match.split(',')]
        for t in tags:
            if t:
                unique_tags.add(t)
    
    async with async_session() as session:
        # Create unique tags
        for t_name in unique_tags:
            slug = slugify(t_name)
            stmt = select(PromptTag).where(PromptTag.slug == slug)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                print(f"Adding tag: {t_name} ({slug})")
                session.add(PromptTag(name=t_name, slug=slug))
        
        await session.commit()
        
        # Link existing prompts to tags
        result = await session.execute(select(Prompt))
        prompts = result.scalars().all()
        for prompt in prompts:
            if not prompt.tag_refs and prompt.tags:
                print(f"Linking prompt '{prompt.title}' with tags {prompt.tags}")
                for t_name in prompt.tags:
                    slug = slugify(t_name)
                    tag_result = await session.execute(select(PromptTag).where(PromptTag.slug == slug))
                    tag = tag_result.scalar_one_or_none()
                    if tag:
                        prompt.tag_refs.append(tag)
        
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_tags())
