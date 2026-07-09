import uuid
from datetime import datetime, timezone
from app.core.enums.exoplanet import PlanetComposition
from sqlalchemy import DateTime, Column, String
from pydantic import EmailStr
from sqlalchemy import DateTime, Column
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from app.etl.report import ETLReport


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")

class ExoplanetBase(SQLModel):
    planet_name: str
    host_star: str | None = None
    discovery_year: int | None = None
    discovery_method: str | None = None
    planet_radius: float | None = None
    planet_mass: float | None = None
    planet_density: float | None = None
    equilibrium_temperature: float | None = None
    incident_flux: float | None = None
    orbital_period: float | None = None
    semi_major_axis: float | None = None
    orbital_eccentricity: float | None = None
    stellar_effective_temperature: float | None = None
    stellar_radius: float | None = None
    stellar_mass: float | None = None
    stellar_luminosity: float | None = None
    stellar_age: float | None = None
    distance_from_earth: float | None = None
    system_planet_count: int | None = None
    system_star_count: int | None = None
    composition: PlanetComposition | None = Field(default=None,sa_column=Column(String, nullable=True),)
    composition_confidence: float | None = None
    habitability_score: float | None = None
    habitability_confidence: float | None = None


class Exoplanet(ExoplanetBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    __table_args__ = (
        UniqueConstraint("planet_name", "host_star", name="uq_planet_star"),
    )


class ETLRun(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    started_at: datetime = Field(default_factory=get_datetime_utc)
    finished_at: datetime
    extracted: int
    transformed: int
    load_result: dict = Field(sa_column=Column(JSONB))
    extract_time: float
    transform_time: float
    load_time: float
    total_time: float
    success: bool
    errors: str = ""

    @classmethod
    def create(cls, report: ETLReport):
        return cls(
        started_at=report.started_at,
        finished_at=report.finished_at,

        extracted=report.extracted,
        transformed=report.transformed,

        load_result=report.load_result.model_dump(),

        extract_time=report.extract_time,
        transform_time=report.transform_time,
        load_time=report.load_time,
        total_time=report.duration_seconds,

        success=not report.errors,
        errors=" | ".join(report.errors),
    )
