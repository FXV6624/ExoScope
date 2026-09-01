"""Unit tests for app/etl/enrich/composition.py — Zeng et al. 2016/2019."""

from app.core.enums.exoplanet import PlanetComposition
from app.etl.enrich.composition import calculate_composition
from tests.factories import make_exoplanet_base


class TestCalculateComposition:
    # ── Case 5: No data ──────────────────────────────────────────────────

    def test_unknown_when_no_data(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=None
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.UNKNOWN
        assert res.confidence == 0.0

    # ── Case 1: Mass + Radius → Zeng curve distance ─────────────────────

    def test_earth_analog_rocky(self):
        """Earth: R=1.0, M=1.0 → should fall on the Rocky (Earth-like) curve."""
        planet = make_exoplanet_base(planet_radius=1.0, planet_mass=1.0)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY
        assert res.confidence >= 0.75

    def test_mercury_analog_rocky_iron(self):
        """Dense small planet: R=0.38, M=0.055 → should be near Rocky-Iron."""
        planet = make_exoplanet_base(planet_radius=0.38, planet_mass=0.055)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY_IRON

    def test_neptune_analog_ice(self):
        """Neptune-like: R=3.88, M=17.1 → should be Ice or Water World."""
        planet = make_exoplanet_base(planet_radius=3.88, planet_mass=17.1)
        res = calculate_composition(planet)
        assert res.composition in (PlanetComposition.ICE, PlanetComposition.WATER_WORLD)

    def test_jupiter_analog_hydrogen_helium(self):
        """Jupiter: R=11.2, M=318 → should be Hydrogen-Helium."""
        planet = make_exoplanet_base(planet_radius=11.2, planet_mass=318.0)
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.HYDROGEN_HELIUM

    def test_water_world_zeng_interpretation(self):
        """Planet between water and H₂/He curves → Water World (Zeng 2019)."""
        # A sub-Neptune with R=2.5, M=6.0 is typically above the water curve
        # but closer to it than to H₂/He
        planet = make_exoplanet_base(planet_radius=2.5, planet_mass=6.0)
        res = calculate_composition(planet)
        assert res.composition in (
            PlanetComposition.WATER_WORLD,
            PlanetComposition.ICE,
        )

    def test_zeng_curve_high_confidence_on_curve(self):
        """A planet sitting exactly on a Zeng curve should have high confidence."""
        # R = 1.008 × 1.0^0.279 = 1.008 — exactly on the Rocky curve at M=1
        planet = make_exoplanet_base(planet_radius=1.008, planet_mass=1.0)
        res = calculate_composition(planet)
        assert res.confidence >= 0.80

    def test_zeng_curve_lower_confidence_between_curves(self):
        """A planet between two curves should have lower confidence."""
        # Between Rocky (1.008) and Water World (1.321) at M=1
        planet_between = make_exoplanet_base(planet_radius=1.15, planet_mass=1.0)
        planet_on_curve = make_exoplanet_base(planet_radius=1.008, planet_mass=1.0)
        res_between = calculate_composition(planet_between)
        res_on_curve = calculate_composition(planet_on_curve)
        assert res_between.confidence < res_on_curve.confidence

    # ── Case 2: Measured density ─────────────────────────────────────────

    def test_measured_density_rocky_iron(self):
        """High measured density with no mass → density fallback."""
        planet = make_exoplanet_base(
            planet_density=7.0, planet_mass=None, planet_radius=None
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY_IRON
        assert res.confidence >= 0.80

    def test_measured_density_hydrogen_helium(self):
        planet = make_exoplanet_base(
            planet_density=0.5, planet_mass=None, planet_radius=None
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.HYDROGEN_HELIUM

    # ── Case 3: Estimated density (× 5.514 fix) ─────────────────────────

    def test_estimated_density_correct_conversion(self):
        """M=1.0, R=1.0 → ρ_est = (1/1³) × 5.514 = 5.514 g/cm³ → Rocky."""
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=1.0, planet_radius=1.0
        )
        # With both M and R available, Case 1 (Zeng curves) takes priority
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY

    # ── Case 4: Radius only ──────────────────────────────────────────────

    def test_radius_only_small_rocky(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=1.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.ROCKY
        assert res.confidence <= 0.50  # Base is 0.50

    def test_radius_only_large_hydrogen(self):
        planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=8.0
        )
        res = calculate_composition(planet)
        assert res.composition == PlanetComposition.HYDROGEN_HELIUM

    # ── Confidence hierarchy ─────────────────────────────────────────────

    def test_confidence_mass_radius_beats_density_beats_radius_only(self):
        """Zeng curves (M+R) should give higher confidence than density-only
        which should be higher than radius-only."""
        mr_planet = make_exoplanet_base(
            planet_radius=1.0, planet_mass=1.0, planet_density=None
        )
        density_planet = make_exoplanet_base(
            planet_density=5.5, planet_mass=None, planet_radius=None
        )
        radius_planet = make_exoplanet_base(
            planet_density=None, planet_mass=None, planet_radius=1.0
        )

        res_mr = calculate_composition(mr_planet)
        res_density = calculate_composition(density_planet)
        res_radius = calculate_composition(radius_planet)

        assert res_mr.confidence > res_density.confidence
        assert res_density.confidence > res_radius.confidence
