import logging
from datetime import datetime, timezone

from sqlmodel import Session

from app.core.db import engine
from app.core.scheduler_prometheus_metrics import scheduler_prometheus_metrics
from app.etl.config import ETLConfig
from app.etl.main import run_etl

logger = logging.getLogger("scheduler")


def run_exoplanet_etl_job() -> None:
    logger.info("Running scheduled ETL")

    config = ETLConfig()

    try:
        with Session(engine) as session:
            run_etl(session, config)
    except Exception as e:
        logger.error(f"Scheduled ETL failed: {e}")
    finally:
        timestamp = datetime.now(timezone.utc).timestamp()
        scheduler_prometheus_metrics.record_run(timestamp)

        # Update next_run from APScheduler's actual data
        from app.scheduler.scheduler import scheduler

        job = scheduler.get_job("exoplanet_etl")
        if job and job.next_run_time:
            scheduler_prometheus_metrics.update_next_run(job.next_run_time.timestamp())
