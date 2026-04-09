"""
Script to seed notification data
Run: python -m app.scripts.seed_notifications
"""
import asyncio
import sys
import os
import json
from uuid import UUID

sys.path.append(os.getcwd())

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.notification import NotificationGroup, Notification, UserNotification
from app.models.user import User

# Sample notification data
NOTIFICATION_GROUPS = [
    {
        "name": "System Updates",
        "description": "Important system updates and announcements",
        "created_by": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "Community News",
        "description": "Community-wide news and updates",
        "created_by": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "User Notifications",
        "description": "Notifications specific to users",
        "created_by": "df59c630-b91c-4c36-af34-a7639a8865f8"
    }
]

NOTIFICATIONS = [
    {
        "title": "Platform Maintenance Scheduled",
        "content": "We'll be performing maintenance on Saturday, April 12th from 2AM-5AM UTC. During this time, the platform may be temporarily unavailable.",
        "notification_group_id": None,
        "target_audience": "all",
        "is_pinned": True,
        "is_active": True
    },
    {
        "title": "New Feature Released",
        "content": "We've released our new skill compilation feature. You can now compile skills for different AI agents in one click!",
        "notification_group_id": None,
        "target_audience": "all",
        "is_pinned": False,
        "is_active": True
    },
    {
        "title": "New Community Challenge",
        "content": "Join our monthly community challenge to create the most innovative skill! Prizes available for top submissions.",
        "notification_group_id": None,
        "target_audience": "all",
        "is_pinned": True,
        "is_active": True
    }
]

async def seed_notifications():
    """Seed notification data"""
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:Tinhvan123@localhost:5432/app")
    
    # If running from host but .env has 'db' (container name)
    if 'db:5432' in db_url and not os.getenv("IS_IN_DOCKER"):
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if notifications already exist
        result = await session.execute(select(Notification))
        existing_notifications = result.scalars().all()
        
        if existing_notifications:
            print(f"\n⚠️  {len(existing_notifications)} notifications already exist. Skipping seed.")
            return
        
        # Create notification groups
        print("Creating notification groups...")
        groups_created = 0
        for group_data in NOTIFICATION_GROUPS:
            try:
                group = NotificationGroup(
                    name=group_data["name"],
                    description=group_data["description"],
                    created_by=UUID(group_data["created_by"])
                )
                session.add(group)
                await session.flush()
                groups_created += 1
                print(f"  ✓ Created group: {group_data['name']}")
            except Exception as e:
                print(f"  ✗ Failed to create group {group_data['name']}: {str(e)}")
                continue
                
        await session.commit()
        
        # Create notifications
        print("\nCreating notifications...")
        notifications_created = 0
        for notification_data in NOTIFICATIONS:
            try:
                notification = Notification(
                    title=notification_data["title"],
                    content=notification_data["content"],
                    notification_group_id=notification_data["notification_group_id"],
                    target_audience=notification_data["target_audience"],
                    is_pinned=notification_data["is_pinned"],
                    is_active=notification_data["is_active"]
                )
                session.add(notification)
                await session.flush()
                notifications_created += 1
                print(f"  ✓ Created notification: {notification_data['title']}")
            except Exception as e:
                print(f"  ✗ Failed to create notification {notification_data['title']}: {str(e)}")
                continue
                
        await session.commit()
        print(f"\n✅ Successfully created {groups_created} notification groups and {notifications_created} notifications!")

if __name__ == "__main__":
    asyncio.run(seed_notifications())