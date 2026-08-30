"""
conftest.py - Fixtures compartidas para toda la suite de tests.

Organización:
- db: sesión real a PostgreSQL (session-scope) → tests de integración/API
- client: TestClient de FastAPI
- superuser_token_headers: headers con JWT (now admin)
"""

from collections.abc import Generator
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from sqlmodel import Session, delete

from app.core.db import engine, init_db
from app.main import app
from app.models import ETLRun, Exoplanet, User
from tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="session", autouse=True)
def setup_cache_and_limiter():
    from app.core.limiter import limiter

    limiter.enabled = False

    FastAPICache.init(InMemoryBackend())

    with (
        patch("app.main.init_cache", new_callable=AsyncMock),
        patch("app.main.close_cache", new_callable=AsyncMock),
        patch("app.core.cache.clear_cache_sync"),
    ):
        yield


# ---------------------------------------------------------------------------
# DATABASE
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    """
    Sesión real a PostgreSQL.
    Se ejecuta una vez por toda la sesión de pytest.
    Al finalizar limpia las tablas de test.
    """
    with Session(engine) as session:
        init_db(session)
        yield session
        # Limpieza post-test (orden importa por FK)
        session.execute(delete(Exoplanet))
        session.execute(delete(ETLRun))
        session.execute(delete(User))
        session.commit()


# ---------------------------------------------------------------------------
# HTTP CLIENT
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    """TestClient de FastAPI para tests de API."""
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# AUTH HEADERS
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    """Headers JWT del admin definido en settings."""
    return get_superuser_token_headers(client)
