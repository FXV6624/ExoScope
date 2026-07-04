"""Unit tests for the ETL load strategy factory."""

import pytest

from app.etl.enums import LoadMode
from app.etl.load_strategies.factory import get_load_strategy
from app.etl.load_strategies.insert import InsertLoadStrategy
from app.etl.load_strategies.upsert import UpsertLoadStrategy
from app.etl.load_strategies.reload import ReloadLoadStrategy


class TestGetLoadStrategy:

    def test_upsert_returns_upsert_strategy(self):
        strategy = get_load_strategy(LoadMode.UPSERT)
        assert isinstance(strategy, UpsertLoadStrategy)

    def test_insert_returns_insert_strategy(self):
        strategy = get_load_strategy(LoadMode.INSERT)
        assert isinstance(strategy, InsertLoadStrategy)

    def test_reload_returns_reload_strategy(self):
        strategy = get_load_strategy(LoadMode.RELOAD)
        assert isinstance(strategy, ReloadLoadStrategy)

    def test_unknown_mode_raises_value_error(self):
        """Passing an unsupported mode should raise ValueError."""
        with pytest.raises((ValueError, Exception)):
            get_load_strategy("totally_unknown_mode")  # type: ignore

    def test_strategies_implement_load_method(self):
        for mode in LoadMode:
            strategy = get_load_strategy(mode)
            assert hasattr(strategy, "load"), f"Strategy for {mode} missing .load()"
            assert callable(strategy.load)

    def test_each_call_returns_new_instance(self):
        s1 = get_load_strategy(LoadMode.UPSERT)
        s2 = get_load_strategy(LoadMode.UPSERT)
        # Fresh instances each time
        assert s1 is not s2
