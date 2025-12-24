from __future__ import annotations

from datetime import timedelta, datetime, timezone

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.repositories.user_repo import UserRepository
from app.schemas.user import Token, UserCreate, UserLogin, UserOut, GoogleLogin, UserRole
from app.services.role_service import RoleService
from app.models.token_version import TokenVersion
from app.repositories.refresh_token_repo import RefreshTokenRepository
from app.repositories.access_token_repo import AccessTokenRepository
from app.repositories.token_version_repo import TokenVersionRepository


class AuthError(RuntimeError):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.status_code = status_code


class AuthService:
    @staticmethod
    async def register(session: AsyncSession, data: UserCreate) -> UserOut:
        await RoleService.ensure_defaults(session)
        exists = await UserRepository.get_by_email(session, data.email)
        if exists:
            raise AuthError("Email already registered", status.HTTP_400_BAD_REQUEST)
        hashed_password = get_password_hash(data.password)
        user = await UserRepository.create(session, data, hashed_password)
        await session.commit()
        await session.refresh(user)
        return UserOut.model_validate(user)

    @staticmethod
    async def authenticate(session: AsyncSession, data: UserLogin) -> Token:
        user = await UserRepository.get_by_email(session, data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise AuthError("Incorrect email or password", status.HTTP_401_UNAUTHORIZED)
        settings = get_settings()
        version = await TokenVersionRepository.get_current_version(session, user.id)
        
        access_token, a_jti = create_access_token(
            str(user.id), version=version, expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        refresh_token, jti = create_refresh_token(
            str(user.id), version=version, expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes)
        )
        await AccessTokenRepository.create(
            session,
            user_id=user.id,
            jti=a_jti,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
        )
        await RefreshTokenRepository.create(
            session,
            user_id=user.id,
            jti=jti,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
        )
        await session.commit()
        return Token(access_token=access_token, refresh_token=refresh_token)

    @staticmethod
    async def refresh(session: AsyncSession, refresh_token: str) -> Token:
        settings = get_settings()
        try:
            payload = decode_refresh_token(refresh_token)
        except ValueError as e:
            raise AuthError("Invalid refresh token", status.HTTP_401_UNAUTHORIZED) from e

        jti = payload["jti"]
        user_id = payload["sub"]
        token_row = await RefreshTokenRepository.get_by_jti(session, jti)
        if not token_row or token_row.revoked:
            raise AuthError("Token revoked or not found", status.HTTP_401_UNAUTHORIZED)
        if token_row.expires_at < datetime.now(timezone.utc):
            await RefreshTokenRepository.revoke(session, jti)
            await session.commit()
            raise AuthError("Token expired", status.HTTP_401_UNAUTHORIZED)

        user = await UserRepository.get_by_id(session, user_id)  # type: ignore[arg-type]
        if not user or not user.is_active:
            raise AuthError("User not found", status.HTTP_401_UNAUTHORIZED)

        # rotate refresh token
        await RefreshTokenRepository.revoke(session, jti)
        
        version = await TokenVersionRepository.get_current_version(session, user.id)
        
        new_refresh, new_jti = create_refresh_token(
            str(user.id), version=version, expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes)
        )
        await RefreshTokenRepository.create(
            session,
            user_id=user.id,
            jti=new_jti,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
        )
        new_access, new_a_jti = create_access_token(
            str(user.id), version=version, expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        await AccessTokenRepository.create(
            session,
            user_id=user.id,
            jti=new_a_jti,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
        )
        await session.commit()
        return Token(access_token=new_access, refresh_token=new_refresh)

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int) -> UserOut:
        user = await UserRepository.get_by_id(session, user_id)
        if not user or not user.is_active:
            raise AuthError("User not found", status.HTTP_404_NOT_FOUND)
        return UserOut.model_validate(user)

    @staticmethod
    async def authenticate_google(session: AsyncSession, data: GoogleLogin) -> Token:
        settings = get_settings()
        if not settings.google_client_id:
            raise AuthError("Google Login is not configured", status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Verify the token
            import logging
            logger = logging.getLogger(__name__)
            logger.info("Verifying Google ID Token...")
            
            idinfo = id_token.verify_oauth2_token(
                data.id_token, requests.Request(), settings.google_client_id
            )

            # ID token is valid. Get the user's Google ID and email.
            email = idinfo["email"]
            name = idinfo.get("name")
            picture_url = idinfo.get("picture")

            picture_base64 = None
            if picture_url:
                try:
                    import httpx
                    import base64
                    async with httpx.AsyncClient() as client:
                        resp = await client.get(picture_url)
                        if resp.status_code == 200:
                            b64_img = base64.b64encode(resp.content).decode("utf-8")
                            mime = resp.headers.get("Content-Type", "image/jpeg")
                            picture_base64 = f"data:{mime};base64,{b64_img}"
                except Exception as e:
                    logger.warning(f"Failed to fetch Google profile picture: {e}")

            user = await UserRepository.get_by_email(session, email)
            if not user:
                logger.info(f"Creating new user for Google login: {email}")
                user_create = UserCreate(
                    email=email,
                    full_name=name,
                    picture=picture_base64,
                    password="SOCIAL_LOGIN_NO_PASSWORD",
                    roles=[UserRole.USER]
                )
                user = await UserRepository.create(session, user_create, None)
                await session.flush()
            elif picture_base64 and not user.picture:
                # Update picture for existing user if they don't have one
                user.picture = picture_base64
                await session.flush()

            if not user.is_active:
                raise AuthError("User account is disabled", status.HTTP_401_UNAUTHORIZED)

            version = await TokenVersionRepository.get_current_version(session, user.id)

            access_token, a_jti = create_access_token(
                str(user.id), version=version, expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
            )
            refresh_token, jti = create_refresh_token(
                str(user.id), version=version, expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes)
            )
            await AccessTokenRepository.create(
                session,
                user_id=user.id,
                jti=a_jti,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
            )
            await RefreshTokenRepository.create(
                session,
                user_id=user.id,
                jti=jti,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
            )
            await session.commit()
            return Token(access_token=access_token, refresh_token=refresh_token)

        except ValueError as e:
            # Invalid token
            logger.error(f"Invalid Google token: {str(e)}")
            raise AuthError(f"Invalid Google token: {str(e)}", status.HTTP_401_UNAUTHORIZED) from e
        except Exception as e:
            logger.exception("Google authentication unexpected error")
            raise AuthError(f"Google authentication failed: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR) from e

    @staticmethod
    async def logout(
        session: AsyncSession, access_token: str, refresh_token: str | None = None
    ) -> None:
        try:
            # Revoke access token
            payload = decode_access_token(access_token)
            a_jti = payload.get("jti")
            if a_jti:
                await AccessTokenRepository.revoke(session, a_jti)

            # Revoke refresh token if provided
            if refresh_token:
                try:
                    r_payload = decode_refresh_token(refresh_token)
                    r_jti = r_payload.get("jti")
                    if r_jti:
                        await RefreshTokenRepository.revoke(session, r_jti)
                except Exception:
                    # If refresh token is invalid or expired already, just skip
                    pass

            await session.commit()
        except Exception:
            # If access token is already invalid, we still want to commit any partial revokes
            await session.commit()
            raise AuthError("Invalid token during logout", status.HTTP_401_UNAUTHORIZED)

    @staticmethod
    async def logout_all_devices(session: AsyncSession, user_id: UUID) -> None:
        # Increment version to invalidate all current tokens
        await TokenVersionRepository.increment_version(session, user_id)
        # Also clean up repos for this user
        await AccessTokenRepository.revoke_all_for_user(session, user_id)
        await RefreshTokenRepository.revoke_all_for_user(session, user_id)
        await session.commit()
