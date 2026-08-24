"""
utils.py - Helpers genéricos para los tests.

Funciones de ayuda que no encajan en factories.py ni en conftest.py pero se
usan en múltiples tests.
"""

import uuid
from datetime import timedelta

from sqlmodel import Session

from app.core.security import create_access_token, get_password_hash
from app.models import Exoplanet, User
from app.repositories.users import create_user
from app.schemas.user import UserCreate

# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------


def get_auth_headers(user_id: uuid.UUID) -> dict[str, str]:
    """Genera headers de autorización válidos para un UUID de usuario."""
    token = create_access_token(
        subject=str(user_id),
        expires_delta=timedelta(minutes=30),
    )
    return {"Authorization": f"Bearer {token}"}


def get_expired_auth_headers(user_id: uuid.UUID) -> dict[str, str]:
    """Genera headers con un token ya expirado."""
    token = create_access_token(
        subject=str(user_id),
        expires_delta=timedelta(minutes=-1),
    )
    return {"Authorization": f"Bearer {token}"}


def get_invalid_auth_headers() -> dict[str, str]:
    """Devuelve headers con un token inválido."""
    return {"Authorization": "Bearer invalid.token.here"}


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------


def create_test_user(
    session: Session,
    email: str = "testuser@example.com",
    password: str = "securepassword123",
    full_name: str | None = "Test User",
    is_superuser: bool = False,
) -> User:
    """Crea y persiste un usuario de test en la BD."""
    user_create = UserCreate(
        email=email,
        password=password,
        full_name=full_name,
        is_superuser=is_superuser,
    )
    hashed = get_password_hash(password)
    return create_user(session=session, user_create=user_create, hashed_password=hashed)


def create_test_exoplanet(
    session: Session,
    planet_name: str = "Test-Planet-b",
    host_star: str | None = "Test-Star",
    discovery_method: str | None = "Transit",
    discovery_year: int | None = 2020,
) -> Exoplanet:
    """Crea y persiste un exoplaneta de test en la BD."""
    planet = Exoplanet(
        planet_name=planet_name,
        host_star=host_star,
        discovery_method=discovery_method,
        discovery_year=discovery_year,
        orbital_period=300.0,
        planet_radius=2.0,
        planet_mass=5.0,
        distance_from_earth=100.0,
    )
    session.add(planet)
    session.commit()
    session.refresh(planet)
    return planet


# ---------------------------------------------------------------------------
# Assertion helpers
# ---------------------------------------------------------------------------


def assert_pagination_response(data: dict, expected_count: int | None = None) -> None:
    """Valida que una respuesta de paginación tenga la estructura correcta."""
    assert "data" in data
    assert "count" in data
    assert isinstance(data["data"], list)
    assert isinstance(data["count"], int)
    if expected_count is not None:
        assert data["count"] == expected_count


def assert_error_response(
    response, status_code: int, detail: str | None = None
) -> None:
    """Valida que una respuesta de error tenga el código y detalle esperados."""
    assert response.status_code == status_code
    if detail:
        body = response.json()
        assert "detail" in body
        assert detail.lower() in body["detail"].lower()
