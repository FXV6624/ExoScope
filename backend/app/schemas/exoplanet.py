from pydantic import BaseModel
from typing import Optional
import uuid
from sqlmodel import SQLModel
from app.models import ExoplanetBase


class ExoplanetRaw(BaseModel):
    pl_name: str
    hostname: str | None = None
    discoverymethod: str | None = None
    disc_year: int | None = None
    pl_orbper: float | None = None
    pl_rade: float | None = None
    pl_masse: float | None = None
    sy_dist: float | None = None

class ExoplanetPublic(ExoplanetBase):
    id: uuid.UUID

class ExoplanetsPublic(SQLModel):
    data: list[ExoplanetPublic]
    count: int

class ExoplanetFilters(BaseModel):
    planet_name: Optional[str] = None
    host_star: Optional[str] = None