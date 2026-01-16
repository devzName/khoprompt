"""
Script to drop prompt_tags tables
Run: python -m app.scripts.drop_tags_tables
"""
import asyncio
import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import get_settings


async def drop_tags_tables():
    """Drop prompt_tags and related tables"""
    settings = get_settings()
    db_url = settings.database_url
    
    # If running from host but .env has 'db' (container name)
    if 'db:5432' in db_url:
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        print("Dropping prompt_tags_association table...")
        await conn.execute(text("DROP TABLE IF EXISTS prompt_tags_association CASCADE"))
        
        print("Dropping prompt_tags table...")
        await conn.execute(text("DROP TABLE IF EXISTS prompt_tags CASCADE"))
        
        print("✅ Tables dropped successfully!")
        print("\nNow run:")
        print("  poetry run alembic upgrade head")
        print("  poetry run python -m app.scripts.seed_tags")


if __name__ == "__main__":
    asyncio.run(drop_tags_tables())
