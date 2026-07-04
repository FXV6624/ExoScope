"""Integration tests for the full ETL Pipeline (ExoplanetETL)."""

import pytest
from unittest.mock import patch, MagicMock
from sqlmodel import Session, delete, select

from app.models import Exoplanet, ETLRun
from app.etl.pipeline import ExoplanetETL
from app.etl.config import ETLConfig
from app.etl.enums import LoadMode
from app.etl.report import ETLReport
from tests.factories import make_exoplanet_raw, make_exoplanet_base


NASA_ROWS = [
    make_exoplanet_raw("Pipeline-A", "Star-A"),
    make_exoplanet_raw("Pipeline-B", "Star-B"),
    make_exoplanet_raw("Pipeline-C", "Star-C"),
]


@pytest.fixture(autouse=True)
def clean_tables(db: Session):
    db.execute(delete(Exoplanet))
    db.execute(delete(ETLRun))
    db.commit()
    yield
    db.execute(delete(Exoplanet))
    db.execute(delete(ETLRun))
    db.commit()


class TestExoplanetETLPipeline:

    def _run_with_mock_extract(self, db: Session, config: ETLConfig, data=None) -> ETLReport:
        if data is None:
            data = NASA_ROWS
        with patch("app.etl.pipeline.extract", return_value=data):
            etl = ExoplanetETL(session=db, config=config)
            return etl.run()

    def test_full_pipeline_succeeds(self, db: Session):
        config = ETLConfig(limit=3, dry_run=False, persist_run=False, load_mode=LoadMode.UPSERT)
        report = self._run_with_mock_extract(db, config)
        assert report.extracted == 3
        assert report.transformed == 3
        assert len(report.errors) == 0

    def test_planets_persisted_to_db(self, db: Session):
        config = ETLConfig(limit=3, dry_run=False, persist_run=False, load_mode=LoadMode.UPSERT)
        self._run_with_mock_extract(db, config)

        planets = db.exec(select(Exoplanet)).all()
        assert len(planets) == 3
        names = {p.planet_name for p in planets}
        assert "Pipeline-A" in names

    def test_dry_run_does_not_persist_planets(self, db: Session):
        config = ETLConfig(limit=3, dry_run=True, persist_run=False)
        self._run_with_mock_extract(db, config)

        planets = db.exec(select(Exoplanet)).all()
        assert len(planets) == 0

    def test_persist_run_saves_etl_run(self, db: Session):
        config = ETLConfig(limit=3, dry_run=True, persist_run=True)
        self._run_with_mock_extract(db, config)

        runs = db.exec(select(ETLRun)).all()
        assert len(runs) == 1

    def test_no_persist_run_skips_etl_run(self, db: Session):
        config = ETLConfig(limit=3, dry_run=True, persist_run=False)
        self._run_with_mock_extract(db, config)

        runs = db.exec(select(ETLRun)).all()
        assert len(runs) == 0

    def test_extract_failure_returns_report_with_errors(self, db: Session):
        config = ETLConfig(limit=3, dry_run=False, persist_run=False)
        with patch("app.etl.pipeline.extract", side_effect=Exception("API down")):
            etl = ExoplanetETL(session=db, config=config)
            report = etl.run()

        assert len(report.errors) == 1
        assert "API down" in report.errors[0]

    def test_report_has_timing_info(self, db: Session):
        config = ETLConfig(limit=3, dry_run=False, persist_run=False)
        report = self._run_with_mock_extract(db, config)

        assert report.duration_seconds >= 0
        assert report.extract_time >= 0
        assert report.transform_time >= 0

    def test_empty_extract_returns_zero_counts(self, db: Session):
        config = ETLConfig(dry_run=False, persist_run=False)
        report = self._run_with_mock_extract(db, config, data=[])

        assert report.extracted == 0
        assert report.transformed == 0
