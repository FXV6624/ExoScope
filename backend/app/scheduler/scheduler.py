from apscheduler.schedulers.background import BackgroundScheduler

from app.scheduler.jobs import run_exoplanet_etl_job
from app.core.config import settings

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


def start_scheduler():
    if not scheduler.running:
        scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()