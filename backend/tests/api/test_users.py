"""API tests for /users endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User
from app.repositories.users import create_user
from app.schemas.user import UserCreate

API = settings.API_V1_STR


def _create_test_user(
    db: Session, email: str, password: str = "password12345", is_superuser: bool = False
) -> User:
    uc = UserCreate(email=email, password=password, is_superuser=is_superuser)
    hashed = get_password_hash(password)
    return create_user(session=db, user_create=uc, hashed_password=hashed)


def _get_token(client: TestClient, email: str, password: str) -> dict[str, str]:
    response = client.post(
        f"{API}/login/access-token", data={"username": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def test_user(db: Session):
    email = f"user-{uuid.uuid4().hex[:8]}@apitest.com"
    password = "testpassword123"
    user = _create_test_user(db, email, password)
    yield user, password
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


class TestGetUsers:
    def test_superuser_can_list_users(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.get(f"{API}/users/", headers=superuser_token_headers)
        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        assert "count" in body

    def test_normal_user_cannot_list_users(
        self, client: TestClient, db: Session, test_user
    ):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.get(f"{API}/users/", headers=headers)
        assert response.status_code == 403

    def test_unauthenticated_cannot_list_users(self, client: TestClient):
        response = client.get(f"{API}/users/")
        assert response.status_code == 401


class TestGetMe:
    def test_get_me_returns_current_user(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.get(f"{API}/users/me", headers=superuser_token_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["email"] == settings.FIRST_SUPERUSER

    def test_get_me_requires_auth(self, client: TestClient):
        response = client.get(f"{API}/users/me")
        assert response.status_code == 401


class TestUpdateMe:
    def test_update_full_name(self, client: TestClient, db: Session, test_user):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.patch(
            f"{API}/users/me", json={"full_name": "Updated Name"}, headers=headers
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Name"


class TestRegisterUser:
    def test_register_new_user(self, client: TestClient, db: Session):
        email = f"register-{uuid.uuid4().hex[:8]}@apitest.com"
        payload = {"email": email, "password": "strongpass123"}
        response = client.post(f"{API}/users/signup", json=payload)
        assert response.status_code == 200
        body = response.json()
        assert body["email"] == email
        # Cleanup
        db.execute(delete(User).where(User.email == email))
        db.commit()

    def test_register_duplicate_email_returns_400(self, client: TestClient, test_user):
        user, _ = test_user
        payload = {"email": user.email, "password": "anotherpass123"}
        response = client.post(f"{API}/users/signup", json=payload)
        assert response.status_code == 400

    def test_register_short_password_returns_422(self, client: TestClient):
        payload = {"email": "short@apitest.com", "password": "short"}
        response = client.post(f"{API}/users/signup", json=payload)
        assert response.status_code == 422


class TestGetUserById:
    def test_user_can_get_own_profile(self, client: TestClient, db: Session, test_user):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.get(f"{API}/users/{user.id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["email"] == user.email

    def test_superuser_can_get_any_user(
        self, client: TestClient, superuser_token_headers: dict, test_user
    ):
        user, _ = test_user
        response = client.get(f"{API}/users/{user.id}", headers=superuser_token_headers)
        assert response.status_code == 200

    def test_normal_user_cannot_get_other_user(
        self, client: TestClient, db: Session, test_user
    ):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.get(f"{API}/users/{uuid.uuid4()}", headers=headers)
        assert response.status_code in (403, 404)


class TestDeleteUser:
    def test_superuser_can_delete_user(
        self, client: TestClient, superuser_token_headers: dict, db: Session
    ):
        email = f"todelete-{uuid.uuid4().hex[:8]}@apitest.com"
        user = _create_test_user(db, email)
        response = client.delete(
            f"{API}/users/{user.id}", headers=superuser_token_headers
        )
        assert response.status_code == 200

    def test_superuser_cannot_delete_themselves(
        self, client: TestClient, superuser_token_headers: dict, db: Session
    ):
        from app.repositories.users import get_user_by_email

        superuser = get_user_by_email(db, settings.FIRST_SUPERUSER)
        response = client.delete(
            f"{API}/users/{superuser.id}", headers=superuser_token_headers
        )
        assert response.status_code == 403
