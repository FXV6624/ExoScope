import logging

from apscheduler.schedulers.background import (  # type: ignore[import-untyped]
    BackgroundScheduler,
)

from app.core.config import settings
from app.core.scheduler_prometheus_metrics import scheduler_prometheus_metrics
from app.scheduler.jobs import run_exoplanet_etl_job

logger = logging.getLogger("scheduler")
scheduler = BackgroundScheduler(timezone="UTC")

if settings.ETL_SCHEDULER_ENABLED:
    scheduler.add_job(
        run_exoplanet_etl_job,
        trigger="interval",
        seconds=settings.ETL_SCHEDULER_INTERVAL_SECONDS,
        id="exoplanet_etl",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler_prometheus_metrics.initialize(settings.ETL_SCHEDULER_INTERVAL_SECONDS)


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()
        _update_next_run_metric()
        logger.info(
            "Scheduler started | interval=%ss", settings.ETL_SCHEDULER_INTERVAL_SECONDS
        )


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")


def _update_next_run_metric() -> None:
    """Read the real next_run_time from APScheduler and publish it."""
    job = scheduler.get_job("exoplanet_etl")
    if job:
        if job.next_run_time:
            scheduler_prometheus_metrics.update_next_run(job.next_run_time.timestamp())
        logger.info("Next scheduled ETL | %s", job.next_run_time)
