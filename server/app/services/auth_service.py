from __future__ import annotations

from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse, UserOut
from app.services.ldap_service import LDAPService

settings = get_settings()
logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def admin_login(session: AsyncSession, username: str, password: str) -> TokenResponse | None:
        # Handle admin@gmail.com with current logic
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
            # Handle other usernames - LDAP authentication
            logger.info(f"Attempting LDAP authentication for username: {username}")
            
            ldap_service = LDAPService()
            ldap_user_info = await ldap_service.authenticate_user(username, password)
            
            if not ldap_user_info:
                logger.warning(f"LDAP authentication failed for username: {username}")
                return None
            
            logger.info(f"LDAP authentication successful for username: {username}")
            
            # Tìm user trong database hoặc tạo mới
            user = await UserRepository.get_by_email(session, ldap_user_info['email'])
            
            if user:
                # Update existing user with LDAP info
                update_data = {
                    'full_name': ldap_user_info['full_name'],
                    'user_type': 'ldap',
                    'is_active': True,
                    'last_login_at': datetime.now(timezone.utc)
                }
                user = await UserRepository.update(session, user, update_data)
            else:
                # Create new LDAP user
                user_data = {
                    'email': ldap_user_info['email'],
                    'full_name': ldap_user_info['full_name'],
                    'user_type': 'ldap',
                    'is_active': True,
                    'last_login_at': datetime.now(timezone.utc)
                }
                user = await UserRepository.create(session, user_data)
            
            if not user.is_active:
                return None
            
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(user.id, expires_delta=access_token_expires)
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.access_token_expire_minutes * 60,
                user=UserOut.model_validate(user)
            )