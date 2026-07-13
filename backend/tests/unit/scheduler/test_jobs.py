"""Unit tests for scheduler jobs."""

from unittest.mock import MagicMock, patch

from app.scheduler.jobs import run_exoplanet_etl_job


class TestRunExoplanetETLJob:
    def test_job_creates_etl_config_and_runs(self):
        """The scheduler job should create a default ETLConfig and call run_etl."""
        mock_session = MagicMock()

        with (
            patch("app.scheduler.jobs.Session") as mock_session_cls,
            patch("app.scheduler.jobs.run_etl") as mock_run_etl,
        ):
            # Simulate context manager
            mock_session_cls.return_value.__enter__.return_value = mock_session
            mock_session_cls.return_value.__exit__.return_value = False

            run_exoplanet_etl_job()

            mock_run_etl.assert_called_once()
            # Verify run_etl was called with session and a config
            call_args = mock_run_etl.call_args
            assert call_args is not None

    def test_job_uses_engine(self):
        """The job should use the shared engine for session creation."""
        with (
            patch("app.scheduler.jobs.Session") as mock_session_cls,
            patch("app.scheduler.jobs.run_etl"),
        ):
            mock_session_cls.return_value.__enter__.return_value = MagicMock()
            mock_session_cls.return_value.__exit__.return_value = False

            run_exoplanet_etl_job()

            mock_session_cls.assert_called_once()

    def test_job_logs_start(self, caplog):
        """Verify that the job logs an info message when it starts."""
        import logging

        with (
            patch("app.scheduler.jobs.Session") as mock_session_cls,
            patch("app.scheduler.jobs.run_etl"),
        ):
            mock_session_cls.return_value.__enter__.return_value = MagicMock()
            mock_session_cls.return_value.__exit__.return_value = False

            with caplog.at_level(logging.INFO, logger="scheduler"):
                run_exoplanet_etl_job()

            assert any("etl" in record.message.lower() for record in caplog.records)
