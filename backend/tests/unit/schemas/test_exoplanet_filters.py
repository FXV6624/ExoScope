"""Unit tests for ExoplanetFilters schema."""


from app.schemas.exoplanet import ExoplanetFilters


class TestExoplanetFilters:

    def test_empty_filters(self):
        """All fields optional → empty instance is valid."""
        f = ExoplanetFilters()
        assert f.planet_name is None
        assert f.host_star is None
        assert f.discovery_method is None
        assert f.discovery_year is None
        assert f.min_discovery_year is None
        assert f.max_discovery_year is None

    def test_string_filters(self):
        f = ExoplanetFilters(planet_name="Kepler", host_star="Sun", discovery_method="Transit")
        assert f.planet_name == "Kepler"
        assert f.host_star == "Sun"
        assert f.discovery_method == "Transit"

    def test_exact_year_filter(self):
        f = ExoplanetFilters(discovery_year=2000)
        assert f.discovery_year == 2000

    def test_year_range_filters(self):
        f = ExoplanetFilters(min_discovery_year=1995, max_discovery_year=2010)
        assert f.min_discovery_year == 1995
        assert f.max_discovery_year == 2010

    def test_orbital_period_range(self):
        f = ExoplanetFilters(min_orbital_period=100.0, max_orbital_period=500.0)
        assert f.min_orbital_period == 100.0
        assert f.max_orbital_period == 500.0

    def test_radius_range(self):
        f = ExoplanetFilters(min_planet_radius=0.5, max_planet_radius=5.0)
        assert f.min_planet_radius == 0.5
        assert f.max_planet_radius == 5.0

    def test_mass_range(self):
        f = ExoplanetFilters(min_planet_mass=0.1, max_planet_mass=10.0)
        assert f.min_planet_mass == 0.1
        assert f.max_planet_mass == 10.0

    def test_model_dump_excludes_none_by_default(self):
        f = ExoplanetFilters(planet_name="Kepler")
        d = f.model_dump(exclude_none=True)
        assert "planet_name" in d
        assert "host_star" not in d

    def test_all_fields_present_in_model_dump(self):
        f = ExoplanetFilters(planet_name="X")
        d = f.model_dump()
        expected_keys = {
            "planet_name", "host_star", "discovery_method", "discovery_year",
            "min_discovery_year", "max_discovery_year",
            "min_orbital_period", "max_orbital_period",
            "min_planet_radius", "max_planet_radius",
            "min_planet_mass", "max_planet_mass",
            "composition", "min_composition_confidence",
            "min_habitability_score", "max_habitability_score",
            "min_habitability_confidence", "min_distance_from_earth",
            "max_distance_from_earth", "min_equilibrium_temperature",
            "max_equilibrium_temperature", "system_planet_count",
            "min_system_planet_count", "min_orbital_eccentricity",
            "max_orbital_eccentricity"
        }
        assert expected_keys == set(d.keys())
