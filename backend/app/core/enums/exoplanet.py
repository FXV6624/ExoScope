from enum import Enum


class PlanetClass(str, Enum):
    TERRESTRIAL = "Terrestrial"
    SUPER_EARTH = "Super Earth"
    SUB_NEPTUNE = "Sub-Neptune"
    NEPTUNE = "Neptune"
    ICE_GIANT = "Ice Giant"
    GAS_GIANT = "Gas Giant"
    UNKNOWN = "Unknown"


class PlanetComposition(str, Enum):
    ROCKY = "Rocky"
    ROCKY_IRON = "Rocky-Iron"
    WATER_WORLD = "Water World"
    ICE = "Ice"
    HYDROGEN_HELIUM = "Hydrogen-Helium"
    UNKNOWN = "Unknown"
