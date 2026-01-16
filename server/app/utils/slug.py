import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert text to URL-friendly slug
    - Converts to lowercase
    - Removes accents/diacritics
    - Replaces spaces and special chars with hyphens
    - Removes consecutive hyphens
    """
    # Normalize unicode characters (remove accents)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    
    # Remove all non-alphanumeric characters except hyphens
    text = re.sub(r'[^\w-]', '', text)
    
    # Remove consecutive hyphens
    text = re.sub(r'-+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text


# Alias for backward compatibility
create_slug = slugify


def ensure_unique_slug(base_slug: str, existing_slugs: list[str]) -> str:
    """
    Generate a unique slug by appending numbers if slug already exists in the list
    
    Args:
        base_slug: The base slug to start with
        existing_slugs: List of existing slugs to check against
    
    Returns:
        A unique slug
    """
    slug = base_slug
    counter = 1
    
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug


async def generate_unique_slug(base_slug: str, check_exists_func, max_attempts: int = 100) -> str:
    """
    Generate a unique slug by appending numbers if slug already exists
    
    Args:
        base_slug: The base slug to start with
        check_exists_func: Async function that checks if slug exists (returns bool)
        max_attempts: Maximum number of attempts to find unique slug
    
    Returns:
        A unique slug
    """
    slug = base_slug
    counter = 1
    
    while await check_exists_func(slug) and counter < max_attempts:
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug
