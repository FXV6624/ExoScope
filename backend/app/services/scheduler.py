from typing import Any

from app.scheduler.scheduler import (
    scheduler,
    start_scheduler,
    stop_scheduler,
    update_scheduler_interval,
)


def start_scheduler_service() -> None:
    """
    Start the scheduler service
    """
    if not scheduler.running:
        start_scheduler()
    else:
        raise RuntimeError("Scheduler is already running")


def stop_scheduler_service() -> None:
    """
    Stop the scheduler service
    """
    if scheduler.running:
        stop_scheduler()
    else:
        raise RuntimeError("Scheduler is not running")


def read_scheduler_status_service() -> dict[str, Any]:
    """
    Get the current scheduler status.
    """
    job = scheduler.get_job("exoplanet_etl")

    return {
        "running": scheduler.running,
        "interval_seconds": (
            int(job.trigger.interval.total_seconds()) if job else None
        ),
        "next_run": job.next_run_time if job else None,
    }


def update_scheduler_interval_service(interval_seconds: int) -> None:
    """
    Update the scheduler interval.
    """
    update_scheduler_interval(interval_seconds)
