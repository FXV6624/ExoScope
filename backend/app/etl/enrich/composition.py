from app.core.constants.exoplanet import PLANET_CLASSIFICATIONS
from app.core.enums.exoplanet import PlanetComposition
from app.models import ExoplanetBase
from app.schemas.exoplanet import CompositionResult


def calculate_composition(exoplanet: ExoplanetBase) -> CompositionResult:
    """
    Classify an exoplanet using the best available observables.

    Priority:
        1. Density (best indicator)
        2. Radius
    """

    radius = exoplanet.planet_radius
    density = exoplanet.planet_density

    if radius is None:
        return CompositionResult(
            composition=PlanetComposition.UNKNOWN,
            confidence=0.0,
        )

    if density is not None:
        return _classify_from_density(radius, density)

    return _classify_from_radius(radius)


def _classify_from_density(
    radius: float,
    density: float,
) -> CompositionResult:
    for threshold in PLANET_CLASSIFICATIONS:
        if threshold.min_density is None:
            continue

        if density >= threshold.min_density:
            return CompositionResult(
                composition=threshold.composition,
                confidence=threshold.density_confidence,
            )

    ice_giant = PLANET_CLASSIFICATIONS[-2]
    gas_giant = PLANET_CLASSIFICATIONS[-1]

    if ice_giant.max_radius is not None and radius >= ice_giant.max_radius:
        return CompositionResult(
            composition=gas_giant.composition,
            confidence=gas_giant.density_confidence,
        )

    return CompositionResult(
        composition=ice_giant.composition,
        confidence=ice_giant.density_confidence,
    )


def _classify_from_radius(radius: float) -> CompositionResult:
    for threshold in PLANET_CLASSIFICATIONS:
        if threshold.max_radius is None:
            continue

        if radius < threshold.max_radius:
            return CompositionResult(
                composition=threshold.composition,
                confidence=threshold.radius_confidence,
            )

    gas_giant = PLANET_CLASSIFICATIONS[-1]

    return CompositionResult(
        composition=gas_giant.composition,
        confidence=gas_giant.radius_confidence,
    )
