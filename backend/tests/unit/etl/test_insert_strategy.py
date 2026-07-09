"""Unit tests for InsertLoadStrategy (mocked session)."""

import uuid
import pytest
from unittest.mock import MagicMock, patch

from app.etl.load_strategies.insert import InsertLoadStrategy
from app.etl.schemas import LoadResult
from tests.factories import make_exoplanet_model


class TestInsertLoadStrategy:

    def _make_session(self, inserted_ids=None):
        session = MagicMock()
        result_mock = MagicMock()
        result_mock.all.return_value = inserted_ids or []
        session.exec.return_value = result_mock
        return session

    def test_all_new_records_inserted(self):
        planets = [make_exoplanet_model("A"), make_exoplanet_model("B")]
        ids = [uuid.uuid4(), uuid.uuid4()]
        session = self._make_session(inserted_ids=ids)

        strategy = InsertLoadStrategy()
        with patch("app.etl.load_strategies.insert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_nothing.return_value.returning.return_value = MagicMock()
            session.exec.return_value.all.return_value = ids
            result = strategy.load(session, planets)

        assert session.commit.called

    def test_result_type_is_load_result(self):
        planets = [make_exoplanet_model()]
        session = self._make_session(inserted_ids=[uuid.uuid4()])

        strategy = InsertLoadStrategy()
        with patch("app.etl.load_strategies.insert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_nothing.return_value.returning.return_value = MagicMock()
            result = strategy.load(session, planets)

        assert isinstance(result, LoadResult)

    def test_attempted_equals_input_length(self):
        planets = [make_exoplanet_model("A"), make_exoplanet_model("B"), make_exoplanet_model("C")]
        ids = [uuid.uuid4(), uuid.uuid4()]  # 2 inserted, 1 skipped
        session = self._make_session(inserted_ids=ids)

        strategy = InsertLoadStrategy()
        with patch("app.etl.load_strategies.insert.build_insert_stmt") as mock_stmt:
            mock_stmt.return_value.on_conflict_do_nothing.return_value.returning.return_value = MagicMock()
            session.exec.return_value.all.return_value = ids
            result = strategy.load(session, planets)

        assert result.attempted == 3
        assert result.inserted == 2
        assert result.skipped == 1
        assert result.updated == 0
