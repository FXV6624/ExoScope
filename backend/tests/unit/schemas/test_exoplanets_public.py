"""Unit tests for ExoplanetsPublic schema."""

import uuid
import pytest
from pydantic import ValidationError

from app.schemas.exoplanet import ExoplanetsPublic, ExoplanetPublic


def _make_public(name: str = "Kepler-22b") -> ExoplanetPublic:
    return ExoplanetPublic(id=uuid.uuid4(), planet_name=name)


class TestExoplanetsPublic:

    def test_valid_creation_empty_list(self):
        ep = ExoplanetsPublic(data=[], count=0)
        assert ep.data == []
        assert ep.count == 0

    def test_valid_creation_with_items(self):
        items = [_make_public("A"), _make_public("B")]
        ep = ExoplanetsPublic(data=items, count=2)
        assert len(ep.data) == 2
        assert ep.count == 2

    def test_count_field_required(self):
        with pytest.raises(ValidationError):
            ExoplanetsPublic(data=[])

    def test_data_field_required(self):
        with pytest.raises(ValidationError):
            ExoplanetsPublic(count=0)

    def test_count_does_not_need_to_match_list_length(self):
        """count reflects total DB rows, not page size."""
        items = [_make_public()]
        ep = ExoplanetsPublic(data=items, count=100)
        assert ep.count == 100
        assert len(ep.data) == 1

    def test_serialization(self):
        items = [_make_public("Kepler-22b")]
        ep = ExoplanetsPublic(data=items, count=1)
        d = ep.model_dump()
        assert "data" in d
        assert "count" in d
        assert d["count"] == 1
        assert d["data"][0]["planet_name"] == "Kepler-22b"
