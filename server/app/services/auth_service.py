from __future__ import annotations

from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse, UserOut

settings = get_settings()
logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def admin_login(session: AsyncSession, username: str, password: str) -> TokenResponse | None:
        # Handle admin login only
        if username == "admin":
            user = await UserRepository.get_admin_by_email(session, username)
            if not user:
                return None
            
            if not user.password_hash:
                return None
                
            if not verify_password(password, user.password_hash):
                return None
            
            if not user.is_active:
                return None
            
            update_data = {'last_login_at': datetime.now(timezone.utc)}
            user = await UserRepository.update(session, user, update_data)
            
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(user.id, expires_delta=access_token_expires)
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.access_token_expire_minutes * 60,
                user=UserOut.model_validate(user)
            )
        else:
            # Other usernames are not supported anymore (LDAP removed)
            logger.warning(f"Login attempt with unsupported username: {username}")
            return None