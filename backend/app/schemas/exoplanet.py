import uuid
from typing import Any

from pydantic import BaseModel

from app.core.enums.exoplanet import (
    ExoplanetField,
    ExoplanetSortField,
    PlanetClass,
    PlanetComposition,
    SortOrder,
)
from app.models import ExoplanetBase


class ExoplanetRaw(BaseModel):
    pl_name: str
    hostname: str | None = None
    disc_year: int | None = None
    discoverymethod: str | None = None
    pl_rade: float | None = None
    pl_masse: float | None = None
    pl_dens: float | None = None
    pl_eqt: float | None = None
    pl_insol: float | None = None
    pl_orbper: float | None = None
    pl_orbsmax: float | None = None
    pl_orbeccen: float | None = None
    st_teff: float | None = None
    st_rad: float | None = None
    st_mass: float | None = None
    st_lum: float | None = None
    st_age: float | None = None
    sy_dist: float | None = None
    sy_pnum: int | None = None
    sy_snum: int | None = None


class ExoplanetPublic(ExoplanetBase):
    id: uuid.UUID


class ExoplanetFilters(BaseModel):
    planet_name: str | None = None
    host_star: str | None = None
    discovery_method: str | None = None
    discovery_year: int | None = None
    min_discovery_year: int | None = None
    max_discovery_year: int | None = None
    min_orbital_period: float | None = None
    max_orbital_period: float | None = None
    min_planet_radius: float | None = None
    max_planet_radius: float | None = None
    min_planet_mass: float | None = None
    max_planet_mass: float | None = None
    planet_class: PlanetClass | None = None
    min_planet_class_confidence: float | None = None
    max_planet_class_confidence: float | None = None
    composition: PlanetComposition | None = None
    min_composition_confidence: float | None = None
    max_composition_confidence: float | None = None
    min_habitability_score: float | None = None
    max_habitability_score: float | None = None
    min_habitability_confidence: float | None = None
    min_distance_from_earth: float | None = None
    max_distance_from_earth: float | None = None
    min_equilibrium_temperature: float | None = None
    max_equilibrium_temperature: float | None = None
    system_planet_count: int | None = None
    min_system_planet_count: int | None = None
    min_orbital_eccentricity: float | None = None
    max_orbital_eccentricity: float | None = None
    has_custom_photo: bool | None = None
    sort_by: ExoplanetSortField | None = None
    order: SortOrder = SortOrder.asc


class PlanetClassResult(BaseModel):
    planet_class: PlanetClass
    confidence: float


class CompositionResult(BaseModel):
    composition: PlanetComposition
    confidence: float


class HabitabilityResult(BaseModel):
    score: float
    confidence: float


class SummaryStats(BaseModel):
    average: float | None = None
    minimum: float | None = None
    maximum: float | None = None


class HabitabilityStats(SummaryStats):
    average_confidence: float | None = None
    potentially_habitable: int = 0


class PlanetClassStats(BaseModel):
    by_class: dict[PlanetClass, int]
    average_confidence: float | None = None


class CompositionStats(BaseModel):
    by_composition: dict[PlanetComposition, int]
    average_confidence: float | None = None


class CompletenessStats(BaseModel):
    host_star: float
    discovery_year: float
    discovery_method: float
    planet_radius: float
    planet_mass: float
    planet_density: float
    equilibrium_temperature: float
    incident_flux: float
    orbital_period: float
    semi_major_axis: float
    orbital_eccentricity: float
    stellar_effective_temperature: float
    stellar_radius: float
    stellar_mass: float
    stellar_luminosity: float
    stellar_age: float
    distance_from_earth: float
    system_planet_count: float
    system_star_count: float
    planet_class: float
    planet_class_confidence: float
    composition: float
    composition_confidence: float
    habitability_score: float
    habitability_confidence: float


class ExoplanetStats(BaseModel):
    total: int
    by_method: dict[str, int]
    by_decade: dict[str, int]
    planet_class: PlanetClassStats
    composition: CompositionStats
    habitability: HabitabilityStats
    radius: SummaryStats
    mass: SummaryStats
    density: SummaryStats
    equilibrium_temperature: SummaryStats
    orbital_period: SummaryStats
    distance: SummaryStats
    completeness: CompletenessStats


class ExoplanetQueryMetadata(BaseModel):
    count: int
    returned: int
    skip: int
    limit: int
    sort_by: ExoplanetSortField
    order: SortOrder
    fields: list[ExoplanetField] | None = None
    filters: ExoplanetFilters


class ExoplanetsQueryResponse(BaseModel):
    data: list[Any]
    meta: ExoplanetQueryMetadata
