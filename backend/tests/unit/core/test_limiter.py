from unittest.mock import MagicMock

from fastapi import Request

from app.core.limiter import get_real_client_ip


def test_get_real_client_ip_x_forwarded_for():
    request = MagicMock(spec=Request)
    request.headers = {"x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178"}

    ip = get_real_client_ip(request)
    assert ip == "203.0.113.195"


def test_get_real_client_ip_x_real_ip():
    request = MagicMock(spec=Request)
    request.headers = {"x-real-ip": "198.51.100.1"}

    ip = get_real_client_ip(request)
    assert ip == "198.51.100.1"


def test_get_real_client_ip_fallback():
    request = MagicMock(spec=Request)
    request.headers = {}
    request.client.host = "127.0.0.1"

    ip = get_real_client_ip(request)
    assert ip == "127.0.0.1"
