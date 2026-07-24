from app.core.constants.exoplanet import (
    PLANET_CLASS_BOUNDARIES,
    PLANET_CLASS_THRESHOLDS,
)
from app.core.enums.exoplanet import PlanetClass
from app.models import ExoplanetBase
from app.schemas.exoplanet import PlanetClassResult

_BOUNDARY_MARGIN = 0.25  # radius units (R_Earth)
_MAX_PENALTY = 0.20


def _proximity_penalty(value: float, boundaries: tuple[float, ...]) -> float:
    """
    Compute a confidence penalty based on proximity to the nearest
    classification boundary.

    Returns a value in [0, max_penalty].  Zero when the value is far
    from every boundary; up to max_penalty when sitting right on one.
    """
    if not boundaries:
        return 0.0

    min_distance = min(abs(value - b) for b in boundaries)

    if min_distance >= _BOUNDARY_MARGIN:
        return 0.0

    return _MAX_PENALTY * (1.0 - min_distance / _BOUNDARY_MARGIN)


def calculate_planet_class(exoplanet: ExoplanetBase) -> PlanetClassResult:
    """
    Classify an exoplanet by physical size.

    Priority:
        1. Radius + mass → base confidence 0.95
        2. Radius only  → base confidence 0.75
        3. Unknown       → confidence 0.0
    """
    radius = exoplanet.planet_radius

    if radius is None:
        return PlanetClassResult(
            planet_class=PlanetClass.UNKNOWN,
            confidence=0.0,
        )

    mass = exoplanet.planet_mass
    base_confidence = 0.95 if mass is not None else 0.75

    planet_class = _classify_by_radius(radius)
    penalty = _proximity_penalty(radius, PLANET_CLASS_BOUNDARIES)
    confidence = round(max(base_confidence - penalty, 0.0), 4)

    return PlanetClassResult(
        planet_class=planet_class,
        confidence=confidence,
    )


def _classify_by_radius(radius: float) -> PlanetClass:
    """Map a radius value to a planet class using the threshold table."""
    for threshold in PLANET_CLASS_THRESHOLDS:
        if threshold.max_radius is None:
            return threshold.planet_class
        if radius < threshold.max_radius:
            return threshold.planet_class

    return PlanetClass.GAS_GIANT
