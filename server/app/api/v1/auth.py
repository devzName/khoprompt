from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status

from app.api.deps import DbSession
from app.api.auth_deps import CurrentUser
from app.schemas.auth import AdminLoginRequest, MicrosoftLoginRequest, TokenResponse, UserOut
from app.services.auth_service import AuthService
from app.services.audit_service import schedule_audit_log

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def admin_login(
    request: AdminLoginRequest,
    http_request: Request,
    session: DbSession,
    background_tasks: BackgroundTasks,
):
    result = await AuthService.admin_login(session, request.username, request.password)

    if not result:
        schedule_audit_log(
            background_tasks, session, None, "login_failed", http_request,
            {"username_attempted": request.username[:100]},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    schedule_audit_log(
        background_tasks, session, result.user.id, "login_success", http_request,
    )
    return result


@router.post("/login-microsoft", response_model=TokenResponse)
async def microsoft_login(
    request: MicrosoftLoginRequest,
    http_request: Request,
    session: DbSession,
    background_tasks: BackgroundTasks,
):
    result = await AuthService.microsoft_login(session, request.token)

    if not result:
        schedule_audit_log(
            background_tasks, session, None, "login_failed", http_request,
            {"method": "microsoft"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Microsoft token",
        )

    schedule_audit_log(
        background_tasks, session, result.user.id, "login_success", http_request,
        {"method": "microsoft"},
    )
    return result


@router.post("/logout")
async def logout(
    current_user: CurrentUser,
    http_request: Request,
    session: DbSession,
    background_tasks: BackgroundTasks,
):
    schedule_audit_log(
        background_tasks, session, current_user.id, "logout", http_request,
    )
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: CurrentUser):
    return UserOut.model_validate(current_user)