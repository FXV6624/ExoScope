"""Unit tests for UpsertLoadStrategy (mocked session)."""

from unittest.mock import MagicMock, patch

from app.etl.load_strategies.upsert import UpsertLoadStrategy
from app.etl.schemas import LoadResult
from tests.factories import make_exoplanet_model


class TestUpsertLoadStrategy:
    def _make_session(self, existing_keys=None):
        """existing_keys: set of (planet_name, host_star) tuples already in DB."""
        session = MagicMock()
        existing_keys = existing_keys or set()
        session.exec.return_value.all.return_value = list(existing_keys)
        return session

    def test_all_new_records(self):
        planets = [
            make_exoplanet_model("New-A", "Star-A"),
            make_exoplanet_model("New-B", "Star-B"),
        ]
        session = self._make_session(existing_keys=set())  # none existing

        strategy = UpsertLoadStrategy()
        with patch("app.etl.load_strategies.upsert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_update.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert result.inserted == 2
        assert result.updated == 0
        assert result.skipped == 0
        assert result.attempted == 2

    def test_all_existing_records(self):
        planets = [
            make_exoplanet_model("Existing-A", "Star-A"),
            make_exoplanet_model("Existing-B", "Star-B"),
        ]
        existing = {("Existing-A", "Star-A"), ("Existing-B", "Star-B")}
        session = self._make_session(existing_keys=existing)

        strategy = UpsertLoadStrategy()
        with patch("app.etl.load_strategies.upsert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_update.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert result.updated == 2
        assert result.inserted == 0
        assert result.skipped == 0

    def test_mixed_new_and_existing(self):
        planets = [
            make_exoplanet_model("New-Planet", "Star-A"),
            make_exoplanet_model("Existing-Planet", "Star-B"),
        ]
        existing = {("Existing-Planet", "Star-B")}
        session = self._make_session(existing_keys=existing)

        strategy = UpsertLoadStrategy()
        with patch("app.etl.load_strategies.upsert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_update.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert result.inserted == 1
        assert result.updated == 1
        assert result.attempted == 2

    def test_returns_load_result(self):
        planets = [make_exoplanet_model()]
        session = self._make_session()

        strategy = UpsertLoadStrategy()
        with patch("app.etl.load_strategies.upsert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_update.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert isinstance(result, LoadResult)

    def test_commits_session(self):
        planets = [make_exoplanet_model()]
        session = self._make_session()

        strategy = UpsertLoadStrategy()
        with patch("app.etl.load_strategies.upsert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_update.return_value = MagicMock()
            strategy.load(session, planets)

        session.commit.assert_called_once()
