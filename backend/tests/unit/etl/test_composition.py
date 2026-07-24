"""Unit tests for app/etl/enrich/composition.py."""

from app.core.enums.exoplanet import PlanetComposition
from app.etl.enrich.composition import calculate_composition
from tests.factories import make_exoplanet_base


class TestCalculateComposition:
    def test_case_1_measured_density_rocky_iron(self):
        planet = make_exoplanet_base(planet_density=7.0)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY_IRON
        assert res.confidence == 0.95

    def test_case_1_measured_density_rocky(self):
        planet = make_exoplanet_base(planet_density=5.0)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY
        assert res.confidence == 0.95

    def test_case_1_measured_density_water_world(self):
        planet = make_exoplanet_base(planet_density=3.0)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.WATER_WORLD
        assert res.confidence == 0.95

    def test_case_1_measured_density_ice(self):
        planet = make_exoplanet_base(planet_density=1.5)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ICE
        assert res.confidence == 0.95

    def test_case_1_measured_density_hydrogen_helium(self):
        planet = make_exoplanet_base(planet_density=0.5)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.HYDROGEN_HELIUM
        assert res.confidence == 0.95

    def test_case_2_estimated_density(self):
        # M = 8.0, R = 2.0 -> estimated density = 8 / (2^3) = 1.0 -> Ice
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=8.0, planet_radius=2.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ICE
        # Base confidence for estimated density is 0.80 (2.0 is boundary, so penalty applies if on boundary)
        # Here 1.0 is boundary 1.0, distance = 0 -> penalty = 0.20 -> 0.60
        assert res.confidence <= 0.80

    def test_case_3_radius_only_rocky(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=1.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY
        assert res.confidence == 0.60

    def test_case_3_radius_only_water_world(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=2.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.WATER_WORLD
        assert res.confidence == 0.60

    def test_case_3_radius_only_ice(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=4.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ICE
        assert res.confidence == 0.60

    def test_case_3_radius_only_hydrogen_helium(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=8.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.HYDROGEN_HELIUM
        assert res.confidence == 0.60

    def test_case_4_unknown(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=None
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.UNKNOWN
        assert res.confidence == 0.0

    def test_density_proximity_penalty(self):
        # rho = 3.99 is right next to boundary 4.0
        planet_near_boundary = make_exoplanet_base(planet_density=3.99)
        # rho = 5.0 is centered between 4.0 and 6.0
        planet_far_from_boundary = make_exoplanet_base(planet_density=5.0)

        res_boundary = calculate_composition(planet_near_boundary)
        res_far = calculate_composition(planet_far_from_boundary)

        assert res_boundary.confidence < res_far.confidence
        assert res_far.confidence == 0.95
