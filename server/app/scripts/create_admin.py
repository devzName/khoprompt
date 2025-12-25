#!/usr/bin/env python3

import asyncio
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.core.security import hash_password


async def create_admin_user():
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:Tinhvan123@localhost:5432/app")
    
    # Only swap db to localhost if NOT running in Docker
    if 'db:5432' in db_url and not os.getenv("IS_IN_DOCKER"):
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        admin_email = "admin@gmail.com"
        admin_password = "admin123"
        
        from sqlalchemy import select
        stmt = select(User).where(User.email == admin_email)
        result = await session.execute(stmt)
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print(f"Admin user {admin_email} already exists")
            return
        
        admin_user = User(
            email=admin_email,
            full_name="System Administrator",
            user_type="admin",
            password_hash=hash_password(admin_password),
            is_active=True,
            avatar_url="https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=200"
        )
        
        session.add(admin_user)
        await session.commit()
        
        print(f"Created admin user:")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print("Please change the password after first login!")


if __name__ == "__main__":
    asyncio.run(create_admin_user())