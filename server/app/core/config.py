from __future__ import annotations

from functools import lru_cache
import json

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    app_name: str = "khoprompt-api"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    docs_url: str | None = "/docs"
    redoc_url: str | None = None
    openapi_url: str | None = "/openapi.json"
    swagger_ui_parameters: dict[str, object] = Field(
        default_factory=lambda: {"displayRequestDuration": True}
    )
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    log_to_file: bool = Field(default=False, validation_alias="LOG_TO_FILE")
    log_file_path: str = Field(default="logs/app.log", validation_alias="LOG_FILE_PATH")
    detailed_error_logs: bool = Field(default=False, validation_alias="DETAILED_ERROR_LOGS")
    secret_key: str = Field(default="change-me", validation_alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=1440, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    algorithm: str = Field(default="HS256", validation_alias="ALGORITHM")
    google_client_id: str | None = Field(default=None, validation_alias="GOOGLE_CLIENT_ID")

    database_url: str = Field(
        default="postgresql+asyncpg://app:app@localhost:5432/app",
        validation_alias="DATABASE_URL",
    )
    database_echo: bool = Field(default=False, validation_alias="DATABASE_ECHO")

    allowed_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"],
        validation_alias="ALLOWED_ORIGINS",
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _parse_origins(cls, v):
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return v

    @field_validator("swagger_ui_parameters", mode="before")
    @classmethod
    def _parse_swagger_params(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except ValueError:
                return {}
        return v or {}


@lru_cache
def get_settings() -> Settings:
    return Settings()
