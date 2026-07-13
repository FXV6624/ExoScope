from app.models import ExoplanetBase

from .composition import calculate_composition
from .habitability import calculate_habitability


def enrich(planets: list[ExoplanetBase]) -> list[ExoplanetBase]:
    for planet in planets:
        composition = calculate_composition(planet)
        habitability = calculate_habitability(planet)

        planet.composition = composition.composition
        planet.composition_confidence = composition.confidence

        planet.habitability_score = habitability.score
        planet.habitability_confidence = habitability.confidence

    return planets
