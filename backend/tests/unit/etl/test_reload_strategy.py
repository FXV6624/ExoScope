"""Unit tests for ReloadLoadStrategy (mocked session)."""

from unittest.mock import MagicMock, patch

from app.etl.load_strategies.reload import ReloadLoadStrategy
from app.etl.schemas import LoadResult
from tests.factories import make_exoplanet_model


class TestReloadLoadStrategy:
    def _make_session(self):
        return MagicMock()

    def test_deletes_all_existing_records(self):
        session = self._make_session()
        planets = [make_exoplanet_model("A"), make_exoplanet_model("B")]

        strategy = ReloadLoadStrategy()
        with patch("app.etl.load_strategies.reload.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value = MagicMock()
            strategy.load(session, planets)

        # delete() and flush() should have been called before insert
        assert session.exec.called
        session.flush.assert_called_once()

    def test_all_planets_inserted_after_reload(self):
        session = self._make_session()
        planets = [
            make_exoplanet_model("A"),
            make_exoplanet_model("B"),
            make_exoplanet_model("C"),
        ]

        strategy = ReloadLoadStrategy()
        with patch("app.etl.load_strategies.reload.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert result.attempted == 3
        assert result.inserted == 3
        assert result.updated == 0
        assert result.skipped == 0

    def test_empty_list_still_deletes(self):
        session = self._make_session()
        planets: list = []

        strategy = ReloadLoadStrategy()
        with patch("app.etl.load_strategies.reload.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value = MagicMock()
            result = strategy.load(session, planets)

        # Even with empty list, delete should have been called
        assert session.exec.called
        assert result.attempted == 0

    def test_commits_session(self):
        session = self._make_session()
        planets = [make_exoplanet_model()]

        strategy = ReloadLoadStrategy()
        with patch("app.etl.load_strategies.reload.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value = MagicMock()
            strategy.load(session, planets)

        session.commit.assert_called_once()

    def test_returns_load_result(self):
        session = self._make_session()
        planets = [make_exoplanet_model()]

        strategy = ReloadLoadStrategy()
        with patch("app.etl.load_strategies.reload.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert isinstance(result, LoadResult)
