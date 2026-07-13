"""
factories.py - Datos de prueba reutilizables.

Provee funciones factory para crear instancias de modelos/schemas de forma
consistente a lo largo de todos los tests.
"""

import uuid
from datetime import datetime, timezone

from app.etl.config import ETLConfig
from app.etl.enums import LoadMode
from app.etl.metrics import ETLMetrics
from app.etl.report import ETLReport
from app.etl.schemas import LoadResult
from app.models import Exoplanet, ExoplanetBase, Item, User
from app.schemas.exoplanet import ExoplanetFilters, ExoplanetRaw
from app.schemas.item import ItemCreate
from app.schemas.user import UserCreate

# ---------------------------------------------------------------------------
# ExoplanetRaw
# ---------------------------------------------------------------------------


def make_exoplanet_raw(
    pl_name: str = "Kepler-22b",
    hostname: str | None = "Kepler-22",
    discoverymethod: str | None = "Transit",
    disc_year: int | None = 2011,
    pl_orbper: float | None = 289.8,
    pl_rade: float | None = 2.4,
    pl_masse: float | None = None,
    sy_dist: float | None = 190.0,
) -> ExoplanetRaw:
    return ExoplanetRaw(
        pl_name=pl_name,
        hostname=hostname,
        discoverymethod=discoverymethod,
        disc_year=disc_year,
        pl_orbper=pl_orbper,
        pl_rade=pl_rade,
        pl_masse=pl_masse,
        sy_dist=sy_dist,
    )


# ---------------------------------------------------------------------------
# ExoplanetBase / Exoplanet (modelo DB)
# ---------------------------------------------------------------------------


def make_exoplanet_base(
    planet_name: str = "Kepler-22b",
    host_star: str | None = "Kepler-22",
    discovery_method: str | None = "Transit",
    discovery_year: int | None = 2011,
    orbital_period: float | None = 289.8,
    planet_radius: float | None = 2.4,
    planet_mass: float | None = None,
    distance_from_earth: float | None = 190.0,
) -> ExoplanetBase:
    return ExoplanetBase(
        planet_name=planet_name,
        host_star=host_star,
        discovery_method=discovery_method,
        discovery_year=discovery_year,
        orbital_period=orbital_period,
        planet_radius=planet_radius,
        planet_mass=planet_mass,
        distance_from_earth=distance_from_earth,
    )


def make_exoplanet_model(
    planet_name: str = "Kepler-22b",
    host_star: str | None = "Kepler-22",
    discovery_method: str | None = "Transit",
    discovery_year: int | None = 2011,
    orbital_period: float | None = 289.8,
    planet_radius: float | None = 2.4,
    planet_mass: float | None = None,
    distance_from_earth: float | None = 190.0,
) -> Exoplanet:
    return Exoplanet(
        id=uuid.uuid4(),
        planet_name=planet_name,
        host_star=host_star,
        discovery_method=discovery_method,
        discovery_year=discovery_year,
        orbital_period=orbital_period,
        planet_radius=planet_radius,
        planet_mass=planet_mass,
        distance_from_earth=distance_from_earth,
    )


# ---------------------------------------------------------------------------
# ExoplanetFilters
# ---------------------------------------------------------------------------


def make_exoplanet_filters(**kwargs) -> ExoplanetFilters:
    return ExoplanetFilters(**kwargs)


# ---------------------------------------------------------------------------
# User / UserCreate
# ---------------------------------------------------------------------------


def make_user_create(
    email: str = "test@example.com",
    password: str = "securepassword123",
    full_name: str | None = "Test User",
    is_superuser: bool = False,
) -> UserCreate:
    return UserCreate(
        email=email,
        password=password,
        full_name=full_name,
        is_superuser=is_superuser,
    )


def make_user_model(
    email: str = "test@example.com",
    hashed_password: str = "$argon2id$v=19$m=65536,t=3,p=4$fake",
    full_name: str | None = "Test User",
    is_superuser: bool = False,
    is_active: bool = True,
) -> User:
    return User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        is_superuser=is_superuser,
        is_active=is_active,
    )


# ---------------------------------------------------------------------------
# Item / ItemCreate
# ---------------------------------------------------------------------------


def make_item_create(
    title: str = "Test Item",
    description: str | None = "A test item",
) -> ItemCreate:
    return ItemCreate(title=title, description=description)


def make_item_model(
    title: str = "Test Item",
    description: str | None = "A test item",
    owner_id: uuid.UUID | None = None,
) -> Item:
    return Item(
        id=uuid.uuid4(),
        title=title,
        description=description,
        owner_id=owner_id or uuid.uuid4(),
    )


# ---------------------------------------------------------------------------
# LoadResult
# ---------------------------------------------------------------------------


def make_load_result(
    attempted: int = 5,
    inserted: int = 3,
    updated: int = 1,
    skipped: int = 1,
) -> LoadResult:
    return LoadResult(
        attempted=attempted,
        inserted=inserted,
        updated=updated,
        skipped=skipped,
    )


# ---------------------------------------------------------------------------
# ETLMetrics / ETLReport
# ---------------------------------------------------------------------------


def make_etl_metrics(
    extracted: int = 10,
    transformed: int = 9,
    errors: list[str] | None = None,
) -> ETLMetrics:
    now = datetime.now(timezone.utc)
    m = ETLMetrics(
        extracted=extracted,
        transformed=transformed,
        errors=errors or [],
        load_result=LoadResult(attempted=9, inserted=9),
    )
    m.started_at = now
    m.finished_at = now
    m.extract_start = now
    m.extract_end = now
    m.transform_start = now
    m.transform_end = now
    m.load_start = now
    m.load_end = now
    return m


def make_etl_report(
    extracted: int = 10,
    transformed: int = 9,
    errors: list[str] | None = None,
) -> ETLReport:
    metrics = make_etl_metrics(
        extracted=extracted, transformed=transformed, errors=errors
    )
    return ETLReport.from_metrics(metrics)


# ---------------------------------------------------------------------------
# ETLConfig
# ---------------------------------------------------------------------------


def make_etl_config(
    limit: int | None = 100,
    dry_run: bool = False,
    persist_run: bool = False,
    load_mode: LoadMode = LoadMode.UPSERT,
) -> ETLConfig:
    return ETLConfig(
        limit=limit,
        dry_run=dry_run,
        persist_run=persist_run,
        load_mode=load_mode,
    )
