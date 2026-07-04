"""API tests for /etl endpoints."""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.core.config import settings
from app.etl.report import ETLReport
from tests.factories import make_etl_report


API = settings.API_V1_STR


class TestRunETL:

    def test_run_etl_requires_superuser(self, client: TestClient, normal_user_token_headers: dict):
        response = client.post(f"{API}/etl/run", headers=normal_user_token_headers, json={})
        assert response.status_code == 403

    def test_run_etl_requires_auth(self, client: TestClient):
        response = client.post(f"{API}/etl/run", json={})
        assert response.status_code == 401

    @patch("app.api.routes.etl.run_etl")
    def test_run_etl_success(self, mock_run_etl, client: TestClient, superuser_token_headers: dict):
        # Mock the run_etl function to return a dummy report
        report = make_etl_report(extracted=50, transformed=50)
        mock_run_etl.return_value = report

        payload = {"limit": 50, "dry_run": True, "load_mode": "upsert"}
        response = client.post(f"{API}/etl/run", headers=superuser_token_headers, json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "report" in data
        assert data["report"]["extracted"] == 50

        # Verify config was passed correctly
        mock_run_etl.assert_called_once()
        config_arg = mock_run_etl.call_args[0][1]
        assert config_arg.limit == 50
        assert config_arg.dry_run is True

    def test_invalid_load_mode_returns_422(self, client: TestClient, superuser_token_headers: dict):
        payload = {"load_mode": "invalid_mode"}
        response = client.post(f"{API}/etl/run", headers=superuser_token_headers, json=payload)
        assert response.status_code == 422
