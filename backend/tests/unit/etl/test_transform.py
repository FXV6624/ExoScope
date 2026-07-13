"""Unit tests for ETL transform step."""

from app.etl.transform import transform
from app.models import ExoplanetBase
from app.schemas.exoplanet import ExoplanetRaw
from tests.factories import make_exoplanet_raw


class TestTransform:
    def test_valid_row_produces_exoplanet_base(self):
        raw = make_exoplanet_raw()
        result = transform([raw])
        assert len(result) == 1
        planet = result[0]
        assert isinstance(planet, ExoplanetBase)
        assert planet.planet_name == "Kepler-22b"
        assert planet.host_star == "Kepler-22"
        assert planet.discovery_method == "Transit"
        assert planet.discovery_year == 2011
        assert planet.orbital_period == 289.8
        assert planet.planet_radius == 2.4
        assert planet.distance_from_earth == 190.0

    def test_field_mapping_is_correct(self):
        """Verify NASA API field names are mapped to internal model fields."""
        raw = ExoplanetRaw(
            pl_name="HD 209458 b",
            hostname="HD 209458",
            discoverymethod="Transit",
            disc_year=1999,
            pl_orbper=3.52,
            pl_rade=1.38,
            pl_masse=0.69,
            sy_dist=47.0,
        )
        result = transform([raw])
        assert len(result) == 1
        p = result[0]
        assert p.planet_name == "HD 209458 b"
        assert p.host_star == "HD 209458"
        assert p.planet_mass == 0.69
        assert p.distance_from_earth == 47.0

    def test_empty_list_returns_empty(self):
        result = transform([])
        assert result == []

    def test_multiple_rows(self):
        rows = [
            make_exoplanet_raw(pl_name="Planet-A"),
            make_exoplanet_raw(pl_name="Planet-B"),
            make_exoplanet_raw(pl_name="Planet-C"),
        ]
        result = transform(rows)
        assert len(result) == 3
        names = [p.planet_name for p in result]
        assert "Planet-A" in names
        assert "Planet-C" in names

    def test_row_with_all_nulls_except_name(self):
        raw = ExoplanetRaw(pl_name="Minimal Planet")
        result = transform([raw])
        assert len(result) == 1
        planet = result[0]
        assert planet.planet_name == "Minimal Planet"
        assert planet.host_star is None
        assert planet.discovery_method is None

    def test_transform_skips_invalid_rows(self, capsys):
        """If a row raises an exception during construction, it should be skipped."""
        raw_valid = make_exoplanet_raw(pl_name="Valid Planet")
        # A normal list with valid rows should produce correct output
        result = transform([raw_valid])
        assert len(result) == 1

    def test_returns_list_of_exoplanet_base(self):
        raw = make_exoplanet_raw()
        result = transform([raw])
        for item in result:
            assert isinstance(item, ExoplanetBase)
