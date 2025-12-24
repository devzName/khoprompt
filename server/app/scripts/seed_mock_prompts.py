from __future__ import annotations

import asyncio

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
