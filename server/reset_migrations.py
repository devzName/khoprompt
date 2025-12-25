#!/usr/bin/env python3

import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text


async def reset_migrations():
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:Tinhvan123@localhost:5432/app")
    
    if 'db:5432' in db_url:
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Delete migration records for the old migrations
        await session.execute(
            text("DELETE FROM alembic_version WHERE version_num IN ('001_add_users_table', '002_add_last_login_at', '003_add_user_types', '004_change_user_type_to_string')")
        )
        
        # Set current version to the base migration
        await session.execute(
            text("UPDATE alembic_version SET version_num = 'bac763ec5046'")
        )
        
        await session.commit()
        print("Reset migration history successfully")


if __name__ == "__main__":
    asyncio.run(reset_migrations())