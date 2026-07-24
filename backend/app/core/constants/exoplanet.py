from collections.abc import Callable
from dataclasses import dataclass
from operator import attrgetter

from app.core.enums.exoplanet import PlanetClass, PlanetComposition
from app.models import ExoplanetBase


@dataclass(frozen=True, slots=True)
class ClassThreshold:
    planet_class: PlanetClass
    max_radius: float | None


PLANET_CLASS_THRESHOLDS: tuple[ClassThreshold, ...] = (
    ClassThreshold(planet_class=PlanetClass.TERRESTRIAL, max_radius=1.25),
    ClassThreshold(planet_class=PlanetClass.SUPER_EARTH, max_radius=2.0),
    ClassThreshold(planet_class=PlanetClass.SUB_NEPTUNE, max_radius=4.0),
    ClassThreshold(planet_class=PlanetClass.NEPTUNE, max_radius=6.0),
    ClassThreshold(planet_class=PlanetClass.ICE_GIANT, max_radius=10.0),
    ClassThreshold(planet_class=PlanetClass.GAS_GIANT, max_radius=None),
)

PLANET_CLASS_BOUNDARIES: tuple[float, ...] = tuple(
    t.max_radius for t in PLANET_CLASS_THRESHOLDS if t.max_radius is not None
)


@dataclass(frozen=True, slots=True)
class CompositionDensityThreshold:
    composition: PlanetComposition
    min_density: float


COMPOSITION_DENSITY_THRESHOLDS: tuple[CompositionDensityThreshold, ...] = (
    CompositionDensityThreshold(
        composition=PlanetComposition.ROCKY_IRON, min_density=6.0
    ),
    CompositionDensityThreshold(composition=PlanetComposition.ROCKY, min_density=4.0),
    CompositionDensityThreshold(
        composition=PlanetComposition.WATER_WORLD, min_density=2.0
    ),
    CompositionDensityThreshold(composition=PlanetComposition.ICE, min_density=1.0),
    CompositionDensityThreshold(
        composition=PlanetComposition.HYDROGEN_HELIUM, min_density=0.0
    ),
)

COMPOSITION_DENSITY_BOUNDARIES: tuple[float, ...] = (1.0, 2.0, 4.0, 6.0)


@dataclass(frozen=True, slots=True)
class CompositionRadiusThreshold:
    composition: PlanetComposition
    max_radius: float | None


COMPOSITION_RADIUS_THRESHOLDS: tuple[CompositionRadiusThreshold, ...] = (
    CompositionRadiusThreshold(composition=PlanetComposition.ROCKY, max_radius=1.6),
    CompositionRadiusThreshold(
        composition=PlanetComposition.WATER_WORLD, max_radius=2.4
    ),
    CompositionRadiusThreshold(composition=PlanetComposition.ICE, max_radius=6.0),
    CompositionRadiusThreshold(
        composition=PlanetComposition.HYDROGEN_HELIUM, max_radius=None
    ),
)

COMPOSITION_RADIUS_BOUNDARIES: tuple[float, ...] = (1.6, 2.4, 6.0)


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

DEFAULT_IMAGES: dict[PlanetComposition, str] = {
    PlanetComposition.ROCKY: "/assets/images/planets/rocky.png",
    PlanetComposition.ROCKY_IRON: "/assets/images/planets/rocky_iron.png",
    PlanetComposition.WATER_WORLD: "/assets/images/planets/water_world.png",
    PlanetComposition.ICE: "/assets/images/planets/ice.png",
    PlanetComposition.HYDROGEN_HELIUM: "/assets/images/planets/hydrogen_helium.png",
    PlanetComposition.UNKNOWN: "/assets/images/planets/unknown.png",
}
