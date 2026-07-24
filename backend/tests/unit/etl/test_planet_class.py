"""Unit tests for app/etl/enrich/planet_class.py."""

from app.core.enums.exoplanet import PlanetClass
from app.etl.enrich.planet_class import calculate_planet_class
from tests.factories import make_exoplanet_base


class TestCalculatePlanetClass:
    def test_unknown_when_radius_missing(self):
        planet = make_exoplanet_base(planet_radius=None, planet_mass=1.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.UNKNOWN
        assert res.confidence == 0.0

    def test_terrestrial_classification(self):
        planet = make_exoplanet_base(planet_radius=1.0, planet_mass=1.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.TERRESTRIAL

    def test_super_earth_classification(self):
        planet = make_exoplanet_base(planet_radius=1.5, planet_mass=3.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.SUPER_EARTH

    def test_sub_neptune_classification(self):
        planet = make_exoplanet_base(planet_radius=3.0, planet_mass=10.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.SUB_NEPTUNE

    def test_neptune_classification(self):
        planet = make_exoplanet_base(planet_radius=5.0, planet_mass=20.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.NEPTUNE

    def test_ice_giant_classification(self):
        planet = make_exoplanet_base(planet_radius=8.0, planet_mass=50.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.ICE_GIANT

    def test_gas_giant_classification(self):
        planet = make_exoplanet_base(planet_radius=12.0, planet_mass=300.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.GAS_GIANT

    def test_confidence_higher_with_mass(self):
        planet_with_mass = make_exoplanet_base(planet_radius=3.0, planet_mass=10.0)
        planet_without_mass = make_exoplanet_base(planet_radius=3.0, planet_mass=None)

        res_mass = calculate_planet_class(planet_with_mass)
        res_no_mass = calculate_planet_class(planet_without_mass)

        assert res_mass.confidence == 0.95
        assert res_no_mass.confidence == 0.75

    def test_proximity_penalty_near_boundary(self):
        # 1.98 RE is very close to boundary 2.0 (Super Earth / Sub-Neptune boundary)
        planet_boundary = make_exoplanet_base(planet_radius=1.98, planet_mass=5.0)
        # 3.0 RE is right in the center of Sub-Neptune (2.0 to 4.0)
        planet_center = make_exoplanet_base(planet_radius=3.0, planet_mass=10.0)

        res_boundary = calculate_planet_class(planet_boundary)
        res_center = calculate_planet_class(planet_center)

        assert res_boundary.confidence < res_center.confidence
        # 1.98 is distance 0.02 from boundary 2.0 -> penalty = 0.20 * (1 - 0.02/0.25) = 0.184 -> confidence ~ 0.766
        assert res_boundary.confidence < 0.80
        assert res_center.confidence == 0.95
