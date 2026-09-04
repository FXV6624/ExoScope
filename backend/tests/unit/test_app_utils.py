from unittest.mock import MagicMock, patch

from app.core.config import settings
from app.utils import (
    generate_new_account_email,
    generate_password_reset_token,
    generate_reset_password_email,
    generate_test_email,
    send_email,
    verify_password_reset_token,
)


def test_generate_test_email():
    data = generate_test_email("test@example.com")
    assert "Test email" in data.subject
    assert "test@example.com" in data.html_content


def test_generate_reset_password_email():
    data = generate_reset_password_email(
        "user@example.com", "user@example.com", "fake-token-123"
    )
    assert "Password recovery" in data.subject
    assert "fake-token-123" in data.html_content


def test_generate_new_account_email():
    data = generate_new_account_email("new@example.com", "newuser", "secretpass")
    assert "New account" in data.subject
    assert "newuser" in data.html_content
    assert "secretpass" in data.html_content


def test_password_reset_token_valid():
    email = "someone@example.com"
    token = generate_password_reset_token(email)
    verified_email = verify_password_reset_token(token)
    assert verified_email == email


def test_password_reset_token_invalid():
    assert verify_password_reset_token("completely-invalid-jwt-token") is None


def test_send_email():
    with patch("emails.Message") as mock_msg_cls:
        mock_msg = MagicMock()
        mock_msg_cls.return_value = mock_msg

        with (
            patch.object(settings, "SMTP_HOST", "mailcatcher"),
            patch.object(settings, "SMTP_PORT", 1025),
            patch.object(settings, "SMTP_TLS", True),
            patch.object(settings, "SMTP_USER", "user"),
            patch.object(settings, "SMTP_PASSWORD", "pass"),
            patch.object(settings, "EMAILS_FROM_EMAIL", "noreply@example.com"),
        ):
            send_email(
                email_to="recipient@example.com",
                subject="Test Subject",
                html_content="<p>Test</p>",
            )
            mock_msg.send.assert_called_once()
