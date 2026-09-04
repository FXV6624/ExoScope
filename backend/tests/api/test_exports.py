"""API tests for /exports endpoints."""

from fastapi.testclient import TestClient

from app.core.config import settings

API = settings.API_V1_STR


class TestExportExoplanets:
    def test_export_csv_default(self, client: TestClient):
        response = client.get(f"{API}/exports/export")
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert 'attachment; filename="exoplanets.csv"' in response.headers.get(
            "content-disposition", ""
        )

    def test_export_json_format(self, client: TestClient):
        response = client.get(f"{API}/exports/export", params={"format": "json"})
        assert response.status_code == 200
        assert "application/json" in response.headers["content-type"]
        assert 'attachment; filename="exoplanets.json"' in response.headers.get(
            "content-disposition", ""
        )

    def test_export_parquet_format(self, client: TestClient):
        response = client.get(f"{API}/exports/export", params={"format": "parquet"})
        assert response.status_code == 200
        assert "application/octet-stream" in response.headers["content-type"]
        assert 'attachment; filename="exoplanets.parquet"' in response.headers.get(
            "content-disposition", ""
        )

    def test_export_compressed_zip(self, client: TestClient):
        response = client.get(
            f"{API}/exports/export",
            params={"format": "csv", "compress": "true", "filename": "my_export"},
        )
        assert response.status_code == 200
        assert "application/zip" in response.headers["content-type"]
        assert 'attachment; filename="my_export.zip"' in response.headers.get(
            "content-disposition", ""
        )

    def test_export_with_fields(self, client: TestClient):
        response = client.get(
            f"{API}/exports/export",
            params=[("fields", "planet_name"), ("fields", "discovery_method")],
        )
        assert response.status_code == 200
