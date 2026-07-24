from app.core.constants.exoplanet import (
    COMPOSITION_DENSITY_BOUNDARIES,
    COMPOSITION_DENSITY_THRESHOLDS,
    COMPOSITION_RADIUS_BOUNDARIES,
    COMPOSITION_RADIUS_THRESHOLDS,
)
from app.core.enums.exoplanet import PlanetComposition
from app.models import ExoplanetBase
from app.schemas.exoplanet import CompositionResult

_DENSITY_MARGIN = 0.5  # g/cm³
_RADIUS_MARGIN = 0.25  # R_Earth
_MAX_PENALTY = 0.20


def _proximity_penalty(
    value: float,
    boundaries: tuple[float, ...],
    margin: float,
) -> float:
    """
    Compute a confidence penalty based on proximity to the nearest
    classification boundary.

    Returns a value in [0, max_penalty].
    """
    if not boundaries:
        return 0.0

    min_distance = min(abs(value - b) for b in boundaries)

    if min_distance >= margin:
        return 0.0

    return _MAX_PENALTY * (1.0 - min_distance / margin)


def calculate_composition(exoplanet: ExoplanetBase) -> CompositionResult:
    """
    Estimate the bulk composition of an exoplanet.

    Priority:
        1. Measured density           → base confidence 0.95
        2. Estimated density (M/R³)   → base confidence 0.80
        3. Radius only                → base confidence 0.60
        4. Unknown                    → confidence 0.0
    """
    radius = exoplanet.planet_radius
    mass = exoplanet.planet_mass
    density = exoplanet.planet_density

    if density is not None:
        return _from_density(density, base_confidence=0.95)

    if mass is not None and radius is not None and radius > 0:
        estimated_density = mass / (radius**3)
        return _from_density(estimated_density, base_confidence=0.80)

    if radius is not None:
        return _from_radius(radius)

    return CompositionResult(
        composition=PlanetComposition.UNKNOWN,
        confidence=0.0,
    )


def _from_density(density: float, base_confidence: float) -> CompositionResult:
    """Classify composition from a density value (measured or estimated)."""
    composition = PlanetComposition.HYDROGEN_HELIUM  # default for very low density

    for threshold in COMPOSITION_DENSITY_THRESHOLDS:
        if density >= threshold.min_density:
            composition = threshold.composition
            break

    penalty = _proximity_penalty(
        density, COMPOSITION_DENSITY_BOUNDARIES, _DENSITY_MARGIN
    )
    confidence = round(max(base_confidence - penalty, 0.0), 4)

    return CompositionResult(composition=composition, confidence=confidence)


def _from_radius(radius: float) -> CompositionResult:
    """Fallback: estimate composition from radius alone."""
    base_confidence = 0.60

    for threshold in COMPOSITION_RADIUS_THRESHOLDS:
        if threshold.max_radius is None or radius < threshold.max_radius:
            penalty = _proximity_penalty(
                radius, COMPOSITION_RADIUS_BOUNDARIES, _RADIUS_MARGIN
            )
            confidence = round(max(base_confidence - penalty, 0.0), 4)
            return CompositionResult(
                composition=threshold.composition, confidence=confidence
            )

    return CompositionResult(  # pragma: no cover
        composition=PlanetComposition.HYDROGEN_HELIUM,
        confidence=base_confidence,
    )
