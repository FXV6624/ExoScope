"""Unit tests for core.config (Settings)."""

import pytest

from app.core.config import parse_cors, settings


class TestParseCors:
    def test_comma_separated_string(self):
        result = parse_cors("http://localhost,http://example.com")
        assert result == ["http://localhost", "http://example.com"]

    def test_comma_separated_with_spaces(self):
        result = parse_cors("http://localhost , http://example.com")
        assert result == ["http://localhost", "http://example.com"]

    def test_json_array_passthrough(self):
        result = parse_cors('["http://localhost"]')
        assert result == '["http://localhost"]'

    def test_list_passthrough(self):
        value = ["http://localhost"]
        result = parse_cors(value)
        assert result == value

    def test_invalid_type_raises(self):
        with pytest.raises(ValueError):
            parse_cors(12345)

    def test_empty_string_returns_empty_list(self):
        result = parse_cors("")
        assert result == []


class TestSettings:
    def test_settings_instance_exists(self):
        assert settings is not None

    def test_api_v1_str_default(self):
        assert settings.API_V1_STR == "/api/v1"

    def test_access_token_expire_minutes(self):
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 60 * 24 * 8

    def test_secret_key_is_string(self):
        assert isinstance(settings.SECRET_KEY, str)

    def test_secret_key_not_empty(self):
        assert len(settings.SECRET_KEY) > 0

    def test_environment_is_valid_literal(self):
        assert settings.ENVIRONMENT in ("local", "staging", "production")

    def test_sqlalchemy_database_uri_starts_with_postgresql(self):
        uri = str(settings.SQLALCHEMY_DATABASE_URI)
        assert uri.startswith("postgresql+psycopg")

    def test_all_cors_origins_includes_frontend_host(self):
        origins = settings.all_cors_origins
        assert settings.FRONTEND_HOST in origins

    def test_emails_enabled_false_when_no_smtp(self):
        """Default settings don't configure SMTP → emails disabled."""
        if not settings.SMTP_HOST:
            assert settings.emails_enabled is False

    def test_etl_scheduler_settings_exist(self):
        assert isinstance(settings.ETL_SCHEDULER_ENABLED, bool)
        assert isinstance(settings.ETL_SCHEDULER_INTERVAL_SECONDS, int)
