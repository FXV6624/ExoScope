"""Unit tests for services/users.py (with mocked DB)."""

import uuid
from unittest.mock import MagicMock, patch

from app.models import User
from app.services import users as user_service
from app.services.users import DUMMY_HASH


def _make_user(email="test@example.com", active=True, hashed="$argon2id$fake"):
    user = MagicMock(spec=User)
    user.id = uuid.uuid4()
    user.email = email
    user.is_active = active
    user.hashed_password = hashed
    return user


class TestAuthenticateUser:
    def test_returns_none_when_user_not_found(self):
        session = MagicMock()
        with (
            patch("app.services.users.get_user_by_email", return_value=None),
            patch(
                "app.services.users.verify_password", return_value=(False, None)
            ) as mock_verify,
        ):
            result = user_service.authenticate_user(session, "noone@x.com", "password")
            assert result is None
            # Timing attack prevention: verify_password MUST be called even when user not found
            mock_verify.assert_called_once_with("password", DUMMY_HASH)

    def test_returns_none_when_wrong_password(self):
        user = _make_user()
        session = MagicMock()
        with (
            patch("app.services.users.get_user_by_email", return_value=user),
            patch("app.services.users.verify_password", return_value=(False, None)),
        ):
            result = user_service.authenticate_user(session, user.email, "wrongpass")
            assert result is None

    def test_returns_user_when_correct_password(self):
        user = _make_user()
        session = MagicMock()
        with (
            patch("app.services.users.get_user_by_email", return_value=user),
            patch("app.services.users.verify_password", return_value=(True, None)),
        ):
            result = user_service.authenticate_user(session, user.email, "correctpass")
            assert result is user

    def test_updates_hash_when_rehash_needed(self):
        user = _make_user()
        session = MagicMock()
        new_hash = "$argon2id$new_hash"
        with (
            patch("app.services.users.get_user_by_email", return_value=user),
            patch("app.services.users.verify_password", return_value=(True, new_hash)),
            patch("app.services.users.update_user") as mock_update,
        ):
            result = user_service.authenticate_user(session, user.email, "pass")
            mock_update.assert_called_once()
            assert result is user


class TestGetUser:
    def test_delegates_to_repository(self):
        session = MagicMock()
        with patch(
            "app.services.users.get_user_by_email", return_value=None
        ) as mock_get:
            result = user_service.get_user(session, "x@x.com")
            mock_get.assert_called_once_with(session, "x@x.com")
            assert result is None


class TestUpdatePassword:
    def test_hashes_and_updates(self):
        user = _make_user()
        session = MagicMock()
        new_hash = "$argon2id$newhash"
        with (
            patch(
                "app.services.users.get_password_hash", return_value=new_hash
            ) as mock_hash,
            patch("app.services.users.update_user", return_value=user) as mock_update,
        ):
            user_service.update_password(session, user, "newpassword123")
            mock_hash.assert_called_once_with("newpassword123")
            mock_update.assert_called_once()


class TestDeleteUser:
    def test_deletes_and_commits(self):
        user = _make_user()
        session = MagicMock()
        user_service.delete_user(session, user)
        session.delete.assert_called_once_with(user)
        session.commit.assert_called_once()
