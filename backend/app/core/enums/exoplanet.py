from enum import Enum

class PlanetComposition(str, Enum):
    ROCKY = "Rocky"
    SUPER_EARTH = "Super Earth"
    MINI_NEPTUNE = "Mini Neptune"
    ICE_GIANT = "Ice Giant"
    GAS_GIANT = "Gas Giant"
    UNKNOWN = "Unknown"