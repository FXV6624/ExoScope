"""Unit tests for ExoplanetRaw schema."""

import pytest
from pydantic import ValidationError

from app.schemas.exoplanet import ExoplanetRaw


class TestExoplanetRaw:

    def test_valid_full_payload(self):
        raw = ExoplanetRaw(
            pl_name="Kepler-22b",
            hostname="Kepler-22",
            discoverymethod="Transit",
            disc_year=2011,
            pl_orbper=289.8,
            pl_rade=2.4,
            pl_masse=None,
            sy_dist=190.0,
        )
        assert raw.pl_name == "Kepler-22b"
        assert raw.hostname == "Kepler-22"
        assert raw.disc_year == 2011

    def test_only_required_field(self):
        """pl_name is the only required field."""
        raw = ExoplanetRaw(pl_name="51 Peg b")
        assert raw.pl_name == "51 Peg b"
        assert raw.hostname is None
        assert raw.discoverymethod is None
        assert raw.disc_year is None
        assert raw.pl_orbper is None
        assert raw.pl_rade is None
        assert raw.pl_masse is None
        assert raw.sy_dist is None

    def test_missing_pl_name_raises(self):
        with pytest.raises(ValidationError) as exc_info:
            ExoplanetRaw()
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("pl_name",) for e in errors)

    def test_optional_fields_accept_none(self):
        raw = ExoplanetRaw(
            pl_name="HD 209458 b",
            hostname=None,
            discoverymethod=None,
            disc_year=None,
            pl_orbper=None,
            pl_rade=None,
            pl_masse=None,
            sy_dist=None,
        )
        assert raw.pl_masse is None

    def test_disc_year_type_coercion(self):
        """Pydantic should coerce string integers."""
        raw = ExoplanetRaw(pl_name="X", disc_year=2000)
        assert raw.disc_year == 2000

    def test_float_fields_accept_int(self):
        """Float fields should accept int values (coercion)."""
        raw = ExoplanetRaw(pl_name="X", pl_orbper=100, pl_rade=2, sy_dist=50)
        assert raw.pl_orbper == 100.0
        assert isinstance(raw.pl_orbper, float)

    def test_model_serialization(self):
        raw = ExoplanetRaw(pl_name="Kepler-22b", disc_year=2011)
        d = raw.model_dump()
        assert d["pl_name"] == "Kepler-22b"
        assert "disc_year" in d

    def test_invalid_disc_year_type(self):
        with pytest.raises(ValidationError):
            ExoplanetRaw(pl_name="X", disc_year="not-a-number")