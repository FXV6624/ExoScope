"""Integration tests for ExoplanetRepository against a real PostgreSQL DB."""

import uuid

import pytest
from sqlmodel import Session, delete

from app.models import Exoplanet
from app.repositories.exoplanet_query_builder import build_exoplanet_query
from app.repositories.exoplanets import (
    count_exoplanets,
    get_exoplanet_by_id,
    get_exoplanets_with_filters,
)
from app.schemas.exoplanet import ExoplanetFilters


@pytest.fixture(autouse=True)
def clean_exoplanets(db: Session):
    """Clean exoplanet table before each test."""
    db.execute(delete(Exoplanet))
    db.commit()
    yield
    db.execute(delete(Exoplanet))
    db.commit()


def _insert_planet(db: Session, name: str, star: str = "Star", method: str = "Transit", year: int = 2010) -> Exoplanet:
    planet = Exoplanet(planet_name=name, host_star=star, discovery_method=method, discovery_year=year,
                       orbital_period=300.0, planet_radius=2.0, planet_mass=5.0, distance_parsecs=100.0)
    db.add(planet)
    db.commit()
    db.refresh(planet)
    return planet


class TestCountExoplanets:

    def test_count_empty_table(self, db: Session):
        count = count_exoplanets(db)
        assert count == 0

    def test_count_with_records(self, db: Session):
        _insert_planet(db, "Planet-A")
        _insert_planet(db, "Planet-B")
        count = count_exoplanets(db)
        assert count == 2

    def test_count_with_query_filter(self, db: Session):
        _insert_planet(db, "Kepler-1b", method="Transit")
        _insert_planet(db, "HD-1b", method="Radial Velocity")
        filters = ExoplanetFilters(discovery_method="Transit")
        query = build_exoplanet_query(filters)
        count = count_exoplanets(db, query)
        assert count == 1


class TestGetExoplanetById:

    def test_returns_planet_when_found(self, db: Session):
        planet = _insert_planet(db, "Known-Planet")
        result = get_exoplanet_by_id(db, planet.id)
        assert result is not None
        assert result.id == planet.id
        assert result.planet_name == "Known-Planet"

    def test_returns_none_when_not_found(self, db: Session):
        result = get_exoplanet_by_id(db, uuid.uuid4())
        assert result is None


class TestGetExoplanetsWithFilters:

    def test_no_filters_returns_all(self, db: Session):
        _insert_planet(db, "A")
        _insert_planet(db, "B")
        _insert_planet(db, "C")
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(), skip=0, limit=10)
        assert count == 3
        assert len(data) == 3

    def test_filter_by_planet_name(self, db: Session):
        _insert_planet(db, "Kepler-22b")
        _insert_planet(db, "51 Peg b")
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(planet_name="Kepler"), skip=0, limit=10)
        assert count == 1
        assert data[0].planet_name == "Kepler-22b"

    def test_filter_by_discovery_year(self, db: Session):
        _insert_planet(db, "Old-Planet", year=1995)
        _insert_planet(db, "New-Planet", year=2020)
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(discovery_year=2020), skip=0, limit=10)
        assert count == 1
        assert data[0].planet_name == "New-Planet"

    def test_pagination_skip(self, db: Session):
        for i in range(5):
            _insert_planet(db, f"Planet-{i:02d}")
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(), skip=2, limit=10)
        assert count == 5
        assert len(data) == 3

    def test_pagination_limit(self, db: Session):
        for i in range(5):
            _insert_planet(db, f"Planet-{i:02d}")
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(), skip=0, limit=2)
        assert count == 5
        assert len(data) == 2

    def test_filter_year_range(self, db: Session):
        _insert_planet(db, "Old", year=1990)
        _insert_planet(db, "Mid", year=2005)
        _insert_planet(db, "New", year=2020)
        filters = ExoplanetFilters(min_discovery_year=2000, max_discovery_year=2010)
        data, count = get_exoplanets_with_filters(db, filters, skip=0, limit=10)
        assert count == 1
        assert data[0].planet_name == "Mid"

    def test_results_sorted_by_name(self, db: Session):
        _insert_planet(db, "Zeta-b")
        _insert_planet(db, "Alpha-b")
        _insert_planet(db, "Mid-b")
        data, count = get_exoplanets_with_filters(db, ExoplanetFilters(), skip=0, limit=10)
        names = [p.planet_name for p in data]
        assert names == sorted(names)
