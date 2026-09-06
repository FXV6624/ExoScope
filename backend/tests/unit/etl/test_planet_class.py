"""Unit tests for app/etl/enrich/planet_class.py — Chen & Kipping 2017."""

from app.core.enums.exoplanet import PlanetClass
from app.etl.enrich.planet_class import calculate_planet_class
from tests.factories import make_exoplanet_base


class TestCalculatePlanetClass:
    # ── Case 4: No data ──────────────────────────────────────────────────

    def test_unknown_when_no_data(self):
        planet = make_exoplanet_base(planet_radius=None, planet_mass=None)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.UNKNOWN
        assert res.confidence == 0.0

    # ── Case 1: Both mass and radius ─────────────────────────────────────

    def test_terrestrial_both_measurements(self):
        planet = make_exoplanet_base(planet_radius=1.0, planet_mass=1.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.TERRESTRIAL
        assert res.confidence > 0.80

    def test_super_earth_both_measurements(self):
        planet = make_exoplanet_base(planet_radius=1.5, planet_mass=4.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.SUPER_EARTH

    def test_sub_neptune_both_measurements(self):
        planet = make_exoplanet_base(planet_radius=3.0, planet_mass=12.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.SUB_NEPTUNE

    def test_neptune_both_measurements(self):
        planet = make_exoplanet_base(planet_radius=5.0, planet_mass=50.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.NEPTUNE

    def test_gas_giant_both_measurements(self):
        planet = make_exoplanet_base(planet_radius=11.2, planet_mass=318.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.GAS_GIANT

    # ── Case 2: Radius only ──────────────────────────────────────────────

    def test_radius_only_classification(self):
        planet = make_exoplanet_base(planet_radius=3.0, planet_mass=None)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.SUB_NEPTUNE
        assert res.confidence <= 0.70  # Base is 0.70

    # ── Case 3: Mass only (NEW) ──────────────────────────────────────────

    def test_mass_only_classification(self):
        planet = make_exoplanet_base(planet_radius=None, planet_mass=1.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.TERRESTRIAL
        assert res.confidence <= 0.60  # Base is 0.60

    def test_mass_only_gas_giant(self):
        planet = make_exoplanet_base(planet_radius=None, planet_mass=300.0)
        res = calculate_planet_class(planet)
        assert res.planet_class == PlanetClass.GAS_GIANT

    # ── Confidence: both > radius-only > mass-only ───────────────────────

    def test_confidence_hierarchy(self):
        both = make_exoplanet_base(planet_radius=3.0, planet_mass=12.0)
        radius_only = make_exoplanet_base(planet_radius=3.0, planet_mass=None)
        mass_only = make_exoplanet_base(planet_radius=None, planet_mass=12.0)

        res_both = calculate_planet_class(both)
        res_radius = calculate_planet_class(radius_only)
        res_mass = calculate_planet_class(mass_only)

        assert res_both.confidence > res_radius.confidence
        assert res_radius.confidence > res_mass.confidence

    # ── Sigmoid boundary penalty ─────────────────────────────────────────

    def test_boundary_penalty_reduces_confidence(self):
        # 1.79 R⊕ is right near the Super-Earth/Sub-Neptune boundary (1.80)
        planet_boundary = make_exoplanet_base(planet_radius=1.79, planet_mass=5.5)
        # 1.5 R⊕ is centered in the Super-Earth class
        planet_center = make_exoplanet_base(planet_radius=1.5, planet_mass=4.0)

        res_boundary = calculate_planet_class(planet_boundary)
        res_center = calculate_planet_class(planet_center)

        assert res_boundary.confidence < res_center.confidence

    # ── M-R Consistency checking ─────────────────────────────────────────

    def test_consistent_mr_high_confidence(self):
        # Earth-like: R=1.0, M=1.0 — both clearly Terrestrial
        planet = make_exoplanet_base(planet_radius=1.0, planet_mass=1.0)
        res = calculate_planet_class(planet)
        assert res.confidence >= 0.85

    def test_inconsistent_mr_reduced_confidence(self):
        # R says Terrestrial (0.8), but M says Sub-Neptune (15.0)
        planet_inconsistent = make_exoplanet_base(planet_radius=0.8, planet_mass=15.0)
        planet_consistent = make_exoplanet_base(planet_radius=0.8, planet_mass=0.5)

        res_inconsistent = calculate_planet_class(planet_inconsistent)
        res_consistent = calculate_planet_class(planet_consistent)

        assert res_inconsistent.confidence < res_consistent.confidence

    # ── ICE_GIANT is never assigned ──────────────────────────────────────

    def test_ice_giant_deprecated(self):
        """Planets in the old 6.0–10.0 range should now be classified as
        Gas Giant (> 6.0 R⊕) per Chen & Kipping boundaries."""
        planet = make_exoplanet_base(planet_radius=8.0, planet_mass=50.0)
        res = calculate_planet_class(planet)
        assert res.planet_class != PlanetClass.ICE_GIANT
        assert res.planet_class == PlanetClass.GAS_GIANT
