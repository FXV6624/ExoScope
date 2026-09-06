"""Planet Class Classifier — Chen & Kipping (2017, ApJ 834, 17).

Uses joint mass-radius classification with piecewise power-law regime
boundaries.  When both measurements are available, consistency between
mass-implied and radius-implied classes is checked to modulate confidence.
"""

import math

from app.core.constants.exoplanet import (
    MASS_THRESHOLDS,
    PLANET_CLASS_BOUNDARIES,
    RADIUS_THRESHOLDS,
)
from app.core.enums.exoplanet import PlanetClass
from app.models import ExoplanetBase
from app.schemas.exoplanet import PlanetClassResult

# ── Confidence Parameters ─────────────────────────────────────────────────

_BASE_BOTH = 0.90  # Both radius and mass available
_BASE_RADIUS = 0.70  # Radius only
_BASE_MASS = 0.60  # Mass only

_SIGMOID_STEEPNESS = 12.0  # Controls how sharply the penalty ramps near a boundary
_SIGMOID_CENTER = 0.15  # Fractional distance from boundary where penalty = 50%


def _sigmoid_boundary_factor(
    value: float,
    thresholds: tuple[float, ...],
) -> float:
    """Compute a [0.70, 1.0] factor based on proximity to the nearest boundary.

    Uses a logistic sigmoid for smooth transitions instead of a linear ramp.
    """
    if not thresholds:
        return 1.0

    min_distance = min(abs(value - t) for t in thresholds)
    # Normalize distance relative to the nearest threshold magnitude
    nearest = min(thresholds, key=lambda t: abs(value - t))
    scale = max(abs(nearest) * 0.1, 0.1)
    normalized = min_distance / scale

    # Logistic sigmoid: approaches 1.0 far from boundary, ~0.70 right on it
    sigmoid = 1.0 / (
        1.0 + math.exp(-_SIGMOID_STEEPNESS * (normalized - _SIGMOID_CENTER))
    )
    return 0.70 + 0.30 * sigmoid


def _classify_by_radius(radius: float) -> PlanetClass:
    """Map radius to planet class using Chen & Kipping boundaries."""
    for boundary in PLANET_CLASS_BOUNDARIES:
        if boundary.max_radius is None:
            return boundary.planet_class
        if radius < boundary.max_radius:
            return boundary.planet_class
    return PlanetClass.GAS_GIANT


def _classify_by_mass(mass: float) -> PlanetClass:
    """Map mass to planet class using Chen & Kipping boundaries."""
    for boundary in PLANET_CLASS_BOUNDARIES:
        if boundary.max_mass is None:
            return boundary.planet_class
        if mass < boundary.max_mass:
            return boundary.planet_class
    return PlanetClass.GAS_GIANT


def _class_index(planet_class: PlanetClass) -> int:
    """Return the ordinal index of a class for consistency comparison."""
    for i, boundary in enumerate(PLANET_CLASS_BOUNDARIES):
        if boundary.planet_class == planet_class:
            return i
    return len(PLANET_CLASS_BOUNDARIES) - 1


def calculate_planet_class(exoplanet: ExoplanetBase) -> PlanetClassResult:
    """Classify an exoplanet by physical size using Chen & Kipping 2017.

    Priority cascade:
        1. Radius + Mass → joint classification, consistency check (base 0.90)
        2. Radius only  → radius classification (base 0.70)
        3. Mass only    → mass classification (base 0.60)
        4. Neither      → UNKNOWN, confidence 0.0
    """
    radius = exoplanet.planet_radius
    mass = exoplanet.planet_mass

    # Case 4: No data
    if radius is None and mass is None:
        return PlanetClassResult(planet_class=PlanetClass.UNKNOWN, confidence=0.0)

    # Case 3: Mass only
    if radius is None:
        assert mass is not None
        planet_class = _classify_by_mass(mass)
        boundary_factor = _sigmoid_boundary_factor(mass, MASS_THRESHOLDS)
        confidence = round(max(_BASE_MASS * boundary_factor, 0.0), 4)
        return PlanetClassResult(planet_class=planet_class, confidence=confidence)

    # Case 2: Radius only
    if mass is None:
        planet_class = _classify_by_radius(radius)
        boundary_factor = _sigmoid_boundary_factor(radius, RADIUS_THRESHOLDS)
        confidence = round(max(_BASE_RADIUS * boundary_factor, 0.0), 4)
        return PlanetClassResult(planet_class=planet_class, confidence=confidence)

    # Case 1: Both radius and mass available
    class_by_radius = _classify_by_radius(radius)
    class_by_mass = _classify_by_mass(mass)

    # Primary classification from radius (more commonly measured, higher precision)
    planet_class = class_by_radius

    # Boundary factor from the primary classifier (radius)
    boundary_factor = _sigmoid_boundary_factor(radius, RADIUS_THRESHOLDS)

    # Consistency factor: how well do mass and radius agree?
    idx_r = _class_index(class_by_radius)
    idx_m = _class_index(class_by_mass)
    diff = abs(idx_r - idx_m)

    if diff == 0:
        consistency_factor = 1.0
    elif diff == 1:
        consistency_factor = 0.85  # Adjacent class — slight disagreement
    else:
        consistency_factor = 0.65  # Multi-class disagreement

    confidence = round(max(_BASE_BOTH * boundary_factor * consistency_factor, 0.0), 4)

    return PlanetClassResult(planet_class=planet_class, confidence=confidence)
