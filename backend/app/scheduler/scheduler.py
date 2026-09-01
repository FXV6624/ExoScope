import logging

from apscheduler.schedulers.background import (  # type: ignore[import-untyped]
    BackgroundScheduler,
)

from app.core.config import settings
from app.core.scheduler_prometheus_metrics import scheduler_prometheus_metrics
from app.scheduler.jobs import run_exoplanet_etl_job

logger = logging.getLogger("scheduler")

scheduler = BackgroundScheduler(timezone="UTC")

_current_interval_seconds = settings.ETL_SCHEDULER_INTERVAL_SECONDS


def _add_etl_job() -> None:
    scheduler.add_job(
        run_exoplanet_etl_job,
        trigger="interval",
        seconds=_current_interval_seconds,
        id="exoplanet_etl",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )


if settings.ETL_SCHEDULER_ENABLED:
    _add_etl_job()
    scheduler_prometheus_metrics.initialize(_current_interval_seconds)


def start_scheduler() -> None:
    if scheduler.running:
        logger.info("Scheduler already running")
        return

    if scheduler.get_job("exoplanet_etl") is None:
        _add_etl_job()

    scheduler.start()
    scheduler_prometheus_metrics.initialize(_current_interval_seconds)
    _update_next_run_metric()

    logger.info(
        "Scheduler started | interval=%ss",
        _current_interval_seconds,
    )


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
    else:
        logger.info("Scheduler already stopped")


def update_scheduler_interval(interval_seconds: int) -> None:
    global _current_interval_seconds

    _current_interval_seconds = interval_seconds

    job = scheduler.get_job("exoplanet_etl")

    if job is None:
        raise ValueError("ETL scheduler job does not exist")

    job.reschedule(
        trigger="interval",
        seconds=interval_seconds,
    )

    scheduler_prometheus_metrics.initialize(interval_seconds)
    _update_next_run_metric()

    logger.info(
        "Scheduler interval updated | interval=%ss",
        interval_seconds,
    )


def _update_next_run_metric() -> None:
    """Read the real next_run_time from APScheduler and publish it."""
    job = scheduler.get_job("exoplanet_etl")

    if job:
        next_run = getattr(job, "next_run_time", None)

        if next_run:
            scheduler_prometheus_metrics.update_next_run(next_run.timestamp())

        logger.info("Next scheduled ETL | %s", next_run)
