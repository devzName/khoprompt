import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.notification import Notification

logger = logging.getLogger(__name__)


async def publish_scheduled_notifications():
    """Publish notifications whose scheduled_at has passed."""
    try:
        async with AsyncSessionLocal() as db:
            now = datetime.now(timezone.utc)
            stmt = (
                select(Notification)
                .where(Notification.status == "scheduled", Notification.scheduled_at <= now)
                .with_for_update(skip_locked=True)
            )
            result = await db.execute(stmt)
            notis = result.scalars().all()
            for n in notis:
                n.status = "published"
                n.sent_at = now
            await db.commit()
            if notis:
                logger.info(f"Published {len(notis)} scheduled notifications")
    except Exception:
        logger.exception("Error publishing scheduled notifications")
