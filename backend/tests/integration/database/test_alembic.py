"""Integration tests for Alembic migrations."""

from sqlalchemy import inspect, text

from app.core.db import engine


class TestAlembicMigrations:

    def test_expected_tables_exist(self):
        """Verify all expected tables are present in the database."""
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        expected_tables = {"user", "item", "exoplanet", "etlrun"}
        missing = expected_tables - set(tables)
        assert not missing, f"Missing tables: {missing}"

    def test_alembic_version_table_exists(self):
        """alembic_version table must exist if migrations have been applied."""
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        assert "alembic_version" in tables

    def test_user_table_columns(self):
        inspector = inspect(engine)
        columns = {col["name"] for col in inspector.get_columns("user")}
        expected = {"id", "email", "is_active", "is_superuser", "full_name", "hashed_password", "created_at"}
        missing = expected - columns
        assert not missing, f"User table missing columns: {missing}"

    def test_item_table_columns(self):
        inspector = inspect(engine)
        columns = {col["name"] for col in inspector.get_columns("item")}
        expected = {"id", "title", "description", "owner_id", "created_at"}
        missing = expected - columns
        assert not missing, f"Item table missing columns: {missing}"

    def test_exoplanet_table_columns(self):
        inspector = inspect(engine)
        columns = {col["name"] for col in inspector.get_columns("exoplanet")}
        expected = {
            "id", "planet_name", "host_star", "discovery_year", "discovery_method",
            "planet_radius", "planet_mass", "planet_density",
            "equilibrium_temperature", "incident_flux", "orbital_period",
            "semi_major_axis", "orbital_eccentricity", "stellar_effective_temperature",
            "stellar_radius", "stellar_mass", "stellar_luminosity", "stellar_age",
            "distance_from_earth", "system_planet_count", "system_star_count",
            "composition", "composition_confidence", "habitability_score",
            "habitability_confidence"
        }
        missing = expected - columns
        assert not missing, f"Exoplanet table missing columns: {missing}"

    def test_etlrun_table_columns(self):
        inspector = inspect(engine)
        columns = {col["name"] for col in inspector.get_columns("etlrun")}
        expected = {
            "id", "started_at", "finished_at", "extracted", "transformed",
            "load_result", "extract_time", "transform_time", "load_time",
            "total_time", "success", "errors"
        }
        missing = expected - columns
        assert not missing, f"ETLRun table missing columns: {missing}"

    def test_exoplanet_unique_constraint_exists(self):
        inspector = inspect(engine)
        unique_constraints = inspector.get_unique_constraints("exoplanet")
        constraint_names = [c["name"] for c in unique_constraints]
        assert "uq_planet_star" in constraint_names

    def test_item_foreign_key_to_user(self):
        inspector = inspect(engine)
        fks = inspector.get_foreign_keys("item")
        fk_tables = [fk["referred_table"] for fk in fks]
        assert "user" in fk_tables

    def test_database_connection_works(self):
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
