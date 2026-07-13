"""Unit tests for ExoplanetStats schema."""

import pytest
from pydantic import ValidationError

from app.schemas.exoplanet import ExoplanetStats
from app.core.enums.exoplanet import PlanetComposition


def get_mock_stats():
    return {
        "total": 5000,
        "by_method": {"Transit": 3000, "Radial Velocity": 1500, "Direct Imaging": 500},
        "by_decade": {"1990": 10, "2000": 500, "2010": 4490},
        "composition": {"by_composition": {PlanetComposition.ROCKY: 100}, "average_confidence": 0.9},
        "habitability": {"average": 50.0, "minimum": 0.0, "maximum": 100.0, "average_confidence": 0.8, "potentially_habitable": 10},
        "radius": {"average": 1.5, "minimum": 0.5, "maximum": 5.0},
        "mass": {"average": 1.5, "minimum": 0.5, "maximum": 5.0},
        "density": {"average": 1.5, "minimum": 0.5, "maximum": 5.0},
        "equilibrium_temperature": {"average": 300.0, "minimum": 100.0, "maximum": 500.0},
        "orbital_period": {"average": 100.0, "minimum": 1.0, "maximum": 500.0},
        "distance": {"average": 100.0, "minimum": 1.0, "maximum": 500.0},
        "completeness": {
            "host_star": 90.0, "discovery_year": 90.0, "discovery_method": 90.0,
            "planet_radius": 90.0, "planet_mass": 90.0, "planet_density": 90.0,
            "equilibrium_temperature": 90.0, "incident_flux": 90.0, "orbital_period": 90.0,
            "semi_major_axis": 90.0, "orbital_eccentricity": 90.0, "stellar_effective_temperature": 90.0,
            "stellar_radius": 90.0, "stellar_mass": 90.0, "stellar_luminosity": 90.0,
            "stellar_age": 90.0, "distance_from_earth": 90.0, "system_planet_count": 90.0,
            "system_star_count": 90.0, "composition": 90.0, "composition_confidence": 90.0,
            "habitability_score": 90.0, "habitability_confidence": 90.0
        }
    }


class TestExoplanetStats:

    def test_valid_creation(self):
        stats_data = get_mock_stats()
        stats = ExoplanetStats(**stats_data)
        assert stats.total == 5000
        assert stats.by_method["Transit"] == 3000
        assert stats.by_decade["2010"] == 4490

    def test_total_required(self):
        stats_data = get_mock_stats()
        del stats_data["total"]
        with pytest.raises(ValidationError):
            ExoplanetStats(**stats_data)

    def test_by_method_required(self):
        stats_data = get_mock_stats()
        del stats_data["by_method"]
        with pytest.raises(ValidationError):
            ExoplanetStats(**stats_data)

    def test_by_decade_required(self):
        stats_data = get_mock_stats()
        del stats_data["by_decade"]
        with pytest.raises(ValidationError):
            ExoplanetStats(**stats_data)

    def test_total_must_be_int(self):
        stats_data = get_mock_stats()
        stats_data["total"] = "many"
        with pytest.raises(ValidationError):
            ExoplanetStats(**stats_data)

    def test_serialization(self):
        stats_data = get_mock_stats()
        stats = ExoplanetStats(**stats_data)
        d = stats.model_dump()
        assert d["total"] == 5000
        assert d["by_method"] == {"Transit": 3000, "Radial Velocity": 1500, "Direct Imaging": 500}
        assert d["by_decade"] == {"1990": 10, "2000": 500, "2010": 4490}

