from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status

from typing import Annotated
from app.api.deps import DbSession, get_current_user
from app.core.redis_client import get_redis
from app.models.role import Role
from app.models.user import User
from app.repositories.role_repo import RoleRepository
from app.schemas.role import RoleOut

router = APIRouter()


@router.get("", response_model=list[RoleOut])
async def list_roles(session: DbSession) -> list[RoleOut]:
    roles = await session.execute(Role.__table__.select().where(Role.is_deleted.is_(False)))
    return [RoleOut.model_validate(r) for r in roles.all()]


@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
async def create_role(
    name: str,
    session: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    description: str | None = None,
):
    # only admin
    if not any(r.name == "admin" for r in current_user.roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    exists = await RoleRepository.get_by_name(session, name)
    if exists:
        raise HTTPException(status_code=400, detail="Role already exists")
    role = Role(name=name, description=description)
    session.add(role)
    await session.commit()
    redis = get_redis()
    try:
        await redis.set(f"role:{name}", json.dumps({"id": str(role.id), "name": role.name, "description": role.description}), ex=300)
    except Exception:
        pass
    return RoleOut.model_validate(role)


@router.put("/{role_id}", response_model=RoleOut)
async def update_role(
    role_id: str,
    session: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    description: str | None = None,
) -> RoleOut:
    if not any(r.name == "admin" for r in current_user.roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    result = await session.execute(Role.__table__.select().where(Role.id == role_id, Role.is_deleted.is_(False)))
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Role not found")
    await session.execute(
        Role.__table__.update()
        .where(Role.id == role_id)
        .values(description=description)
    )
    await session.commit()

    updated = await session.execute(Role.__table__.select().where(Role.id == role_id))
    role_obj = updated.first()
    if not role_obj:
        raise HTTPException(status_code=404, detail="Role not found")

    redis = get_redis()
    try:
        payload = {"id": str(role_obj.id), "name": role_obj.name, "description": role_obj.description}
        await redis.set(f"role:{role_obj.name}", json.dumps(payload), ex=300)
    except Exception:
        pass
    return RoleOut.model_validate(role_obj)
