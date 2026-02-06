from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.repositories.login_session_repository import LoginSessionRepository


class LoginSessionService:
    def __init__(self, session: AsyncSession):
        self.repository = LoginSessionRepository(session)

    async def get_login_sessions(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        sort_by: str = "last_login_at",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        """Get login sessions with pagination, search and sorting"""
        
        users, total = await self.repository.get_all_users(
            page=page,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Transform users to session format
        sessions = []
        for user in users:
            sessions.append({
                "id": str(user.id),
                "user_name": user.full_name,
                "user_email": user.email,
                "user_type": user.user_type,
                "login_time": user.last_login_at.isoformat() if user.last_login_at else user.created_at.isoformat(),
                "last_activity": user.updated_at.isoformat() if user.updated_at else user.created_at.isoformat(),
                "status": "active" if user.is_active else "inactive"
            })
        
        return {
            "data": sessions,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit if total > 0 else 0
            }
        }

    async def toggle_user_account(self, user_id: UUID) -> Dict[str, Any]:
        """Toggle user account status (lock/unlock)"""
        user = await self.repository.toggle_user_status(user_id)
        
        if not user:
            raise ValueError("User not found")
        
        return {
            "message": "User account locked successfully" if not user.is_active else "User account unlocked successfully",
            "user_id": str(user.id),
            "is_active": user.is_active
        }
