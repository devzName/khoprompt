from __future__ import annotations

from typing import Annotated, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession
from app.core.security import verify_token
from app.repositories.user_repo import UserRepository
from app.models.user import User

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(
    session: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id_str = verify_token(credentials.credentials)
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception
    
    user = await UserRepository.get_by_id(session, user_id)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    return current_user


async def get_current_user_optional(
    session: DbSession,
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(optional_security)] = None
) -> Optional[User]:
    """Get current user if token is provided, otherwise return None"""
    if credentials is None:
        return None
    
    user_id_str = verify_token(credentials.credentials)
    if user_id_str is None:
        return None
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        return None
    
    user = await UserRepository.get_by_id(session, user_id)
    if user is None or not user.is_active:
        return None
    
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
OptionalCurrentUser = Annotated[Optional[User], Depends(get_current_user_optional)]