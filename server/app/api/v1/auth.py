from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import DbSession, get_current_user, get_optional_current_user
from app.schemas.user import Token, UserCreate, UserLogin, UserOut
from app.services.auth_service import AuthError, AuthService

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: UserCreate,
    session: DbSession,
) -> UserOut:
    # Public signup: force role user
    data.roles = [role for role in data.roles if role.value == "user"] or []
    try:
        return await AuthService.register(session, data)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


@router.post("/admin/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def admin_register_user(
    data: UserCreate,
    session: DbSession,
    current_user=Depends(get_current_user),
) -> UserOut:
    # Only admin can access
    caller_roles = {r.name for r in getattr(current_user, "roles", [])}
    if "admin" not in caller_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    allowed = {"user", "supervisor", "admin"}
    data.roles = [role for role in data.roles if role.value in allowed] or []

    try:
        return await AuthService.register(session, data)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


@router.post("/login", response_model=Token)
async def login(
    session: DbSession, form_data: OAuth2PasswordRequestForm = Depends()
) -> Token:
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    try:
        return await AuthService.authenticate(session, credentials)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, session: DbSession) -> Token:
    try:
        return await AuthService.refresh(session, refresh_token)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


@router.get("/me", response_model=UserOut)
async def read_me(current_user=Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
