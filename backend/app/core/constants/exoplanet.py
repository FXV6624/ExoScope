from collections.abc import Callable
from dataclasses import dataclass
from operator import attrgetter

from app.core.enums.exoplanet import PlanetClass, PlanetComposition
from app.models import ExoplanetBase

# ═══════════════════════════════════════════════════════════════════════════════
# 1. PLANET CLASS — Chen & Kipping (2017, ApJ 834, 17)
#    Piecewise power-law boundaries from the mass-radius forecaster model.
# ═══════════════════════════════════════════════════════════════════════════════


@dataclass(frozen=True, slots=True)
class ClassBoundary:
    planet_class: PlanetClass
    max_radius: float | None  # R⊕
    max_mass: float | None  # M⊕


# Joint mass+radius classification boundaries (Chen & Kipping 2017)
PLANET_CLASS_BOUNDARIES: tuple[ClassBoundary, ...] = (
    ClassBoundary(planet_class=PlanetClass.TERRESTRIAL, max_radius=1.23, max_mass=2.04),
    ClassBoundary(planet_class=PlanetClass.SUPER_EARTH, max_radius=1.80, max_mass=6.0),
    ClassBoundary(planet_class=PlanetClass.SUB_NEPTUNE, max_radius=3.90, max_mass=25.0),
    ClassBoundary(planet_class=PlanetClass.NEPTUNE, max_radius=6.0, max_mass=130.0),
    ClassBoundary(planet_class=PlanetClass.GAS_GIANT, max_radius=None, max_mass=None),
)

# Ordered list of radius and mass thresholds for boundary proximity checks
RADIUS_THRESHOLDS: tuple[float, ...] = tuple(
    b.max_radius for b in PLANET_CLASS_BOUNDARIES if b.max_radius is not None
)
MASS_THRESHOLDS: tuple[float, ...] = tuple(
    b.max_mass for b in PLANET_CLASS_BOUNDARIES if b.max_mass is not None
)


# ═══════════════════════════════════════════════════════════════════════════════
# 2. COMPOSITION — Zeng et al. (2016, ApJ 819, 127; 2019, PNAS 116, 9723)
#    Theoretical mass-radius curves for pure compositions.
#    R = coefficient × M^exponent  (R in R⊕, M in M⊕)
# ═══════════════════════════════════════════════════════════════════════════════


@dataclass(frozen=True, slots=True)
class ZengCurve:
    composition: PlanetComposition
    coefficient: float
    exponent: float


# Ordered from densest to least dense
ZENG_CURVES: tuple[ZengCurve, ...] = (
    ZengCurve(
        composition=PlanetComposition.ROCKY_IRON, coefficient=0.774, exponent=0.274
    ),
    ZengCurve(composition=PlanetComposition.ROCKY, coefficient=1.008, exponent=0.279),
    ZengCurve(
        composition=PlanetComposition.WATER_WORLD, coefficient=1.321, exponent=0.284
    ),
    ZengCurve(composition=PlanetComposition.ICE, coefficient=1.557, exponent=0.306),
    ZengCurve(
        composition=PlanetComposition.HYDROGEN_HELIUM, coefficient=2.150, exponent=0.320
    ),
)

# Earth mean density for unit conversion (g/cm³)
EARTH_DENSITY_CGS = 5.514

# Density classification boundaries (g/cm³) — fallback when mass+radius unavailable
COMPOSITION_DENSITY_THRESHOLDS: tuple[tuple[float, PlanetComposition], ...] = (
    (6.0, PlanetComposition.ROCKY_IRON),
    (4.0, PlanetComposition.ROCKY),
    (2.0, PlanetComposition.WATER_WORLD),
    (1.0, PlanetComposition.ICE),
    (0.0, PlanetComposition.HYDROGEN_HELIUM),
)

# Radius-only composition boundaries (statistical population model)
COMPOSITION_RADIUS_THRESHOLDS: tuple[tuple[float | None, PlanetComposition], ...] = (
    (1.6, PlanetComposition.ROCKY),
    (2.4, PlanetComposition.WATER_WORLD),
    (6.0, PlanetComposition.ICE),
    (None, PlanetComposition.HYDROGEN_HELIUM),
)


# ═══════════════════════════════════════════════════════════════════════════════
# 3. HABITABILITY — Kopparapu et al. (2013, ApJ 765, 131)
#    Habitable Zone boundaries + multi-criterion weighted scoring.
# ═══════════════════════════════════════════════════════════════════════════════


@dataclass(frozen=True, slots=True)
class HZBoundaryCoefficients:
    """Polynomial coefficients for habitable zone flux boundaries.

    S_eff = S_eff_sun + a·T* + b·T*² + c·T*³ + d·T*⁴
    where T* = T_eff - 5780 K
    """

    name: str
    s_eff_sun: float
    a: float
    b: float
    c: float
    d: float


# Kopparapu et al. 2013, Table 3 — Updated coefficients (2014 erratum)
HZ_BOUNDARIES = {
    "runaway_greenhouse": HZBoundaryCoefficients(
        name="Runaway Greenhouse (Conservative Inner)",
        s_eff_sun=1.0466,
        a=8.1774e-5,
        b=1.7063e-9,
        c=-4.3241e-12,
        d=-6.6462e-16,
    ),
    "maximum_greenhouse": HZBoundaryCoefficients(
        name="Maximum Greenhouse (Conservative Outer)",
        s_eff_sun=0.3507,
        a=5.9578e-5,
        b=1.6707e-9,
        c=-3.0058e-12,
        d=-5.1925e-16,
    ),
    "recent_venus": HZBoundaryCoefficients(
        name="Recent Venus (Optimistic Inner)",
        s_eff_sun=1.7763,
        a=1.4335e-4,
        b=3.3954e-9,
        c=-7.6364e-12,
        d=-1.1950e-15,
    ),
    "early_mars": HZBoundaryCoefficients(
        name="Early Mars (Optimistic Outer)",
        s_eff_sun=0.3207,
        a=5.4471e-5,
        b=1.5275e-9,
        c=-2.1709e-12,
        d=-3.8282e-16,
    ),
}


# ── Habitability Scoring Criteria (Tier 2 — Planetary Properties) ─────────


@dataclass(frozen=True, slots=True)
class HabitabilityCriterion:
    getter: Callable[[ExoplanetBase], float | None]
    optimum: float
    sigma: float
    weight: float


# Tier 1 receives 40% of total score (HZ position)
HZ_POSITION_WEIGHT = 0.40

# Tier 2 criteria (remaining 60% of total score)
HABITABILITY_CRITERIA: tuple[HabitabilityCriterion, ...] = (
    HabitabilityCriterion(
        getter=attrgetter("equilibrium_temperature"),
        optimum=255.0,
        sigma=50.0,
        weight=0.15,
    ),
    HabitabilityCriterion(
        getter=attrgetter("planet_radius"),
        optimum=1.0,
        sigma=0.7,
        weight=0.10,
    ),
    HabitabilityCriterion(
        getter=attrgetter("planet_mass"),
        optimum=1.0,
        sigma=2.5,
        weight=0.08,
    ),
    HabitabilityCriterion(
        getter=attrgetter("planet_density"),
        optimum=5.5,
        sigma=2.0,
        weight=0.07,
    ),
    HabitabilityCriterion(
        getter=attrgetter("orbital_eccentricity"),
        optimum=0.0,
        sigma=0.20,
        weight=0.08,
    ),
    HabitabilityCriterion(
        getter=attrgetter("stellar_mass"),
        optimum=0.85,
        sigma=0.50,
        weight=0.05,
    ),
    HabitabilityCriterion(
        getter=attrgetter("stellar_age"),
        optimum=4.0,
        sigma=2.5,
        weight=0.04,
    ),
    HabitabilityCriterion(
        getter=attrgetter("stellar_effective_temperature"),
        optimum=5300.0,
        sigma=1200.0,
        weight=0.03,
    ),
)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. DEFAULT PLANET IMAGES
# ═══════════════════════════════════════════════════════════════════════════════

DEFAULT_IMAGES: dict[PlanetComposition, str] = {
    PlanetComposition.ROCKY: "/assets/images/planets/rocky.webp",
    PlanetComposition.ROCKY_IRON: "/assets/images/planets/rocky_iron.webp",
    PlanetComposition.WATER_WORLD: "/assets/images/planets/water_world.webp",
    PlanetComposition.ICE: "/assets/images/planets/ice.webp",
    PlanetComposition.HYDROGEN_HELIUM: "/assets/images/planets/hydrogen_helium.webp",
    PlanetComposition.UNKNOWN: "/assets/images/planets/unknown.webp",
}
