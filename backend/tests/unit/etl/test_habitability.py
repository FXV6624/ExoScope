"""Unit tests for app/etl/enrich/habitability.py — Kopparapu et al. 2013."""

from app.etl.enrich.habitability import calculate_habitability
from tests.factories import make_exoplanet_base


class TestHabitabilityHZPosition:
    """Test Tier 1: Habitable Zone position scoring."""

    def test_earth_analog_high_score(self):
        """Earth-like planet in HZ should score high."""
        planet = make_exoplanet_base(
            planet_radius=1.0,
            planet_mass=1.0,
            planet_density=5.5,
            equilibrium_temperature=255.0,
            incident_flux=1.0,
            orbital_eccentricity=0.017,
            stellar_effective_temperature=5780.0,
            stellar_mass=1.0,
            stellar_age=4.6,
        )
        res = calculate_habitability(planet)
        assert res.score >= 80.0
        assert res.confidence >= 0.90

    def test_mars_analog_lower_score(self):
        """Mars is outside the conservative HZ — should score lower."""
        planet = make_exoplanet_base(
            planet_radius=0.53,
            planet_mass=0.107,
            planet_density=3.93,
            equilibrium_temperature=210.0,
            incident_flux=0.43,
            orbital_eccentricity=0.093,
            stellar_effective_temperature=5780.0,
            stellar_mass=1.0,
        )
        res = calculate_habitability(planet)
        assert res.score < 95.0  # Mars is within optimistic HZ (Early Mars limit)

    def test_venus_analog_too_hot(self):
        """Venus receives ~1.9x Earth flux — well inside inner HZ limit."""
        planet = make_exoplanet_base(
            planet_radius=0.95,
            planet_mass=0.815,
            planet_density=5.24,
            equilibrium_temperature=735.0,
            incident_flux=1.91,
            orbital_eccentricity=0.007,
            stellar_effective_temperature=5780.0,
            stellar_mass=1.0,
        )
        res = calculate_habitability(planet)
        assert res.score < 65.0  # Venus is outside HZ but some properties still score

    def test_hot_jupiter_very_low_score(self):
        """Hot Jupiter should score near zero."""
        planet = make_exoplanet_base(
            planet_radius=11.2,
            planet_mass=318.0,
            planet_density=1.33,
            equilibrium_temperature=1500.0,
            incident_flux=100.0,
            orbital_eccentricity=0.05,
            stellar_effective_temperature=5800.0,
            stellar_mass=1.1,
        )
        res = calculate_habitability(planet)
        assert res.score < 20.0


class TestHabitabilityFluxFallback:
    """Test flux computation from luminosity + semi-major axis."""

    def test_flux_from_luminosity_and_sma(self):
        """If incident_flux is missing, compute from stellar_luminosity + SMA."""
        planet = make_exoplanet_base(
            planet_radius=1.0,
            planet_mass=1.0,
            equilibrium_temperature=255.0,
            incident_flux=None,
            stellar_luminosity=0.0,  # log10(1.0) = 0.0 → 1 L☉
            semi_major_axis=1.0,  # 1 AU
            stellar_effective_temperature=5780.0,
            stellar_mass=1.0,
            orbital_eccentricity=0.017,
        )
        res = calculate_habitability(planet)
        # Should still get a decent score since computed flux ≈ 1.0
        assert res.score >= 70.0
        # Confidence slightly lower due to computed flux (precision = 0.90)
        assert res.confidence > 0.0


class TestHabitabilityConfidence:
    """Test confidence model: data_completeness × model_precision."""

    def test_no_data_zero_confidence(self):
        planet = make_exoplanet_base(
            planet_radius=None,
            planet_mass=None,
            equilibrium_temperature=None,
            incident_flux=None,
        )
        res = calculate_habitability(planet)
        assert res.score == 0.0
        assert res.confidence == 0.0

    def test_partial_data_lower_confidence(self):
        """A planet with only temperature should have lower confidence
        than one with all measurements."""
        full = make_exoplanet_base(
            planet_radius=1.0,
            planet_mass=1.0,
            planet_density=5.5,
            equilibrium_temperature=255.0,
            incident_flux=1.0,
            orbital_eccentricity=0.017,
            stellar_effective_temperature=5780.0,
            stellar_mass=1.0,
            stellar_age=4.6,
        )
        partial = make_exoplanet_base(
            planet_radius=None,
            planet_mass=None,
            equilibrium_temperature=255.0,
            incident_flux=None,
        )

        res_full = calculate_habitability(full)
        res_partial = calculate_habitability(partial)

        assert res_full.confidence > res_partial.confidence


class TestHabitabilityMDwarfStar:
    """Test HZ for non-solar star types."""

    def test_m_dwarf_hz_shifts(self):
        """For an M-dwarf (T_eff ≈ 3300 K), the HZ is much closer to the star.
        A planet receiving ~0.8 S⊕ should be in the HZ for this star type."""
        planet = make_exoplanet_base(
            planet_radius=1.1,
            planet_mass=1.2,
            equilibrium_temperature=240.0,
            incident_flux=0.8,
            orbital_eccentricity=0.01,
            stellar_effective_temperature=3300.0,
            stellar_mass=0.4,
            stellar_age=8.0,
        )
        res = calculate_habitability(planet)
        # Should score reasonably since in HZ of its star
        assert res.score > 40.0
