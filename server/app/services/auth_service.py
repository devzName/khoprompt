from __future__ import annotations

from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import create_access_token, verify_google_token, verify_password
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse, UserOut

settings = get_settings()


class AuthService:
    
    @staticmethod
    async def google_login(session: AsyncSession, id_token: str) -> TokenResponse | None:
        google_user_info = verify_google_token(id_token)
        if not google_user_info:
            return None
            
        if not google_user_info.get('email_verified', False):
            return None
            
        user = await UserRepository.get_by_google_id(session, google_user_info['google_id'])
        
        if not user:
            user = await UserRepository.get_by_email(session, google_user_info['email'])
            
            if user and user.user_type == "admin":
                return None
            
            if user and user.user_type == "google":
                update_data = {
                    'google_id': google_user_info['google_id'],
                    'full_name': google_user_info['full_name'] or user.full_name,
                    'avatar_url': google_user_info['avatar_url'] or user.avatar_url,
                    'last_login_at': datetime.now(timezone.utc)
                }
                user = await UserRepository.update(session, user, update_data)
            else:
                user_data = {
                    'email': google_user_info['email'],
                    'full_name': google_user_info['full_name'] or '',
                    'avatar_url': google_user_info['avatar_url'],
                    'google_id': google_user_info['google_id'],
                    'user_type': "google",
                    'is_active': True,
                    'last_login_at': datetime.now(timezone.utc)
                }
                user = await UserRepository.create(session, user_data)
        else:
            needs_update = False
            update_data = {}
            
            if google_user_info['full_name'] and google_user_info['full_name'] != user.full_name:
                update_data['full_name'] = google_user_info['full_name']
                needs_update = True
            
            if google_user_info['avatar_url'] != user.avatar_url:
                update_data['avatar_url'] = google_user_info['avatar_url']
                needs_update = True
            
            update_data['last_login_at'] = datetime.now(timezone.utc)
            needs_update = True
            
            if needs_update:
                user = await UserRepository.update(session, user, update_data)
        
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
    
    @staticmethod
    async def admin_login(session: AsyncSession, email: str, password: str) -> TokenResponse | None:
        user = await UserRepository.get_admin_by_email(session, email)
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