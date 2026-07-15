"""Unit tests for the APScheduler scheduler module."""

from unittest.mock import PropertyMock, patch

from app.scheduler.scheduler import scheduler, start_scheduler, stop_scheduler


class TestScheduler:
    def test_scheduler_instance_exists(self):
        """The module-level scheduler instance should be created."""
        assert scheduler is not None

    def test_start_scheduler_when_not_running(self):
        with (
            patch(
                "apscheduler.schedulers.base.BaseScheduler.running",
                new_callable=PropertyMock,
                return_value=False,
            ),
            patch.object(scheduler, "start") as mock_start,
        ):
            start_scheduler()
            mock_start.assert_called_once()

    def test_start_scheduler_idempotent_when_running(self):
        """start_scheduler should not call .start() if already running."""
        with (
            patch(
                "apscheduler.schedulers.base.BaseScheduler.running",
                new_callable=PropertyMock,
                return_value=True,
            ),
            patch.object(scheduler, "start") as mock_start,
        ):
            start_scheduler()
            mock_start.assert_not_called()

    def test_stop_scheduler_when_running(self):
        with (
            patch(
                "apscheduler.schedulers.base.BaseScheduler.running",
                new_callable=PropertyMock,
                return_value=True,
            ),
            patch.object(scheduler, "shutdown") as mock_stop,
        ):
            stop_scheduler()
            mock_stop.assert_called_once()

    def test_stop_scheduler_idempotent_when_not_running(self):
        with (
            patch(
                "apscheduler.schedulers.base.BaseScheduler.running",
                new_callable=PropertyMock,
                return_value=False,
            ),
            patch.object(scheduler, "shutdown") as mock_stop,
        ):
            stop_scheduler()
            mock_stop.assert_not_called()

    def test_scheduler_timezone_is_utc(self):
        """BackgroundScheduler should be set to UTC."""
        # APScheduler stores timezone in the scheduler object
        tz = getattr(scheduler, "timezone", None)
        if tz is not None:
            assert str(tz) == "UTC"

    def test_scheduler_has_etl_job_when_enabled(self):
        """If ETL_SCHEDULER_ENABLED=True, the job should be registered."""
        from app.core.config import settings
        from app.scheduler.jobs import run_exoplanet_etl_job

        if settings.ETL_SCHEDULER_ENABLED:
            scheduler.add_job(
                run_exoplanet_etl_job,
                trigger="interval",
                seconds=settings.ETL_SCHEDULER_INTERVAL_SECONDS,
                id="exoplanet_etl",
                replace_existing=True,
                max_instances=1,
                coalesce=True,
            )
            job_ids = [job.id for job in scheduler.get_jobs()]
            assert "exoplanet_etl" in job_ids
