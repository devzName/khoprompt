from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import hashlib

import bcrypt  # type: ignore
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()


def _sha256_bytes(pwd: str) -> bytes:
    return hashlib.sha256(pwd.encode()).hexdigest().encode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_sha256_bytes(plain_password), hashed_password.encode())
    except ValueError:
        # fallback legacy: check without sha256
        try:
            return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
        except Exception:
            return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_sha256_bytes(password), bcrypt.gensalt()).decode()


def create_access_token(subject: str | int, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(tz=timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode: dict[str, Any] = {"sub": str(subject), "exp": expire, "token_type": "access"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(subject: str | int, expires_delta: timedelta | None = None) -> tuple[str, str]:
    expire = datetime.now(tz=timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.refresh_token_expire_minutes)
    )
    jti = str(uuid4())
    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "token_type": "refresh",
        "jti": jti,
    }
    token = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return token, jti


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("token_type") != "access":
            raise ValueError("Invalid token type")
        return payload
    except JWTError as e:
        raise ValueError("Invalid token") from e


def decode_refresh_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("token_type") != "refresh":
            raise ValueError("Invalid token type")
        if "jti" not in payload:
            raise ValueError("Missing jti")
        return payload
    except JWTError as e:
        raise ValueError("Invalid token") from e
