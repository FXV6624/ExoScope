"""Integration tests for ETL load step against a real PostgreSQL DB."""

import pytest
from sqlmodel import Session, delete, select

from app.etl.enums import LoadMode
from app.etl.load import load
from app.etl.schemas import LoadResult
from app.models import Exoplanet


@pytest.fixture(autouse=True)
def clean_exoplanets(db: Session):
    db.execute(delete(Exoplanet))
    db.commit()
    yield
    db.execute(delete(Exoplanet))
    db.commit()


def _make_exoplanet_base(name: str, star: str = "Star") -> Exoplanet:
    """Creates an ExoplanetBase-compatible Exoplanet for load tests."""
    from app.models import ExoplanetBase

    return ExoplanetBase(
        planet_name=name,
        host_star=star,
        discovery_method="Transit",
        discovery_year=2010,
        orbital_period=300.0,
        planet_radius=2.0,
        planet_mass=5.0,
        distance_from_earth=100.0,
    )


class TestLoadEmpty:
    def test_empty_list_with_upsert_returns_empty_result(self, db: Session):
        result = load(db, [], LoadMode.UPSERT)
        assert isinstance(result, LoadResult)
        assert result.attempted == 0

    def test_empty_list_with_insert_returns_empty_result(self, db: Session):
        result = load(db, [], LoadMode.INSERT)
        assert isinstance(result, LoadResult)
        assert result.attempted == 0


class TestLoadInsert:
    def test_inserts_new_records(self, db: Session):
        planets = [_make_exoplanet_base("New-A"), _make_exoplanet_base("New-B")]
        result = load(db, planets, LoadMode.INSERT)
        assert result.inserted == 2
        assert result.attempted == 2

        count = db.exec(select(Exoplanet)).all()
        assert len(count) == 2

    def test_insert_skips_duplicates(self, db: Session):
        planets = [_make_exoplanet_base("Dup-Planet")]
        load(db, planets, LoadMode.INSERT)
        result = load(db, planets, LoadMode.INSERT)
        assert result.skipped == 1
        assert result.inserted == 0


class TestLoadUpsert:
    def test_upserts_new_records(self, db: Session):
        planets = [_make_exoplanet_base("Upsert-A"), _make_exoplanet_base("Upsert-B")]
        result = load(db, planets, LoadMode.UPSERT)
        assert result.inserted == 2

    def test_upsert_updates_existing(self, db: Session):
        planets = [_make_exoplanet_base("Existing-Planet")]
        load(db, planets, LoadMode.UPSERT)

        # Re-upsert same planet (should be update now)
        result = load(db, planets, LoadMode.UPSERT)
        assert result.updated == 1
        assert result.inserted == 0

        # Only 1 record in DB
        all_planets = db.exec(select(Exoplanet)).all()
        assert len(all_planets) == 1


class TestLoadReload:
    def test_reload_clears_and_reinserts(self, db: Session):
        # Insert initial data
        initial = [_make_exoplanet_base("Old-A"), _make_exoplanet_base("Old-B")]
        load(db, initial, LoadMode.INSERT)

        # Reload with completely different data
        new_data = [
            _make_exoplanet_base("New-X"),
            _make_exoplanet_base("New-Y"),
            _make_exoplanet_base("New-Z"),
        ]
        result = load(db, new_data, LoadMode.RELOAD)

        all_planets = db.exec(select(Exoplanet)).all()
        names = {p.planet_name for p in all_planets}
        assert "Old-A" not in names
        assert "Old-B" not in names
        assert "New-X" in names
        assert result.inserted == 3
