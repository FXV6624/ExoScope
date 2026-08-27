import logging
from datetime import datetime, timezone

from sqlmodel import Session

from app.core.db import engine
from app.core.scheduler_prometheus_metrics import scheduler_prometheus_metrics
from app.etl.config import ETLConfig
from app.etl.main import run_etl

logger = logging.getLogger("scheduler")


def run_exoplanet_etl_job() -> None:
    logger.info("Scheduled ETL started")

    config = ETLConfig()

    try:
        with Session(engine) as session:
            run_etl(session, config)
        logger.info("Scheduled ETL completed successfully")
    except Exception:
        logger.exception("Scheduled ETL failed")
    finally:
        timestamp = datetime.now(timezone.utc).timestamp()
        scheduler_prometheus_metrics.record_run(timestamp)

        from app.scheduler.scheduler import scheduler

        job = scheduler.get_job("exoplanet_etl")

        next_run = getattr(job, "next_run_time", None)
        if next_run:
            scheduler_prometheus_metrics.update_next_run(next_run.timestamp())
