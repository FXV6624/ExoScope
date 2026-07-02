from datetime import datetime, timezone
import logging
from sqlmodel import Session

from app.etl.extract import extract
from app.etl.transform import transform
from app.etl.load import load
from app.etl.metrics import ETLMetrics
from app.etl.report import ETLReport
from app.etl.run_repository import save_etl_run
from app.etl.config import ETLConfig
from app.etl.load_result import LoadResult

class ExoplanetETL:

    def __init__(self, session: Session , config: ETLConfig):
        self.session = session
        self.config = config
        self.logger = logging.getLogger("exoplanet_etl")

    def run(self) -> ETLReport:
        metrics = ETLMetrics()
        metrics.started_at = datetime.now(timezone.utc)
        self.logger.info("ETL started")

        #EXTRACT
        metrics.extract_start = datetime.now(timezone.utc)
        try:
            self.logger.info(f"Extracting data (limit={self.config.limit})")
            data = extract(self.config.limit)
            metrics.extracted = len(data)
        except Exception as e:
            self.logger.error(f"Extract failed: {e}")
            metrics.errors.append(str(e))
            metrics.extract_end = datetime.now(timezone.utc)
            metrics.finished_at = datetime.now(timezone.utc)
            return ETLReport.from_metrics(metrics)
        metrics.extract_end = datetime.now(timezone.utc)

        #TRANSFORM
        metrics.transform_start = datetime.now(timezone.utc)
        try:
            self.logger.info("Transforming data")
            planets = transform(data)
            metrics.transformed = len(planets)
        except Exception as e:
            self.logger.error(f"Transform failed: {e}")
            metrics.errors.append(str(e))
            metrics.transform_end = datetime.now(timezone.utc)
            metrics.finished_at = datetime.now(timezone.utc)
            return ETLReport.from_metrics(metrics)
        metrics.transform_end = datetime.now(timezone.utc)

        #LOAD
        if not self.config.dry_run:
            metrics.load_start = datetime.now(timezone.utc)
            try:
                self.logger.info("Loading data")
                metrics.load_result = load(self.session, planets, self.config.load_mode)
            except Exception as e:
                self.logger.error(f"Load failed: {e}")
                metrics.errors.append(str(e))
                metrics.load_end = datetime.now(timezone.utc)
                metrics.finished_at = datetime.now(timezone.utc)
                return ETLReport.from_metrics(metrics)
            metrics.load_end = datetime.now(timezone.utc)
        else:
            self.logger.info("Dry run enabled, skipping load step")
            metrics.load_result = LoadResult()

        #END
        metrics.finished_at = datetime.now(timezone.utc)
        self.logger.info("ETL finished")
        report = ETLReport.from_metrics(metrics)
        if self.config.persist_run:
            save_etl_run(self.session, report)
            self.logger.info("ETL run persisted to database")
        return report