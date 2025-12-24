from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

# Add server root to sys.path to allow imports from app.*
current_dir = Path(__file__).resolve().parent
server_root = current_dir.parent.parent
sys.path.append(str(server_root))

from dotenv import load_dotenv
# Load .env from server root before importing database config
load_dotenv(server_root / ".env")

from app.core.database import AsyncSessionLocal
from app.services.prompt_service import PromptSeedError, PromptService


async def _main() -> None:
    async with AsyncSessionLocal() as session:
        try:
            result = await PromptService.seed_from_mock_js(session)
            print(result)
        except PromptSeedError as e:
            raise SystemExit(str(e)) from e


def main() -> None:
    asyncio.run(_main())


if __name__ == "__main__":
    main()
