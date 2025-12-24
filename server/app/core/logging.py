import logging
import os
from pathlib import Path

from app.core.config import get_settings


def configure_logging() -> None:
    settings = get_settings()

    handlers: list[logging.Handler] = []
    console_handler = logging.StreamHandler()
    handlers.append(console_handler)

    if settings.log_to_file:
        log_path = Path(settings.log_file_path)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_path, encoding="utf-8")
        handlers.append(file_handler)

    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        handlers=handlers,
    )
