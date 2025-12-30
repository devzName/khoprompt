import re
import unicodedata


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


def ensure_unique_slug(base_slug: str, existing_slugs: list[str]) -> str:
    """Ensure slug is unique by appending numbers if necessary"""
    slug = base_slug
    counter = 1
    
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    return slug