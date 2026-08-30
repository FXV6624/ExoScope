"""Unit tests for services/exoplanets.py (with mocked repositories)."""

import uuid
from unittest.mock import MagicMock, patch

from app.core.enums.exoplanet import ExoplanetSortField, SortOrder
from app.models import Exoplanet
from app.schemas.exoplanet import ExoplanetFilters
from app.services import exoplanets as exo_service


def _make_exoplanet(name="Kepler-22b"):
    e = MagicMock(spec=Exoplanet)
    e.id = uuid.uuid4()
    e.planet_name = name
    return e


class TestReadExoplanetsService:
    def test_returns_data_and_count(self):
        session = MagicMock()
        filters = ExoplanetFilters()
        mock_data = [_make_exoplanet("A"), _make_exoplanet("B")]

        with patch(
            "app.services.exoplanets.get_exoplanets_with_filters",
            return_value=(mock_data, 2),
        ) as mock_get:
            result = exo_service.read_exoplanets_service(
                session, filters, skip=0, limit=50
            )
            mock_get.assert_called_once_with(
                session,
                filters,
                0,
                50,
                ExoplanetSortField.PLANET_NAME,
                SortOrder.asc,
                None,
            )
            assert result.meta.count == 2
            assert len(result.data) == 2

    def test_empty_result(self):
        session = MagicMock()
        filters = ExoplanetFilters()
        with patch(
            "app.services.exoplanets.get_exoplanets_with_filters", return_value=([], 0)
        ):
            result = exo_service.read_exoplanets_service(session, filters, 0, 10)
            assert result.meta.count == 0
            assert result.data == []


class TestReadExoplanetByIdService:
    def test_returns_exoplanet_when_found(self):
        session = MagicMock()
        planet = _make_exoplanet()
        planet.photo_url = "https://images.nasa.gov/k22b.jpg"
        with patch(
            "app.services.exoplanets.get_exoplanet_by_id", return_value=planet
        ) as mock_get:
            result = exo_service.read_exoplanet_by_id_service(session, planet.id)
            assert result is planet
            mock_get.assert_called_once_with(session, planet.id)

    def test_returns_none_when_not_found(self):
        session = MagicMock()
        with patch("app.services.exoplanets.get_exoplanet_by_id", return_value=None):
            result = exo_service.read_exoplanet_by_id_service(session, uuid.uuid4())
            assert result is None

    def test_on_demand_photo_enrichment_updates_db(self):
        session = MagicMock()
        planet = _make_exoplanet()
        planet.photo_url = "/assets/images/planets/rocky.webp"
        planet.composition = "Rocky"

        with (
            patch("app.services.exoplanets.get_exoplanet_by_id", return_value=planet),
            patch(
                "app.services.exoplanets.find_photo_url",
                return_value="https://images.nasa.gov/real.jpg",
            ),
            patch("app.services.exoplanets.clear_cache_sync"),
        ):
            result = exo_service.read_exoplanet_by_id_service(session, planet.id)
            assert result.photo_url == "https://images.nasa.gov/real.jpg"
            session.add.assert_called_once_with(planet)
            session.commit.assert_called_once()


class TestGetExoplanetStatsService:
    def test_aggregates_stats_correctly(self):
        session = MagicMock()
        by_method_rows = [("Transit", 3000), ("Radial Velocity", 1500)]
        by_decade_rows = [(1990, 10), (2000, 500), (2010, 4490)]
        by_class_rows = [("Terrestrial", 50)]
        by_composition_rows = [("Rocky", 100)]
        habitability_stats = (50.0, 0.0, 100.0, 0.8, 10)
        summary_stats = (1.5, 0.5, 5.0)

        mock_completeness = MagicMock()
        mock_completeness._mapping = {
            "total": 100,
            "host_star": 90,
            "discovery_year": 90,
            "discovery_method": 90,
            "planet_radius": 90,
            "planet_mass": 90,
            "planet_density": 90,
            "equilibrium_temperature": 90,
            "incident_flux": 90,
            "orbital_period": 90,
            "semi_major_axis": 90,
            "orbital_eccentricity": 90,
            "stellar_effective_temperature": 90,
            "stellar_radius": 90,
            "stellar_mass": 90,
            "stellar_luminosity": 90,
            "stellar_age": 90,
            "distance_from_earth": 90,
            "system_planet_count": 90,
            "system_star_count": 90,
            "planet_class": 90,
            "planet_class_confidence": 90,
            "composition": 90,
            "composition_confidence": 90,
            "habitability_score": 90,
            "habitability_confidence": 90,
        }

        with (
            patch("app.services.exoplanets.count_exoplanets", return_value=5000),
            patch(
                "app.services.exoplanets.get_by_discovery_method",
                return_value=by_method_rows,
            ),
            patch(
                "app.services.exoplanets.get_by_discovery_decade",
                return_value=by_decade_rows,
            ),
            patch(
                "app.services.exoplanets.get_habitability_stats",
                return_value=habitability_stats,
            ),
            patch(
                "app.services.exoplanets.get_summary_stats", return_value=summary_stats
            ),
            patch(
                "app.services.exoplanets.get_by_planet_class",
                return_value=by_class_rows,
            ),
            patch(
                "app.services.exoplanets.get_by_composition",
                return_value=by_composition_rows,
            ),
            patch(
                "app.services.exoplanets.get_completeness",
                return_value=mock_completeness,
            ),
        ):
            stats = exo_service.get_exoplanet_stats_service(session)
            assert stats.total == 5000
            assert stats.by_method["Transit"] == 3000
            assert stats.by_decade["2010"] == 4490
            assert stats.planet_class.by_class["Terrestrial"] == 50
            assert stats.composition.by_composition["Rocky"] == 100

    def test_empty_stats(self):
        session = MagicMock()
        habitability_stats = (None, None, None, None, 0)
        summary_stats = (None, None, None)

        mock_completeness = MagicMock()
        mock_completeness._mapping = {"total": 0}

        with (
            patch("app.services.exoplanets.count_exoplanets", return_value=0),
            patch("app.services.exoplanets.get_by_discovery_method", return_value=[]),
            patch("app.services.exoplanets.get_by_discovery_decade", return_value=[]),
            patch(
                "app.services.exoplanets.get_habitability_stats",
                return_value=habitability_stats,
            ),
            patch(
                "app.services.exoplanets.get_summary_stats", return_value=summary_stats
            ),
            patch("app.services.exoplanets.get_by_planet_class", return_value=[]),
            patch("app.services.exoplanets.get_by_composition", return_value=[]),
            patch(
                "app.services.exoplanets.get_completeness",
                return_value=mock_completeness,
            ),
        ):
            stats = exo_service.get_exoplanet_stats_service(session)
            assert stats.total == 0
            assert stats.by_method == {}
            assert stats.by_decade == {}


class TestInternalHelpers:
    def test_to_dict(self):
        rows = [("Transit", 3000), ("Radial Velocity", 1500)]
        result = exo_service._to_dict(rows)
        assert result == {"Transit": 3000, "Radial Velocity": 1500}

    def test_to_dict_empty(self):
        assert exo_service._to_dict([]) == {}

    def test_format_by_decade(self):
        rows = [(1990, 10), (2000, 500)]
        result = exo_service._format_by_decade(rows)
        assert result == {"1990": 10, "2000": 500}

    def test_format_by_decade_empty(self):
        assert exo_service._format_by_decade([]) == {}

    def test_format_by_decade_keys_are_strings(self):
        rows = [(2010, 100)]
        result = exo_service._format_by_decade(rows)
        assert "2010" in result
        assert isinstance(list(result.keys())[0], str)
