from pydantic import BaseModel
from typing import Optional
import uuid
from sqlmodel import SQLModel
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

class ExoplanetStats(BaseModel):
    total: int
    by_method: dict[str, int]
    by_decade: dict[str, int]