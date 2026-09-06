from enum import Enum


class PlanetClass(str, Enum):
    TERRESTRIAL = "Terrestrial"
    SUPER_EARTH = "Super Earth"
    SUB_NEPTUNE = "Sub-Neptune"
    NEPTUNE = "Neptune"
    ICE_GIANT = (
        "Ice Giant"  # Deprecated: merged into Neptune (kept for DB compatibility)
    )
    GAS_GIANT = "Gas Giant"
    UNKNOWN = "Unknown"


class PlanetComposition(str, Enum):
    ROCKY = "Rocky"
    ROCKY_IRON = "Rocky-Iron"
    WATER_WORLD = "Water World"
    ICE = "Ice"
    HYDROGEN_HELIUM = "Hydrogen-Helium"
    UNKNOWN = "Unknown"


class ExoplanetSortField(str, Enum):
    PLANET_NAME = "planet_name"
    HOST_STAR = "host_star"
    DISCOVERY_YEAR = "discovery_year"
    DISCOVERY_METHOD = "discovery_method"

    PLANET_RADIUS = "planet_radius"
    PLANET_MASS = "planet_mass"
    PLANET_DENSITY = "planet_density"

    EQUILIBRIUM_TEMPERATURE = "equilibrium_temperature"
    INCIDENT_FLUX = "incident_flux"
    ORBITAL_PERIOD = "orbital_period"
    SEMI_MAJOR_AXIS = "semi_major_axis"
    ORBITAL_ECCENTRICITY = "orbital_eccentricity"

    STELLAR_EFFECTIVE_TEMPERATURE = "stellar_effective_temperature"
    STELLAR_RADIUS = "stellar_radius"
    STELLAR_MASS = "stellar_mass"
    STELLAR_LUMINOSITY = "stellar_luminosity"
    STELLAR_AGE = "stellar_age"

    DISTANCE_FROM_EARTH = "distance_from_earth"

    SYSTEM_PLANET_COUNT = "system_planet_count"
    SYSTEM_STAR_COUNT = "system_star_count"

    PLANET_CLASS = "planet_class"
    PLANET_CLASS_CONFIDENCE = "planet_class_confidence"

    COMPOSITION = "composition"
    COMPOSITION_CONFIDENCE = "composition_confidence"

    HABITABILITY_SCORE = "habitability_score"
    HABITABILITY_CONFIDENCE = "habitability_confidence"


class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


class ExoplanetField(str, Enum):
    PLANET_NAME = "planet_name"
    HOST_STAR = "host_star"
    DISCOVERY_YEAR = "discovery_year"
    DISCOVERY_METHOD = "discovery_method"
    PLANET_RADIUS = "planet_radius"
    PLANET_MASS = "planet_mass"
    PLANET_DENSITY = "planet_density"
    EQUILIBRIUM_TEMPERATURE = "equilibrium_temperature"
    INCIDENT_FLUX = "incident_flux"
    ORBITAL_PERIOD = "orbital_period"
    SEMI_MAJOR_AXIS = "semi_major_axis"
    ORBITAL_ECCENTRICITY = "orbital_eccentricity"
    STELLAR_EFFECTIVE_TEMPERATURE = "stellar_effective_temperature"
    STELLAR_RADIUS = "stellar_radius"
    STELLAR_MASS = "stellar_mass"
    STELLAR_LUMINOSITY = "stellar_luminosity"
    STELLAR_AGE = "stellar_age"
    DISTANCE_FROM_EARTH = "distance_from_earth"
    SYSTEM_PLANET_COUNT = "system_planet_count"
    SYSTEM_STAR_COUNT = "system_star_count"
    PLANET_CLASS = "planet_class"
    PLANET_CLASS_CONFIDENCE = "planet_class_confidence"
    COMPOSITION = "composition"
    COMPOSITION_CONFIDENCE = "composition_confidence"
    HABITABILITY_SCORE = "habitability_score"
    HABITABILITY_CONFIDENCE = "habitability_confidence"
    PHOTO_URL = "photo_url"
