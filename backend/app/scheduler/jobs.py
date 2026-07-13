import logging

from sqlmodel import Session

from app.core.db import engine
from app.etl.config import ETLConfig
from app.etl.main import run_etl

logger = logging.getLogger("scheduler")


def run_exoplanet_etl_job():
    logger.info("Running scheduled ETL")

    config = ETLConfig()

    with Session(engine) as session:
        run_etl(session, config)
