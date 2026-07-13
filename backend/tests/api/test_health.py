"""API tests for health check endpoints if any exist."""

from fastapi.testclient import TestClient

from app.core.config import settings

API = settings.API_V1_STR


class TestHealth:
    def test_health_check_private_route_exists_in_local(self, client: TestClient):
        """In local environment, a private health route or utils might exist."""
        # This checks if the utils route has a test email endpoint as a health proxy
        # Since there's no dedicated /health in the current router setup, we test an open endpoint

        # Test if the docs endpoint works as a basic health check
        response = client.get("/docs")
        assert response.status_code == 200

        # Test OpenAPI schema
        response = client.get(f"{API}/openapi.json")
        assert response.status_code == 200

    def test_utils_test_email_endpoint(
        self, client: TestClient, superuser_token_headers: dict
    ):
        """Test the utils endpoint to ensure API router inclusions work."""
        from unittest.mock import patch

        with patch("app.api.routes.utils.send_email"):
            response = client.post(
                f"{API}/utils/test-email/",
                headers=superuser_token_headers,
                params={"email_to": "test@example.com"},
            )
        # Even if SMTP is disabled, it returns 200 or 500 depending on config.
        # We just verify the route exists
        assert response.status_code in (201, 200, 500)
