from apscheduler.schedulers.background import (  # type: ignore[import-untyped]
    BackgroundScheduler,
)

from app.core.config import settings
from app.scheduler.jobs import run_exoplanet_etl_job

scheduler = BackgroundScheduler(timezone="UTC")

if settings.ETL_SCHEDULER_ENABLED:
    scheduler.add_job(
        run_exoplanet_etl_job,
        trigger="interval",
        hours=settings.ETL_SCHEDULER_INTERVAL_HOURS,
        id="exoplanet_etl",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
