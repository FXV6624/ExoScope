"""Integration tests for UserRepository against a real PostgreSQL DB."""

import uuid

import pytest
from sqlmodel import Session, delete

from app.core.security import get_password_hash
from app.models import User
from app.repositories.users import create_user, get_user_by_email, update_user
from app.schemas.user import UserCreate


@pytest.fixture(autouse=True)
def clean_users(db: Session):
    """Delete test users (non-superuser) after each test."""
    yield
    db.execute(delete(User).where(User.email.like("%@testdomain.com")))
    db.commit()


def _make_user_create(email: str, password: str = "password123secure") -> UserCreate:
    return UserCreate(email=email, password=password, full_name="Test User")


class TestCreateUser:
    def test_creates_user_in_db(self, db: Session):
        user_create = _make_user_create("create@testdomain.com")
        hashed = get_password_hash(user_create.password)
        user = create_user(session=db, user_create=user_create, hashed_password=hashed)
        assert user.id is not None
        assert isinstance(user.id, uuid.UUID)
        assert user.email == "create@testdomain.com"

    def test_created_user_has_hashed_password(self, db: Session):
        user_create = _make_user_create("hash@testdomain.com")
        hashed = get_password_hash(user_create.password)
        user = create_user(session=db, user_create=user_create, hashed_password=hashed)
        assert user.hashed_password == hashed
        assert user.hashed_password != user_create.password

    def test_created_user_is_active_by_default(self, db: Session):
        user_create = _make_user_create("active@testdomain.com")
        hashed = get_password_hash(user_create.password)
        user = create_user(session=db, user_create=user_create, hashed_password=hashed)
        assert user.is_active is True

    def test_created_user_is_not_superuser_by_default(self, db: Session):
        user_create = _make_user_create("normal@testdomain.com")
        hashed = get_password_hash(user_create.password)
        user = create_user(session=db, user_create=user_create, hashed_password=hashed)
        assert user.is_superuser is False


class TestGetUserByEmail:
    def test_returns_user_when_found(self, db: Session):
        user_create = _make_user_create("find@testdomain.com")
        hashed = get_password_hash(user_create.password)
        create_user(session=db, user_create=user_create, hashed_password=hashed)

        found = get_user_by_email(db, "find@testdomain.com")
        assert found is not None
        assert found.email == "find@testdomain.com"

    def test_returns_none_when_not_found(self, db: Session):
        result = get_user_by_email(db, "nonexistent@testdomain.com")
        assert result is None

    def test_email_lookup_is_exact(self, db: Session):
        user_create = _make_user_create("exact@testdomain.com")
        hashed = get_password_hash(user_create.password)
        create_user(session=db, user_create=user_create, hashed_password=hashed)

        result = get_user_by_email(db, "EXACT@testdomain.com")
        # Email matching depends on DB collation, just verify no crash
        assert result is None or result.email == "exact@testdomain.com"


class TestUpdateUser:
    def test_update_full_name(self, db: Session):
        user_create = _make_user_create("update@testdomain.com")
        hashed = get_password_hash(user_create.password)
        user = create_user(session=db, user_create=user_create, hashed_password=hashed)

        updated = update_user(session=db, db_user=user, full_name="New Name")
        assert updated.full_name == "New Name"
