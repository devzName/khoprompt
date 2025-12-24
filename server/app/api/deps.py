from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.repositories.user_repo import UserRepository
from app.schemas.user import TokenPayload, UserOut
from app.repositories.access_token_repo import AccessTokenRepository
from app.repositories.token_version_repo import TokenVersionRepository
from app.core.audit import set_current_actor
from app.models.user import User

DbSession = Annotated[AsyncSession, Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: DbSession
) -> User:
    try:
        payload = TokenPayload(**decode_access_token(token))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from e

    jti = payload.jti
    if not jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing jti")
    
    token_rec = await AccessTokenRepository.get_by_jti(session, jti)
    if not token_rec or token_rec.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked or not found")

    if not payload.sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Check token version
    current_version = await TokenVersionRepository.get_current_version(session, UUID(payload.sub))
    if payload.v < current_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token version is outdated")

    try:
        user_id = UUID(payload.sub)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = await UserRepository.get_by_id(session, user_id)
    if not user or not user.is_active or getattr(user, "is_deleted", False):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    set_current_actor(user.id)
    return user


async def get_optional_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme_optional)], session: DbSession
) -> User | None:
    if not token:
        return None
    try:
        payload = TokenPayload(**decode_access_token(token))
    except Exception:
        return None

    jti = payload.jti
    if not jti:
        return None
    
    token_rec = await AccessTokenRepository.get_by_jti(session, jti)
    if not token_rec or token_rec.revoked:
        return None

    if not payload.sub:
        return None

    # Check token version
    try:
        current_version = await TokenVersionRepository.get_current_version(session, UUID(payload.sub))
        if payload.v < current_version:
            return None
    except Exception:
        return None

    try:
        user_id = UUID(payload.sub)
    except (ValueError, TypeError):
        return None

    user = await UserRepository.get_by_id(session, user_id)
    if not user or not user.is_active or getattr(user, "is_deleted", False):
        return None
    set_current_actor(user.id)
    return user
