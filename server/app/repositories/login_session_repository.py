from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.models.user import User


class LoginSessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_users(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        sort_by: str = "last_login_at",
        sort_order: str = "desc"
    ) -> tuple[List[User], int]:
        """Get all users (active and inactive) with pagination, search and sorting"""
        
        # Build base query - get all users, not just active ones
        query = select(User)
        
        # Apply search filter
        if search:
            search_filter = f"%{search}%"
            query = query.where(
                (User.full_name.ilike(search_filter)) | 
                (User.email.ilike(search_filter))
            )
        
        # Count total with filters
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        sort_field_map = {
            "login_time": User.last_login_at,
            "last_activity": User.updated_at,
            "user_name": User.full_name,
            "user_email": User.email
        }
        
        sort_field = sort_field_map.get(sort_by, User.last_login_at)
        if sort_order == "asc":
            query = query.order_by(sort_field.asc().nulls_last())
        else:
            query = query.order_by(sort_field.desc().nulls_last())
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        # Execute query
        result = await self.session.execute(query)
        users = result.scalars().all()
        
        return users, total

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        query = select(User).where(User.id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def toggle_user_status(self, user_id: UUID) -> Optional[User]:
        """Toggle user active status"""
        user = await self.get_user_by_id(user_id)
        if user:
            user.is_active = not user.is_active
            await self.session.commit()
            await self.session.refresh(user)
        return user
