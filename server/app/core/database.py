from collections.abc import AsyncGenerator
import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# SSL config for development only
connect_args = {}
if os.getenv("IS_IN_DOCKER") == "true" or os.getenv("ENV") == "development":
    connect_args = {"ssl": False}

engine = create_async_engine(
    settings.database_url, 
    echo=settings.database_echo, 
    pool_pre_ping=True,
    connect_args=connect_args
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

