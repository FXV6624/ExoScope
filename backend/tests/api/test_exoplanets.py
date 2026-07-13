"""API tests for /exoplanets endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.models import Exoplanet

API = settings.API_V1_STR


@pytest.fixture(autouse=True)
def clean_exoplanets(db: Session):
    db.execute(delete(Exoplanet))
    db.commit()
    yield
    db.execute(delete(Exoplanet))
    db.commit()


def _insert_planet(db: Session, name: str, method: str = "Transit", year: int = 2010):
    p = Exoplanet(planet_name=name, host_star="Star", discovery_method=method, discovery_year=year)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


class TestGetExoplanets:

    def test_get_all_exoplanets_requires_auth(self, client: TestClient):
        response = client.get(f"{API}/exoplanets/")
        assert response.status_code == 401

    def test_get_all_exoplanets_returns_list(self, client: TestClient, superuser_token_headers: dict, db: Session):
        _insert_planet(db, "P1")
        _insert_planet(db, "P2")

        response = client.get(f"{API}/exoplanets/", headers=superuser_token_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["data"]) == 2

    def test_exoplanets_filters(self, client: TestClient, superuser_token_headers: dict, db: Session):
        _insert_planet(db, "Target", method="Radial Velocity", year=2020)
        _insert_planet(db, "Other", method="Transit", year=2010)

        response = client.get(f"{API}/exoplanets/?discovery_year=2020", headers=superuser_token_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["data"][0]["planet_name"] == "Target"


class TestGetExoplanetStats:

    def test_get_stats_requires_auth(self, client: TestClient):
        response = client.get(f"{API}/exoplanets/stats")
        assert response.status_code == 401

    def test_get_stats_returns_aggregated_data(self, client: TestClient, superuser_token_headers: dict, db: Session):
        _insert_planet(db, "P1", method="Transit", year=2015)
        _insert_planet(db, "P2", method="Transit", year=2018)
        _insert_planet(db, "P3", method="Radial Velocity", year=1995)

        response = client.get(f"{API}/exoplanets/stats", headers=superuser_token_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert data["by_method"]["Transit"] == 2
        assert data["by_method"]["Radial Velocity"] == 1
        assert data["by_decade"]["2010"] == 2
        assert data["by_decade"]["1990"] == 1


class TestGetExoplanetById:

    def test_get_by_id_returns_planet(self, client: TestClient, superuser_token_headers: dict, db: Session):
        p = _insert_planet(db, "MyPlanet")
        response = client.get(f"{API}/exoplanets/{p.id}", headers=superuser_token_headers)
        assert response.status_code == 200
        assert response.json()["planet_name"] == "MyPlanet"

    def test_get_by_id_not_found(self, client: TestClient, superuser_token_headers: dict):
        response = client.get(f"{API}/exoplanets/{uuid.uuid4()}", headers=superuser_token_headers)
        assert response.status_code == 404

    def test_get_by_id_invalid_uuid(self, client: TestClient, superuser_token_headers: dict):
        response = client.get(f"{API}/exoplanets/not-a-uuid", headers=superuser_token_headers)
        assert response.status_code == 404
