from collections.abc import Callable
from dataclasses import dataclass
from operator import attrgetter

from app.core.enums.exoplanet import PlanetComposition
from app.models import ExoplanetBase


@dataclass(frozen=True, slots=True)
class ClassificationThreshold:
    composition: PlanetComposition
    max_radius: float | None
    min_density: float | None
    radius_confidence: float
    density_confidence: float


PLANET_CLASSIFICATIONS = (
    ClassificationThreshold(
        composition=PlanetComposition.ROCKY,
        max_radius=1.6,
        min_density=5.0,
        radius_confidence=0.75,
        density_confidence=0.95,
    ),
    ClassificationThreshold(
        composition=PlanetComposition.SUPER_EARTH,
        max_radius=2.5,
        min_density=3.0,
        radius_confidence=0.72,
        density_confidence=0.90,
    ),
    ClassificationThreshold(
        composition=PlanetComposition.MINI_NEPTUNE,
        max_radius=4.0,
        min_density=1.5,
        radius_confidence=0.70,
        density_confidence=0.88,
    ),
    ClassificationThreshold(
        composition=PlanetComposition.ICE_GIANT,
        max_radius=6.0,
        min_density=None,
        radius_confidence=0.68,
        density_confidence=0.90,
    ),
    ClassificationThreshold(
        composition=PlanetComposition.GAS_GIANT,
        max_radius=None,
        min_density=None,
        radius_confidence=0.70,
        density_confidence=0.92,
    ),
)


@dataclass(frozen=True, slots=True)
class HabitabilityWeights:
    equilibrium_temperature: float
    incident_flux: float
    planet_radius: float
    planet_mass: float
    stellar_age: float
    stellar_mass: float
    orbital_eccentricity: float


WEIGHTS = HabitabilityWeights(
    equilibrium_temperature=0.30,
    incident_flux=0.20,
    planet_radius=0.15,
    planet_mass=0.10,
    stellar_age=0.10,
    stellar_mass=0.05,
    orbital_eccentricity=0.10,
)


@dataclass(frozen=True, slots=True)
class HabitabilityCriterion:
    getter: Callable[[ExoplanetBase], float | None]
    optimum: float
    sigma: float
    weight: float


CRITERIA = (
    HabitabilityCriterion(
        getter=attrgetter("equilibrium_temperature"),
        optimum=255.0,
        sigma=40.0,
        weight=WEIGHTS.equilibrium_temperature,
    ),
    HabitabilityCriterion(
        getter=attrgetter("incident_flux"),
        optimum=1.0,
        sigma=0.5,
        weight=WEIGHTS.incident_flux,
    ),
    HabitabilityCriterion(
        getter=attrgetter("planet_radius"),
        optimum=1.0,
        sigma=0.6,
        weight=WEIGHTS.planet_radius,
    ),
    HabitabilityCriterion(
        getter=attrgetter("planet_mass"),
        optimum=1.0,
        sigma=1.0,
        weight=WEIGHTS.planet_mass,
    ),
    HabitabilityCriterion(
        getter=attrgetter("stellar_age"),
        optimum=4.6,
        sigma=2.0,
        weight=WEIGHTS.stellar_age,
    ),
    HabitabilityCriterion(
        getter=attrgetter("stellar_mass"),
        optimum=1.0,
        sigma=0.3,
        weight=WEIGHTS.stellar_mass,
    ),
    HabitabilityCriterion(
        getter=attrgetter("orbital_eccentricity"),
        optimum=0.0,
        sigma=0.15,
        weight=WEIGHTS.orbital_eccentricity,
    ),
)
