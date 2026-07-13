"""Unit tests for core.security module."""

from datetime import timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.security import (
    ALGORITHM,
    create_access_token,
    get_password_hash,
    verify_password,
)


class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token("user-123", timedelta(minutes=30))
        assert isinstance(token, str)

    def test_token_decodes_correctly(self):
        token = create_access_token("user-abc", timedelta(minutes=30))
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "user-abc"

    def test_token_has_exp_claim(self):
        token = create_access_token("user-abc", timedelta(minutes=30))
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_expired_token_raises(self):
        token = create_access_token("user-abc", timedelta(minutes=-1))
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

    def test_different_subjects_produce_different_tokens(self):
        t1 = create_access_token("user-1", timedelta(minutes=30))
        t2 = create_access_token("user-2", timedelta(minutes=30))
        assert t1 != t2

    def test_subject_coerced_to_string(self):
        import uuid

        uid = uuid.uuid4()
        token = create_access_token(uid, timedelta(minutes=30))
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == str(uid)


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = get_password_hash("mysecretpassword")
        assert hashed != "mysecretpassword"

    def test_verify_correct_password(self):
        password = "correcthorsebatterystaple"
        hashed = get_password_hash(password)
        verified, _ = verify_password(password, hashed)
        assert verified is True

    def test_verify_wrong_password(self):
        hashed = get_password_hash("correctpassword")
        verified, _ = verify_password("wrongpassword", hashed)
        assert verified is False

    def test_hash_is_different_each_time(self):
        """Hashes should use a unique salt each time."""
        h1 = get_password_hash("samepassword")
        h2 = get_password_hash("samepassword")
        assert h1 != h2

    def test_verify_returns_tuple(self):
        hashed = get_password_hash("password123")
        result = verify_password("password123", hashed)
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_verify_updated_hash_is_none_or_string(self):
        hashed = get_password_hash("password123")
        verified, updated = verify_password("password123", hashed)
        assert verified is True
        # updated hash is None if no rehash needed, or str if rehash happened
        assert updated is None or isinstance(updated, str)
