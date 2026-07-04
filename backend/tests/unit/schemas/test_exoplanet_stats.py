"""Unit tests for ExoplanetStats schema."""

import pytest
from pydantic import ValidationError

from app.schemas.exoplanet import ExoplanetStats


class TestExoplanetStats:

    def test_valid_creation(self):
        stats = ExoplanetStats(
            total=5000,
            by_method={"Transit": 3000, "Radial Velocity": 1500, "Direct Imaging": 500},
            by_decade={"1990": 10, "2000": 500, "2010": 4490},
        )
        assert stats.total == 5000
        assert stats.by_method["Transit"] == 3000
        assert stats.by_decade["2010"] == 4490

    def test_empty_dicts(self):
        stats = ExoplanetStats(total=0, by_method={}, by_decade={})
        assert stats.total == 0
        assert stats.by_method == {}
        assert stats.by_decade == {}

    def test_total_required(self):
        with pytest.raises(ValidationError):
            ExoplanetStats(by_method={}, by_decade={})

    def test_by_method_required(self):
        with pytest.raises(ValidationError):
            ExoplanetStats(total=0, by_decade={})

    def test_by_decade_required(self):
        with pytest.raises(ValidationError):
            ExoplanetStats(total=0, by_method={})

    def test_total_must_be_int(self):
        with pytest.raises(ValidationError):
            ExoplanetStats(total="many", by_method={}, by_decade={})

    def test_by_method_values_must_be_int(self):
        with pytest.raises(ValidationError):
            ExoplanetStats(total=1, by_method={"Transit": "lots"}, by_decade={})

    def test_serialization(self):
        stats = ExoplanetStats(total=100, by_method={"Transit": 80}, by_decade={"2010": 100})
        d = stats.model_dump()
        assert d["total"] == 100
        assert d["by_method"] == {"Transit": 80}
        assert d["by_decade"] == {"2010": 100}
