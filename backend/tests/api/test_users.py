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


def _create_test_user(db: Session, email: str, password: str = "password12345") -> User:
    uc = UserCreate(email=email, password=password)
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
    def test_admin_can_list_users(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.get(f"{API}/users/", headers=superuser_token_headers)
        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        assert "count" in body

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
        assert body["email"] == settings.FIRST_ADMIN

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


class TestCreateUser:
    def test_admin_can_create_user(
        self, client: TestClient, superuser_token_headers: dict, db: Session
    ):
        from unittest.mock import patch

        email = f"newuser-{uuid.uuid4().hex[:8]}@apitest.com"
        payload = {
            "email": email,
            "password": "password12345",
            "full_name": "New Admin Created",
        }

        with patch("app.api.routes.users.send_email"):
            response = client.post(
                f"{API}/users/", headers=superuser_token_headers, json=payload
            )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email
        assert data["full_name"] == "New Admin Created"

        # Cleanup
        db_user = db.get(User, uuid.UUID(data["id"]))
        if db_user:
            db.delete(db_user)
            db.commit()

    def test_cannot_create_duplicate_email(
        self, client: TestClient, superuser_token_headers: dict
    ):
        payload = {"email": settings.FIRST_ADMIN, "password": "password12345"}
        response = client.post(
            f"{API}/users/", headers=superuser_token_headers, json=payload
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestGetUserById:
    def test_admin_can_get_any_user(
        self, client: TestClient, superuser_token_headers: dict, test_user
    ):
        user, _ = test_user
        response = client.get(f"{API}/users/{user.id}", headers=superuser_token_headers)
        assert response.status_code == 200

    def test_unauthenticated_cannot_get_user(self, client: TestClient):
        response = client.get(f"{API}/users/{uuid.uuid4()}")
        assert response.status_code == 401

    def test_get_user_not_found(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.get(
            f"{API}/users/{uuid.uuid4()}", headers=superuser_token_headers
        )
        assert response.status_code == 404


class TestUpdatePasswordMe:
    def test_update_password_incorrect_current(self, client: TestClient, test_user):
        user, _ = test_user
        headers = _get_token(client, user.email, "testpassword123")
        response = client.patch(
            f"{API}/users/me/password",
            headers=headers,
            json={
                "current_password": "wrongpassword123",
                "new_password": "newpassword1234",
            },
        )
        assert response.status_code == 400
        assert "Incorrect password" in response.json()["detail"]

    def test_update_password_same_as_current(self, client: TestClient, test_user):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.patch(
            f"{API}/users/me/password",
            headers=headers,
            json={"current_password": password, "new_password": password},
        )
        assert response.status_code == 400
        assert "cannot be the same" in response.json()["detail"]

    def test_update_password_success(self, client: TestClient, test_user):
        user, password = test_user
        headers = _get_token(client, user.email, password)
        response = client.patch(
            f"{API}/users/me/password",
            headers=headers,
            json={"current_password": password, "new_password": "brandnewpassword123"},
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Password updated"


class TestUpdateUser:
    def test_admin_update_user_success(
        self, client: TestClient, superuser_token_headers: dict, test_user
    ):
        user, _ = test_user
        response = client.patch(
            f"{API}/users/{user.id}",
            headers=superuser_token_headers,
            json={"full_name": "Admin Modified Name"},
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Admin Modified Name"

    def test_admin_update_user_not_found(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.patch(
            f"{API}/users/{uuid.uuid4()}",
            headers=superuser_token_headers,
            json={"full_name": "Ghost"},
        )
        assert response.status_code == 404

    def test_admin_update_user_email_conflict(
        self, client: TestClient, superuser_token_headers: dict, test_user
    ):
        user, _ = test_user
        response = client.patch(
            f"{API}/users/{user.id}",
            headers=superuser_token_headers,
            json={"email": settings.FIRST_ADMIN},
        )
        assert response.status_code == 409


class TestDeleteUser:
    def test_admin_can_delete_user(
        self, client: TestClient, superuser_token_headers: dict, db: Session
    ):
        email = f"todelete-{uuid.uuid4().hex[:8]}@apitest.com"
        user = _create_test_user(db, email)
        response = client.delete(
            f"{API}/users/{user.id}", headers=superuser_token_headers
        )
        assert response.status_code == 200

    def test_delete_user_not_found(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.delete(
            f"{API}/users/{uuid.uuid4()}", headers=superuser_token_headers
        )
        assert response.status_code == 404

    def test_admin_cannot_delete_themselves(
        self, client: TestClient, superuser_token_headers: dict, db: Session
    ):
        from app.repositories.users import get_user_by_email

        superuser = get_user_by_email(db, settings.FIRST_ADMIN)
        response = client.delete(
            f"{API}/users/{superuser.id}", headers=superuser_token_headers
        )
        assert response.status_code == 403
