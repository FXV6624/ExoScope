from app.core.constants.exoplanet import DEFAULT_IMAGES
from app.models import ExoplanetBase

from .composition import calculate_composition
from .habitability import calculate_habitability
from .planet_class import calculate_planet_class


def enrich(planets: list[ExoplanetBase]) -> list[ExoplanetBase]:
    for planet in planets:
        planet_class_result = calculate_planet_class(planet)
        composition_result = calculate_composition(planet)
        habitability_result = calculate_habitability(planet)

        planet.planet_class = planet_class_result.planet_class
        planet.planet_class_confidence = planet_class_result.confidence

        planet.composition = composition_result.composition
        planet.composition_confidence = composition_result.confidence

        planet.habitability_score = habitability_result.score
        planet.habitability_confidence = habitability_result.confidence

        planet.photo_url = DEFAULT_IMAGES[planet.composition]

    return planets
