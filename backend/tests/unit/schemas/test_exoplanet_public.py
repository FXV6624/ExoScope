"""Unit tests for ExoplanetPublic schema."""

import uuid
import pytest
from pydantic import ValidationError

from app.schemas.exoplanet import ExoplanetPublic
from app.models import ExoplanetBase


class TestExoplanetPublic:

    def test_valid_creation(self):
        planet_id = uuid.uuid4()
        ep = ExoplanetPublic(
            id=planet_id,
            planet_name="Kepler-22b",
            host_star="Kepler-22",
            discovery_method="Transit",
            discovery_year=2011,
            orbital_period=289.8,
            planet_radius=2.4,
            planet_mass=None,
            distance_parsecs=190.0,
        )
        assert ep.id == planet_id
        assert ep.planet_name == "Kepler-22b"

    def test_id_required(self):
        with pytest.raises(ValidationError) as exc_info:
            ExoplanetPublic(planet_name="X")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("id",) for e in errors)

    def test_planet_name_required(self):
        with pytest.raises(ValidationError) as exc_info:
            ExoplanetPublic(id=uuid.uuid4())
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("planet_name",) for e in errors)

    def test_inherits_base_optional_fields(self):
        ep = ExoplanetPublic(id=uuid.uuid4(), planet_name="X")
        assert ep.host_star is None
        assert ep.discovery_method is None
        assert ep.discovery_year is None
        assert ep.orbital_period is None
        assert ep.planet_radius is None
        assert ep.planet_mass is None
        assert ep.distance_parsecs is None

    def test_id_auto_uuid_str_input(self):
        """UUID can be provided as a string."""
        uid = str(uuid.uuid4())
        ep = ExoplanetPublic(id=uid, planet_name="X")
        assert isinstance(ep.id, uuid.UUID)

    def test_model_serialization(self):
        uid = uuid.uuid4()
        ep = ExoplanetPublic(id=uid, planet_name="Kepler-22b")
        d = ep.model_dump()
        assert d["id"] == uid
        assert d["planet_name"] == "Kepler-22b"

    def test_is_subclass_of_base(self):
        assert issubclass(ExoplanetPublic, ExoplanetBase)
