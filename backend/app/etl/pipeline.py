from datetime import datetime, timezone
import logging
from sqlmodel import Session

from app.etl.extract import extract
from app.etl.transform import transform
from app.etl.load import load
from app.etl.metrics import ETLMetrics
from app.etl.report import ETLReport
from app.etl.run_repository import save_etl_run

class ExoplanetETL:

    def __init__(self, session: Session):
        self.session = session
        self.logger = logging.getLogger("exoplanet_etl")

    def run(self) -> ETLReport:
        metrics = ETLMetrics()
        metrics.start_time = datetime.now(timezone.utc)
        self.logger.info("ETL started")

        #EXTRACT
        metrics.extract_start = datetime.now(timezone.utc)
        try:
            self.logger.info("Extracting data")
            data = extract()
            metrics.extracted = len(data)
        except Exception as e:
            self.logger.error(f"Extract failed: {e}")
            metrics.errors.append(str(e))
            metrics.extract_end = datetime.now(timezone.utc)
            metrics.end_time = datetime.now(timezone.utc)
            return self._build_report(metrics)
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
            metrics.end_time = datetime.now(timezone.utc)
            return self._build_report(metrics)
        metrics.transform_end = datetime.now(timezone.utc)

        #LOAD
        metrics.load_start = datetime.now(timezone.utc)
        try:
            self.logger.info("Loading data")
            load(self.session, planets)
            metrics.loaded = len(planets)
        except Exception as e:
            self.logger.error(f"Load failed: {e}")
            metrics.errors.append(str(e))
            metrics.load_end = datetime.now(timezone.utc)
            metrics.end_time = datetime.now(timezone.utc)
            return self._build_report(metrics)
        metrics.load_end = datetime.now(timezone.utc)

        #END
        metrics.end_time = datetime.now(timezone.utc)
        self.logger.info("ETL finished")
        report = self._build_report(metrics)
        save_etl_run(self.session, report, metrics)
        return report

    def _build_report(self, metrics: ETLMetrics) -> ETLReport:
        return ETLReport(
            extracted=metrics.extracted,
            transformed=metrics.transformed,
            loaded=metrics.loaded,

            duration_seconds=metrics.total_duration(),

            extract_time=metrics.extract_duration(),
            transform_time=metrics.transform_duration(),
            load_time=metrics.load_duration(),
            errors=metrics.errors,
        )