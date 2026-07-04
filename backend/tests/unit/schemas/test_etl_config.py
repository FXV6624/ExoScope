"""Unit tests for ETLConfig schema."""

import pytest
from pydantic import ValidationError

from app.etl.config import ETLConfig
from app.etl.enums import LoadMode


class TestETLConfig:

    def test_defaults(self):
        config = ETLConfig()
        assert config.limit is None
        assert config.dry_run is False
        assert config.persist_run is True
        assert config.load_mode == LoadMode.UPSERT

    def test_custom_limit(self):
        config = ETLConfig(limit=500)
        assert config.limit == 500

    def test_dry_run_enabled(self):
        config = ETLConfig(dry_run=True)
        assert config.dry_run is True

    def test_persist_run_disabled(self):
        config = ETLConfig(persist_run=False)
        assert config.persist_run is False

    def test_load_mode_insert(self):
        config = ETLConfig(load_mode=LoadMode.INSERT)
        assert config.load_mode == LoadMode.INSERT

    def test_load_mode_reload(self):
        config = ETLConfig(load_mode=LoadMode.RELOAD)
        assert config.load_mode == LoadMode.RELOAD

    def test_limit_must_be_positive(self):
        """limit field has gt=0 constraint."""
        with pytest.raises(ValidationError):
            ETLConfig(limit=0)

    def test_limit_negative_raises(self):
        with pytest.raises(ValidationError):
            ETLConfig(limit=-1)

    def test_load_mode_invalid_string(self):
        with pytest.raises(ValidationError):
            ETLConfig(load_mode="invalid_mode")

    def test_serialization(self):
        config = ETLConfig(limit=100, dry_run=True)
        d = config.model_dump()
        assert d["limit"] == 100
        assert d["dry_run"] is True
        assert d["load_mode"] == LoadMode.UPSERT

    def test_load_mode_from_string(self):
        config = ETLConfig(load_mode="upsert")
        assert config.load_mode == LoadMode.UPSERT
