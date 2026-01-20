from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.auth_deps import CurrentUser
from app.schemas.auth import GoogleLoginRequest, AdminLoginRequest, TokenResponse, UserOut
from app.services.auth_service import AuthService
from app.services.ldap_service import LDAPService

router = APIRouter()


@router.post("/login/google", response_model=TokenResponse)
async def google_login(
    request: GoogleLoginRequest,
    session: DbSession
):
    result = await AuthService.google_login(session, request.id_token)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token or unverified email"
        )
        
    return result


@router.post("/login/admin", response_model=TokenResponse)
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


@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: CurrentUser):
    return UserOut.model_validate(current_user)


@router.get("/ldap/test")
async def test_ldap_connection():
    """Test LDAP server connection"""
    ldap_service = LDAPService()
    is_connected = await ldap_service.test_connection()
    
    return {
        "ldap_connection": "success" if is_connected else "failed",
        "message": "LDAP server is reachable" if is_connected else "Cannot connect to LDAP server"
    }