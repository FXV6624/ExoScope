import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

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
    discovery_method: str | None = None
    discovery_year: int | None = None
    orbital_period: float | None = None
    planet_radius: float | None = None
    planet_mass: float | None = None
    distance_parsecs: float | None = None

class Exoplanet(ExoplanetBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    __table_args__ = (
        UniqueConstraint("planet_name", "host_star", name="uq_planet_star"),
    )

