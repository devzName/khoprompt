from __future__ import annotations

from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import jwt
from jwt import PyJWTError
import httpx
import random

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.repositories.user_repo import UserRepository
from app.schemas.auth import TokenResponse, UserOut
from app.constants.avatar_colors import AVATAR_COLORS

settings = get_settings()
logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def _get_random_color() -> str:
        return random.choice(AVATAR_COLORS)

    @staticmethod
    async def admin_login(session: AsyncSession, username: str, password: str) -> TokenResponse | None:
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
            logger.warning(f"Login attempt with unsupported username: {username}")
            return None

    @staticmethod
    async def microsoft_login(session: AsyncSession, microsoft_token: str) -> TokenResponse | None:
        try:
            unverified_header = jwt.get_unverified_header(microsoft_token)
            kid = unverified_header.get('kid')
            
            if not kid:
                logger.warning("Microsoft token missing kid in header")
                return None
            
            jwks_url = f"https://login.microsoftonline.com/{settings.microsoft_tenant_id}/discovery/v2.0/keys"
            async with httpx.AsyncClient() as client:
                response = await client.get(jwks_url)
                jwks = response.json()
            
            key = None
            for k in jwks.get('keys', []):
                if k.get('kid') == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                    break
            
            if not key:
                logger.warning(f"Microsoft token kid not found: {kid}")
                return None
            
            decoded_token = jwt.decode(
                microsoft_token,
                key,
                algorithms=['RS256'],
                audience=settings.microsoft_client_id
            )
            
            email = decoded_token.get('email') or decoded_token.get('preferred_username')
            full_name = decoded_token.get('name', '')
            
            if not email:
                logger.warning("Microsoft token missing email claim")
                return None
            
            user = await UserRepository.get_by_email(session, email)
            
            avatar_name = full_name or email.split('@')[0]
            random_color = AuthService._get_random_color()
            avatar_url = f"https://ui-avatars.com/api/?name={avatar_name}&background={random_color}&color=fff&size=200"
            
            if not user:
                user_data = {
                    'email': email,
                    'full_name': full_name,
                    'avatar_url': avatar_url,
                    'user_type': 'user',
                    'is_active': True,
                }
                user = await UserRepository.create(session, user_data)
            else:
                update_data = {
                    'full_name': full_name or user.full_name,
                    'last_login_at': datetime.now(timezone.utc)
                }
                user = await UserRepository.update(session, user, update_data)
            
            if not user.is_active:
                logger.warning(f"Inactive user login attempt: {email}")
                return None
            
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(user.id, expires_delta=access_token_expires)
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=settings.access_token_expire_minutes * 60,
                user=UserOut.model_validate(user)
            )
            
        except PyJWTError as e:
            logger.error(f"Invalid Microsoft token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Microsoft login error: {str(e)}")
            return None