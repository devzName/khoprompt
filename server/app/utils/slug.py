import re
import unicodedata
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.prompt import Prompt


def create_slug(text: str) -> str:
    """Create a URL-friendly slug from text"""
    if not text:
        return ""
    
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces and special characters with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text


async def ensure_unique_slug(session: AsyncSession, base_slug: str, prompt_id: int = None) -> str:
    """Ensure slug is unique by appending numbers if necessary"""
    slug = base_slug
    counter = 1
    
    while True:
        # Check if slug exists (excluding current prompt if updating)
        stmt = select(Prompt).where(Prompt.slug == slug)
        if prompt_id:
            stmt = stmt.where(Prompt.id != prompt_id)
            
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if not existing:
            return slug
            
        # Append counter and try again
        slug = f"{base_slug}-{counter}"
        counter += 1