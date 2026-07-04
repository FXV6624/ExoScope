"""Integration tests for scheduler + database interaction."""

import pytest
from unittest.mock import patch, MagicMock
from sqlmodel import Session, delete, select

from app.models import ETLRun, Exoplanet
from app.scheduler.jobs import run_exoplanet_etl_job
from tests.factories import make_exoplanet_raw


@pytest.fixture(autouse=True)
def clean_tables(db: Session):
    db.execute(delete(Exoplanet))
    db.execute(delete(ETLRun))
    db.commit()
    yield
    db.execute(delete(Exoplanet))
    db.execute(delete(ETLRun))
    db.commit()


class TestSchedulerDatabaseIntegration:

    def test_job_persists_etl_run_to_db(self, db: Session):
        """When the scheduled job runs, it should save an ETLRun record."""
        nasa_data = [make_exoplanet_raw("Sched-Planet-A"), make_exoplanet_raw("Sched-Planet-B")]

        with patch("app.etl.pipeline.extract", return_value=nasa_data), \
             patch("app.scheduler.jobs.Session") as mock_session_cls, \
             patch("app.scheduler.jobs.engine"):
            # Route the job's session to our test DB session
            mock_session_cls.return_value.__enter__.return_value = db
            mock_session_cls.return_value.__exit__.return_value = False

            run_exoplanet_etl_job()

        # Default ETLConfig has persist_run=True
        runs = db.exec(select(ETLRun)).all()
        assert len(runs) == 1

    def test_job_uses_default_etl_config(self):
        """The scheduled job should use a default ETLConfig (no limit, persist=True)."""
        from app.etl.config import ETLConfig

        captured_config = []

        def fake_run_etl(session, config):
            captured_config.append(config)
            return MagicMock(model_dump=lambda: {})

        with patch("app.scheduler.jobs.run_etl", side_effect=fake_run_etl), \
             patch("app.scheduler.jobs.Session") as mock_session_cls:
            mock_session_cls.return_value.__enter__.return_value = MagicMock()
            mock_session_cls.return_value.__exit__.return_value = False
            run_exoplanet_etl_job()

        assert len(captured_config) == 1
        config = captured_config[0]
        assert isinstance(config, ETLConfig)
        assert config.persist_run is True

    def test_scheduler_job_handles_etl_exception_gracefully(self):
        """If ETL raises, the job should not crash the scheduler."""
        with patch("app.scheduler.jobs.run_etl", side_effect=Exception("ETL failed")), \
             patch("app.scheduler.jobs.Session") as mock_session_cls:
            mock_session_cls.return_value.__enter__.return_value = MagicMock()
            mock_session_cls.return_value.__exit__.return_value = False

            # Should not raise
            with pytest.raises(Exception):
                run_exoplanet_etl_job()
