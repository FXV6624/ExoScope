import zipfile
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from sqlmodel import Session

from app.exports.schemas import ExportFormat, ExportRequest
from app.models import Exoplanet
from app.repositories.exports import get_exoplanets_for_export
from app.schemas.exoplanet import ExoplanetFilters
from app.services.exports import export_exoplanets


@pytest.fixture
def mock_exoplanet():
    return Exoplanet(
        id=1,
        planet_name="Test-1b",
        hostname="Test-1",
        discovery_method="Transit",
        disc_year=2020,
        orbital_period_days=10.5,
        radius_earth=1.2,
        mass_earth=2.0,
        density=3.5,
        semi_major_axis_au=0.05,
        is_habitable=False,
    )


def test_export_exoplanets_invalid_fields(db: Session):
    filters = ExoplanetFilters()
    request = ExportRequest(
        format=ExportFormat.CSV,
        fields=["non_existent_field", "planet_name"],
    )

    with pytest.raises(HTTPException) as exc_info:
        export_exoplanets(db, filters, request)

    assert exc_info.value.status_code == 400
    assert "Invalid export fields" in exc_info.value.detail


def test_export_exoplanets_with_fields_filtering(db: Session, mock_exoplanet):
    filters = ExoplanetFilters()
    request = ExportRequest(
        format=ExportFormat.JSON,
        fields=["planet_name", "discovery_method"],
        compress=False,
    )

    with patch(
        "app.services.exports.get_exoplanets_for_export", return_value=[mock_exoplanet]
    ):
        buffer = export_exoplanets(db, filters, request)

    content = buffer.getvalue().decode("utf-8")
    assert "Test-1b" in content
    assert "Transit" in content


def test_export_exoplanets_compressed_zip(db: Session, mock_exoplanet):
    filters = ExoplanetFilters()
    request = ExportRequest(
        format=ExportFormat.CSV,
        filename="custom_planets",
        compress=True,
    )

    with patch(
        "app.services.exports.get_exoplanets_for_export", return_value=[mock_exoplanet]
    ):
        buffer = export_exoplanets(db, filters, request)

    with zipfile.ZipFile(buffer, "r") as z:
        names = z.namelist()
        assert "custom_planets.csv" in names
        data = z.read("custom_planets.csv").decode("utf-8")
        assert "Test-1b" in data


def test_get_exoplanets_for_export_repository(db: Session):
    planet = Exoplanet(
        planet_name="RepoExportPlanet-1",
        hostname="RepoHost-1",
        discovery_method="Transit",
        disc_year=2021,
        orbital_period_days=5.0,
        radius_earth=1.0,
        mass_earth=1.0,
        is_habitable=True,
    )
    db.add(planet)
    db.commit()

    filters = ExoplanetFilters(search="RepoExportPlanet-1")
    results = get_exoplanets_for_export(db, filters)
    assert len(results) >= 1
    assert any(p.planet_name == "RepoExportPlanet-1" for p in results)

    # Cleanup
    db.delete(planet)
    db.commit()
