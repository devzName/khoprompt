from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID
import hashlib

from jose import JWTError, jwt
from google.auth.transport import requests
from google.oauth2 import id_token
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(subject: str | UUID, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        subject: str = payload.get("sub")
        if subject is None:
            return None
        return subject
    except JWTError:
        return None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_gravatar_url(email: str, size: int = 200) -> str:
    email_hash = hashlib.md5(email.lower().encode('utf-8')).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d=identicon"


def get_ui_avatars_url(name: str, email: str) -> str:
    initial = name[0].upper() if name else email[0].upper()
    return f"https://ui-avatars.com/api/?name={initial}&background=4285f4&color=fff&size=200"


def verify_google_token(id_token_str: str) -> dict[str, Any] | None:
    try:
        if not settings.google_client_id:
            raise ValueError("Google Client ID not configured")
            
        idinfo = id_token.verify_oauth2_token(
            id_token_str, 
            requests.Request(), 
            settings.google_client_id
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        email = idinfo['email']
        full_name = idinfo.get('name', '')
        picture_url = idinfo.get('picture')
        
        if picture_url and picture_url.startswith('http'):
            avatar_url = picture_url
        else:
            avatar_url = get_gravatar_url(email)
        
        return {
            'google_id': idinfo['sub'],
            'email': email,
            'full_name': full_name,
            'avatar_url': avatar_url,
            'email_verified': idinfo.get('email_verified', False)
        }
        
    except ValueError as e:
        return None
    except Exception as e:
        return None