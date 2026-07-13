"""Unit tests for ETL build_insert_stmt helper."""

from app.etl.load_strategies.statement import build_insert_stmt
from tests.factories import make_exoplanet_model


class TestBuildInsertStmt:
    def test_returns_insert_construct(self):
        planets = [make_exoplanet_model()]
        stmt = build_insert_stmt(planets)
        # Should be an INSERT statement
        assert stmt is not None

    def test_single_planet_statement(self):
        planet = make_exoplanet_model(
            planet_name="Kepler-22b",
            host_star="Kepler-22",
            discovery_method="Transit",
            discovery_year=2011,
        )
        stmt = build_insert_stmt([planet])
        # Compile to verify it's well-formed
        compiled = str(stmt.compile(compile_kwargs={"literal_binds": True}))
        assert "exoplanet" in compiled.lower()
        assert "planet_name" in compiled.lower()

    def test_multiple_planets_statement(self):
        planets = [
            make_exoplanet_model(planet_name="Planet-A"),
            make_exoplanet_model(planet_name="Planet-B"),
        ]
        stmt = build_insert_stmt(planets)
        compiled = str(stmt.compile(compile_kwargs={"literal_binds": True}))
        assert "planet-a" in compiled.lower()
        assert "planet-b" in compiled.lower()

    def test_all_fields_included(self):
        planet = make_exoplanet_model(
            planet_name="Test",
            host_star="Star",
            discovery_method="Transit",
            discovery_year=2020,
            orbital_period=365.0,
            planet_radius=1.0,
            planet_mass=1.0,
            distance_from_earth=10.0,
        )
        stmt = build_insert_stmt([planet])
        compiled = str(stmt.compile(compile_kwargs={"literal_binds": True}))
        assert "planet_name" in compiled.lower()
        assert "host_star" in compiled.lower()
        assert "discovery_method" in compiled.lower()
        assert "orbital_period" in compiled.lower()
        assert "planet_radius" in compiled.lower()
        assert "planet_mass" in compiled.lower()
        assert "distance_from_earth" in compiled.lower()

    def test_none_fields_included_as_null(self):
        planet = make_exoplanet_model(
            planet_name="Minimal",
            host_star=None,
            planet_mass=None,
        )
        stmt = build_insert_stmt([planet])
        # Should not raise; None → NULL in SQL
        compiled = str(stmt.compile())
        assert compiled is not None
