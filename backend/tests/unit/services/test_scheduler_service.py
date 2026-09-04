from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from app.services.scheduler import (
    read_scheduler_status_service,
    start_scheduler_service,
    stop_scheduler_service,
    update_scheduler_interval_service,
)


def test_start_scheduler_service_when_not_running():
    with (
        patch("app.services.scheduler.scheduler") as mock_scheduler,
        patch("app.services.scheduler.start_scheduler") as mock_start,
    ):
        mock_scheduler.running = False
        start_scheduler_service()
        mock_start.assert_called_once()


def test_start_scheduler_service_when_already_running():
    with patch("app.services.scheduler.scheduler") as mock_scheduler:
        mock_scheduler.running = True
        with pytest.raises(RuntimeError, match="Scheduler is already running"):
            start_scheduler_service()


def test_stop_scheduler_service_when_running():
    with (
        patch("app.services.scheduler.scheduler") as mock_scheduler,
        patch("app.services.scheduler.stop_scheduler") as mock_stop,
    ):
        mock_scheduler.running = True
        stop_scheduler_service()
        mock_stop.assert_called_once()


def test_stop_scheduler_service_when_not_running():
    with patch("app.services.scheduler.scheduler") as mock_scheduler:
        mock_scheduler.running = False
        with pytest.raises(RuntimeError, match="Scheduler is not running"):
            stop_scheduler_service()


def test_read_scheduler_status_service_with_job():
    mock_job = MagicMock()
    mock_job.next_run_time = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    mock_job.trigger.interval.total_seconds.return_value = 3600

    with patch("app.services.scheduler.scheduler") as mock_scheduler:
        mock_scheduler.running = True
        mock_scheduler.get_job.return_value = mock_job

        status = read_scheduler_status_service()
        assert status["running"] is True
        assert status["interval_seconds"] == 3600
        assert status["next_run"] == mock_job.next_run_time.isoformat()


def test_read_scheduler_status_service_without_job():
    with patch("app.services.scheduler.scheduler") as mock_scheduler:
        mock_scheduler.running = False
        mock_scheduler.get_job.return_value = None

        status = read_scheduler_status_service()
        assert status["running"] is False
        assert status["interval_seconds"] is None
        assert status["next_run"] is None


def test_update_scheduler_interval_service():
    with patch("app.services.scheduler.update_scheduler_interval") as mock_update:
        update_scheduler_interval_service(120)
        mock_update.assert_called_once_with(120)
