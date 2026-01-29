from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.auth_deps import CurrentUser
from app.schemas.auth import AdminLoginRequest, MicrosoftLoginRequest, TokenResponse, UserOut
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def admin_login(
    request: AdminLoginRequest,
    session: DbSession
):
    result = await AuthService.admin_login(session, request.username, request.password)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
        
    return result


@router.post("/login-microsoft", response_model=TokenResponse)
async def microsoft_login(
    request: MicrosoftLoginRequest,
    session: DbSession
):
    result = await AuthService.microsoft_login(session, request.token)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Microsoft token"
        )
        
    return result


@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: CurrentUser):
    return UserOut.model_validate(current_user)