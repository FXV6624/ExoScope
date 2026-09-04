"""API tests for /scheduler endpoints."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.config import settings

API = settings.API_V1_STR


class TestSchedulerApi:
    def test_get_scheduler_status(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.get(f"{API}/scheduler/", headers=superuser_token_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ok"
        assert "scheduler" in body

    def test_get_scheduler_status_unauthorized(self, client: TestClient):
        response = client.get(f"{API}/scheduler/")
        assert response.status_code == 401

    def test_start_scheduler_success(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch("app.api.routes.scheduler.start_scheduler_service"):
            response = client.post(
                f"{API}/scheduler/start", headers=superuser_token_headers
            )
            assert response.status_code == 200
            assert response.json()["status"] == "ok"

    def test_start_scheduler_conflict(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch(
            "app.api.routes.scheduler.start_scheduler_service",
            side_effect=RuntimeError("Scheduler is already running"),
        ):
            response = client.post(
                f"{API}/scheduler/start", headers=superuser_token_headers
            )
            assert response.status_code == 409
            assert "Scheduler is already running" in response.json()["detail"]

    def test_stop_scheduler_success(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch("app.api.routes.scheduler.stop_scheduler_service"):
            response = client.post(
                f"{API}/scheduler/stop", headers=superuser_token_headers
            )
            assert response.status_code == 200
            assert response.json()["status"] == "ok"

    def test_stop_scheduler_conflict(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch(
            "app.api.routes.scheduler.stop_scheduler_service",
            side_effect=RuntimeError("Scheduler is not running"),
        ):
            response = client.post(
                f"{API}/scheduler/stop", headers=superuser_token_headers
            )
            assert response.status_code == 409
            assert "Scheduler is not running" in response.json()["detail"]

    def test_update_scheduler_interval_success(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch("app.api.routes.scheduler.update_scheduler_interval_service"):
            response = client.patch(
                f"{API}/scheduler/",
                headers=superuser_token_headers,
                json={"interval_seconds": 3600},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "ok"

    def test_update_scheduler_interval_job_not_found(
        self, client: TestClient, superuser_token_headers: dict
    ):
        with patch(
            "app.api.routes.scheduler.update_scheduler_interval_service",
            side_effect=ValueError("ETL scheduler job does not exist"),
        ):
            response = client.patch(
                f"{API}/scheduler/",
                headers=superuser_token_headers,
                json={"interval_seconds": 3600},
            )
            assert response.status_code == 404
            assert "ETL scheduler job does not exist" in response.json()["detail"]
