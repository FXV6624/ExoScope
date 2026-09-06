"""API tests for authentication endpoints (/login/access-token, /login/test-token, etc.)."""

from fastapi.testclient import TestClient

from app.core.config import settings

API = settings.API_V1_STR


class TestLoginAccessToken:
    def test_valid_login_returns_token(self, client: TestClient):
        data = {
            "username": settings.FIRST_ADMIN,
            "password": settings.FIRST_ADMIN_PASSWORD,
        }
        response = client.post(f"{API}/login/access-token", data=data)
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_wrong_password_returns_400(self, client: TestClient):
        data = {"username": settings.FIRST_ADMIN, "password": "wrongpassword"}
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
    def test_test_token_returns_current_user(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.post(
            f"{API}/login/test-token", headers=superuser_token_headers
        )
        assert response.status_code == 200
        body = response.json()
        assert "email" in body
        assert body["email"] == settings.FIRST_ADMIN

    def test_test_token_requires_auth(self, client: TestClient):
        response = client.post(f"{API}/login/test-token")
        assert response.status_code == 401

    def test_test_token_with_invalid_token_returns_401(self, client: TestClient):
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = client.post(f"{API}/login/test-token", headers=headers)
        assert response.status_code == 401


class TestPasswordRecovery:
    def test_recover_password_always_returns_200(self, client: TestClient):
        """Should return 200 even for unknown emails (prevent enumeration)."""
        response = client.post(f"{API}/password-recovery/nobody@nowhere.com")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_recover_password_for_known_user(self, client: TestClient):
        from unittest.mock import patch

        with patch("app.api.routes.login.send_email"):
            response = client.post(f"{API}/password-recovery/{settings.FIRST_ADMIN}")
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

    def test_reset_with_valid_token_success(self, client: TestClient):
        from app.utils import generate_password_reset_token

        token = generate_password_reset_token(email=settings.FIRST_ADMIN)
        payload = {"token": token, "new_password": "brandNewAdminPassword123!"}
        response = client.post(f"{API}/reset-password/", json=payload)
        assert response.status_code == 200
        assert "Password updated successfully" in response.json()["message"]

        # Restore original password
        token2 = generate_password_reset_token(email=settings.FIRST_ADMIN)
        client.post(
            f"{API}/reset-password/",
            json={"token": token2, "new_password": settings.FIRST_ADMIN_PASSWORD},
        )

    def test_reset_with_valid_token_user_not_found(self, client: TestClient):
        from app.utils import generate_password_reset_token

        token = generate_password_reset_token(email="nonexistentuser@example.com")
        payload = {"token": token, "new_password": "brandNewPassword123!"}
        response = client.post(f"{API}/reset-password/", json=payload)
        assert response.status_code == 400
        assert "Invalid token" in response.json()["detail"]


class TestPasswordRecoveryHtmlContent:
    def test_recovery_html_existing_user(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.post(
            f"{API}/password-recovery-html-content/{settings.FIRST_ADMIN}",
            headers=superuser_token_headers,
        )
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "Password recovery" in response.headers.get("subject", "")

    def test_recovery_html_user_not_found(
        self, client: TestClient, superuser_token_headers: dict
    ):
        response = client.post(
            f"{API}/password-recovery-html-content/nobody@nowhere.com",
            headers=superuser_token_headers,
        )
        assert response.status_code == 404
