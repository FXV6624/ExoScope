"""Bulk Composition Classifier — Zeng et al. (2016, ApJ 819; 2019, PNAS 116).

Uses theoretical mass-radius composition curves to determine internal
structure.  When both mass and radius are available, the planet's position
on the M-R diagram is compared against each Zeng curve.  Following Zeng 2019,
planets between the water and H₂/He curves are classified as Water Worlds
(the "water world" interpretation rather than the "gas dwarf" interpretation).
"""

import math

from app.core.constants.exoplanet import (
    COMPOSITION_DENSITY_THRESHOLDS,
    COMPOSITION_RADIUS_THRESHOLDS,
    EARTH_DENSITY_CGS,
    ZENG_CURVES,
    ZengCurve,
)
from app.core.enums.exoplanet import PlanetComposition
from app.models import ExoplanetBase
from app.schemas.exoplanet import CompositionResult


def _zeng_radius(curve: ZengCurve, mass: float) -> float:
    """Compute the expected radius on a Zeng curve for a given mass."""
    return float(curve.coefficient * (mass**curve.exponent))


def _from_mass_radius(mass: float, radius: float) -> CompositionResult:
    """Classify composition using position on the Zeng M-R diagram.

    Computes the expected radius for each composition curve at the observed
    mass, then selects the curve the planet falls closest to.

    Following Zeng et al. (2019), planets between the water and H₂/He curves
    are classified as Water Worlds.

    Base confidence: 0.90, modulated by distance from nearest curve.
    """
    base_confidence = 0.90

    # Compute expected radius on each curve and find the best match
    best_composition = PlanetComposition.UNKNOWN
    min_distance = float("inf")

    for curve in ZENG_CURVES:
        expected_r = _zeng_radius(curve, mass)
        distance = abs(radius - expected_r) / max(expected_r, 0.01)

        if distance < min_distance:
            min_distance = distance
            best_composition = curve.composition

    # Zeng 2019 interpretation: if planet is inflated beyond the water curve
    # but closer to water than to H₂/He, classify as Water World
    water_curve = ZENG_CURVES[2]  # Water World
    h2he_curve = ZENG_CURVES[4]  # Hydrogen-Helium
    expected_water_r = _zeng_radius(water_curve, mass)
    expected_h2he_r = _zeng_radius(h2he_curve, mass)

    if (
        radius > expected_water_r
        and best_composition == PlanetComposition.HYDROGEN_HELIUM
    ):
        # Check if closer to water than to H₂/He
        dist_water = abs(radius - expected_water_r) / max(expected_water_r, 0.01)
        dist_h2he = abs(radius - expected_h2he_r) / max(expected_h2he_r, 0.01)
        if dist_water < dist_h2he:
            best_composition = PlanetComposition.WATER_WORLD
            min_distance = dist_water

    # Confidence: high when right on a curve, lower when between curves
    # A 10% fractional distance → ~0.90 confidence
    # A 30% fractional distance → ~0.60 confidence
    distance_penalty = math.exp(-3.0 * min_distance)
    confidence = round(max(base_confidence * distance_penalty, 0.10), 4)

    return CompositionResult(composition=best_composition, confidence=confidence)


def _from_density(density_cgs: float, base_confidence: float) -> CompositionResult:
    """Classify composition from a density value (g/cm³)."""
    composition = PlanetComposition.HYDROGEN_HELIUM  # default for very low density

    for min_density, comp in COMPOSITION_DENSITY_THRESHOLDS:
        if density_cgs >= min_density:
            composition = comp
            break

    # Boundary proximity penalty
    boundaries = tuple(d for d, _ in COMPOSITION_DENSITY_THRESHOLDS if d > 0)
    if boundaries:
        min_dist = min(abs(density_cgs - b) for b in boundaries)
        margin = 0.5  # g/cm³
        if min_dist < margin:
            penalty = 0.20 * (1.0 - min_dist / margin)
            base_confidence -= penalty

    confidence = round(max(base_confidence, 0.0), 4)
    return CompositionResult(composition=composition, confidence=confidence)


def _from_radius(radius: float) -> CompositionResult:
    """Fallback: estimate composition from radius alone (population statistics)."""
    base_confidence = 0.50

    for max_radius, comp in COMPOSITION_RADIUS_THRESHOLDS:
        if max_radius is None or radius < max_radius:
            # Boundary proximity penalty
            if max_radius is not None:
                dist = abs(radius - max_radius)
                margin = 0.3  # R⊕
                if dist < margin:
                    penalty = 0.15 * (1.0 - dist / margin)
                    base_confidence -= penalty

            confidence = round(max(base_confidence, 0.0), 4)
            return CompositionResult(composition=comp, confidence=confidence)

    return CompositionResult(
        composition=PlanetComposition.HYDROGEN_HELIUM,
        confidence=base_confidence,
    )


def calculate_composition(exoplanet: ExoplanetBase) -> CompositionResult:
    """Estimate the bulk composition of an exoplanet.

    Priority cascade:
        1. Mass + Radius → Zeng curve distance (base 0.90)
        2. Measured density → density thresholds (base 0.85)
        3. Estimated density (M/R³ × ρ_Earth) → density thresholds (base 0.70)
        4. Radius only → population statistics (base 0.50)
        5. Unknown → confidence 0.0
    """
    radius = exoplanet.planet_radius
    mass = exoplanet.planet_mass
    density = exoplanet.planet_density

    # Case 1: Best case — both mass and radius for Zeng curve analysis
    if mass is not None and radius is not None and mass > 0 and radius > 0:
        return _from_mass_radius(mass, radius)

    # Case 2: Measured density from NASA archive
    if density is not None:
        return _from_density(density, base_confidence=0.85)

    # Case 3: Estimate density from mass and radius (with correct unit conversion)
    if mass is not None and radius is not None and radius > 0:
        estimated_density_cgs = (mass / (radius**3)) * EARTH_DENSITY_CGS
        return _from_density(estimated_density_cgs, base_confidence=0.70)

    # Case 4: Radius-only fallback
    if radius is not None:
        return _from_radius(radius)

    # Case 5: No data
    return CompositionResult(
        composition=PlanetComposition.UNKNOWN,
        confidence=0.0,
    )
