from pydantic import BaseModel
from typing import Optional
import uuid
from sqlmodel import SQLModel
from app.models import ExoplanetBase
from app.core.enums.exoplanet import PlanetComposition


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

class ExoplanetsPublic(SQLModel):
    data: list[ExoplanetPublic]
    count: int

class ExoplanetFilters(BaseModel):
    planet_name: Optional[str] = None
    host_star: Optional[str] = None
    discovery_method: Optional[str] = None
    discovery_year: Optional[int] = None
    min_discovery_year: Optional[int] = None
    max_discovery_year: Optional[int] = None
    min_orbital_period: Optional[float] = None
    max_orbital_period: Optional[float] = None
    min_planet_radius: Optional[float] = None
    max_planet_radius: Optional[float] = None
    min_planet_mass: Optional[float] = None
    max_planet_mass: Optional[float] = None
    composition: Optional[PlanetComposition] = None
    min_composition_confidence: Optional[float] = None
    min_habitability_score: Optional[float] = None
    max_habitability_score: Optional[float] = None
    min_habitability_confidence: Optional[float] = None
    min_distance_from_earth: Optional[float] = None
    max_distance_from_earth: Optional[float] = None
    min_equilibrium_temperature: Optional[float] = None
    max_equilibrium_temperature: Optional[float] = None
    system_planet_count: Optional[int] = None
    min_system_planet_count: Optional[int] = None
    min_orbital_eccentricity: Optional[float] = None
    max_orbital_eccentricity: Optional[float] = None


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
    composition: float
    composition_confidence: float
    habitability_score: float
    habitability_confidence: float


class ExoplanetStats(BaseModel):
    total: int
    by_method: dict[str, int]
    by_decade: dict[str, int]
    composition: CompositionStats
    habitability: HabitabilityStats
    radius: SummaryStats
    mass: SummaryStats
    density: SummaryStats
    equilibrium_temperature: SummaryStats
    orbital_period: SummaryStats
    distance: SummaryStats
    completeness: CompletenessStats