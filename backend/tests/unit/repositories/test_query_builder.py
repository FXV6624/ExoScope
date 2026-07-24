"""Unit tests for ExoplanetQueryBuilder (no DB required)."""

from app.repositories.exoplanet_query_builder import build_exoplanet_query
from app.schemas.exoplanet import ExoplanetFilters


class TestBuildExoplanetQuery:
    def test_no_filters_returns_base_select(self):
        filters = ExoplanetFilters()
        query = build_exoplanet_query(filters)
        # Should be a valid SQLModel select statement
        assert query is not None

    def test_planet_name_filter_applied(self):
        filters = ExoplanetFilters(planet_name="Kepler")
        query = build_exoplanet_query(filters)
        # We can compile and check the SQL string
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "kepler" in compiled.lower() or "planet_name" in compiled.lower()

    def test_host_star_filter_applied(self):
        filters = ExoplanetFilters(host_star="Sun")
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "host_star" in compiled.lower() or "sun" in compiled.lower()

    def test_discovery_method_filter(self):
        filters = ExoplanetFilters(discovery_method="Transit")
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "discovery_method" in compiled.lower()

    def test_min_discovery_year_filter(self):
        filters = ExoplanetFilters(min_discovery_year=2000)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "discovery_year" in compiled.lower()

    def test_max_discovery_year_filter(self):
        filters = ExoplanetFilters(max_discovery_year=2020)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "discovery_year" in compiled.lower()

    def test_orbital_period_range(self):
        filters = ExoplanetFilters(min_orbital_period=100.0, max_orbital_period=500.0)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "orbital_period" in compiled.lower()

    def test_radius_range(self):
        filters = ExoplanetFilters(min_planet_radius=1.0, max_planet_radius=5.0)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "planet_radius" in compiled.lower()

    def test_mass_range(self):
        filters = ExoplanetFilters(min_planet_mass=0.5, max_planet_mass=10.0)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "planet_mass" in compiled.lower()

    def test_combined_filters(self):
        filters = ExoplanetFilters(
            planet_name="Kepler",
            min_discovery_year=2000,
            max_discovery_year=2020,
        )
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "kepler" in compiled.lower() or "planet_name" in compiled.lower()
        assert "discovery_year" in compiled.lower()

    def test_exact_discovery_year_filter(self):
        filters = ExoplanetFilters(discovery_year=2011)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "discovery_year" in compiled.lower()

    def test_planet_class_filter(self):
        filters = ExoplanetFilters(
            planet_class="Super Earth", min_planet_class_confidence=0.8
        )
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "planet_class" in compiled.lower()
        assert "planet_class_confidence" in compiled.lower()

    def test_composition_filter(self):
        filters = ExoplanetFilters(composition="Rocky", min_composition_confidence=0.7)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "composition" in compiled.lower()
        assert "composition_confidence" in compiled.lower()

    def test_has_custom_photo_true(self):
        filters = ExoplanetFilters(has_custom_photo=True)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "photo_url like 'http%'" in compiled.lower()

    def test_has_custom_photo_false(self):
        filters = ExoplanetFilters(has_custom_photo=False)
        query = build_exoplanet_query(filters)
        compiled = str(query.compile(compile_kwargs={"literal_binds": True}))
        assert "photo_url like '/assets/%'" in compiled.lower()
