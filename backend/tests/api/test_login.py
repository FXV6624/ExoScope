"""API tests for authentication endpoints (/login/access-token, /login/test-token, etc.)."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


API = settings.API_V1_STR


class TestLoginAccessToken:

    def test_valid_login_returns_token(self, client: TestClient):
        data = {
            "username": settings.FIRST_SUPERUSER,
            "password": settings.FIRST_SUPERUSER_PASSWORD,
        }
        response = client.post(f"{API}/login/access-token", data=data)
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_wrong_password_returns_400(self, client: TestClient):
        data = {"username": settings.FIRST_SUPERUSER, "password": "wrongpassword"}
        response = client.post(f"{API}/login/access-token", data=data)
        assert response.status_code == 400

    def test_nonexistent_user_returns_400(self, client: TestClient):
        data = {"username": "ghost@nowhere.com", "password": "password123"}
        response = client.post(f"{API}/login/access-token", data=data)
        assert response.status_code == 400

    def test_empty_credentials_returns_422(self, client: TestClient):
        response = client.post(f"{API}/login/access-token", data={})
        assert response.status_code == 422


class TestTestToken:

    def test_test_token_returns_current_user(self, client: TestClient, superuser_token_headers: dict):
        response = client.post(f"{API}/login/test-token", headers=superuser_token_headers)
        assert response.status_code == 200
        body = response.json()
        assert "email" in body
        assert body["email"] == settings.FIRST_SUPERUSER

    def test_test_token_requires_auth(self, client: TestClient):
        response = client.post(f"{API}/login/test-token")
        assert response.status_code == 401

    def test_test_token_with_invalid_token_returns_403(self, client: TestClient):
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = client.post(f"{API}/login/test-token", headers=headers)
        assert response.status_code == 403


class TestPasswordRecovery:

    def test_recover_password_always_returns_200(self, client: TestClient):
        """Should return 200 even for unknown emails (prevent enumeration)."""
        response = client.post(f"{API}/password-recovery/nobody@nowhere.com")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_recover_password_for_known_user(self, client: TestClient):
        response = client.post(f"{API}/password-recovery/{settings.FIRST_SUPERUSER}")
        assert response.status_code == 200


class TestResetPassword:

    def test_reset_with_invalid_token_returns_400(self, client: TestClient):
        payload = {"token": "invalid-token", "new_password": "newSecurePass123"}
        response = client.post(f"{API}/reset-password/", json=payload)
        assert response.status_code == 400

    def test_reset_with_short_password_returns_422(self, client: TestClient):
        payload = {"token": "sometoken", "new_password": "short"}
        response = client.post(f"{API}/reset-password/", json=payload)
        assert response.status_code == 422
