import logging
from datetime import datetime

from sqlmodel import Session

from app.core.cache import clear_cache_sync
from app.core.etl_prometheus_metrics import etl_prometheus_metrics
from app.etl.config import ETLConfig
from app.etl.enrich.enrich import enrich
from app.etl.extract import extract
from app.etl.load import load
from app.etl.metrics import ETLMetrics
from app.etl.report import ETLReport
from app.etl.run_repository import save_etl_run
from app.etl.schemas import LoadResult
from app.etl.transform import transform
from app.models import Exoplanet


class ExoplanetETL:
    def __init__(self, session: Session, config: ETLConfig):
        self.session = session
        self.config = config
        self.logger = logging.getLogger("exoplanet_etl")

    def run(self) -> ETLReport:
        metrics = ETLMetrics()
        metrics.started_at = datetime.now().astimezone()
        self.logger.info(
            "ETL started | dry_run=%s | load_mode=%s | persist_run=%s | limit=%s",
            self.config.dry_run,
            self.config.load_mode,
            self.config.persist_run,
            self.config.limit,
        )

        # EXTRACT
        metrics.extract_start = datetime.now().astimezone()
        try:
            self.logger.info(
                "Extract step started | limit=%s",
                self.config.limit,
            )
            data = extract(self.config.limit)
            metrics.extracted = len(data)
        except Exception as e:
            self.logger.exception("Extract failed")
            metrics.errors.append(str(e))
            metrics.extract_end = datetime.now().astimezone()
            metrics.finished_at = datetime.now().astimezone()
            return ETLReport.from_metrics(metrics)
        self.logger.info("Extract step completed | extracted=%s", metrics.extracted)
        metrics.extract_end = datetime.now().astimezone()

        # TRANSFORM
        metrics.transform_start = datetime.now().astimezone()
        try:
            self.logger.info("Transform step started")
            planets = transform(data)
            metrics.transformed = len(planets)
        except Exception as e:
            self.logger.exception("Transform failed")
            metrics.errors.append(str(e))
            metrics.transform_end = datetime.now().astimezone()
            metrics.finished_at = datetime.now().astimezone()
            return ETLReport.from_metrics(metrics)
        metrics.transform_end = datetime.now().astimezone()
        self.logger.info(
            "Transform step completed | transformed=%s", metrics.transformed
        )

        # ENRICH
        try:
            self.logger.info("Enrich step started")
            planets = enrich(planets)
        except Exception as e:
            self.logger.exception("Enrichment failed")
            metrics.errors.append(str(e))
            metrics.finished_at = datetime.now().astimezone()
            return ETLReport.from_metrics(metrics)
        self.logger.info("Enrich step completed")

        # LOAD
        if not self.config.dry_run:
            metrics.load_start = datetime.now().astimezone()
            try:
                self.logger.info("Preparing %s planets for database load", len(planets))
                self.logger.info("Load step started")
                planets_to_load = [Exoplanet(**p.model_dump()) for p in planets]
                metrics.load_result = load(
                    self.session, planets_to_load, self.config.load_mode
                )
            except Exception as e:
                self.logger.exception("Load step failed")
                metrics.errors.append(str(e))
                metrics.load_end = datetime.now().astimezone()
                metrics.finished_at = datetime.now().astimezone()
                return ETLReport.from_metrics(metrics)
            metrics.load_end = datetime.now().astimezone()
            self.logger.info(
                "Load step completed | inserted=%s | updated=%s | skipped=%s",
                metrics.load_result.inserted,
                metrics.load_result.updated,
                metrics.load_result.skipped,
            )
        else:
            self.logger.info("Dry run enabled | database changes skipped")
            metrics.load_result = LoadResult()

        # END
        metrics.finished_at = datetime.now().astimezone()
        report = ETLReport.from_metrics(metrics)
        self.logger.info(
            "ETL completed | extracted=%s | transformed=%s | inserted=%s | updated=%s | skipped=%s | duration=%.2fs",
            report.extracted,
            report.transformed,
            report.load_result.inserted,
            report.load_result.updated,
            report.load_result.skipped,
            report.duration_seconds,
        )

        etl_prometheus_metrics.update(metrics)
        if self.config.persist_run:
            save_etl_run(self.session, report)
            self.logger.info("ETL run persisted to database")
        if (
            not self.config.dry_run
            and metrics.load_result
            and (metrics.load_result.inserted > 0 or metrics.load_result.updated > 0)
        ):
            self.logger.info("Clearing API cache after ETL update")
            clear_cache_sync()
        else:
            self.logger.info("Cache not invalidated (no data changes)")
        return report
