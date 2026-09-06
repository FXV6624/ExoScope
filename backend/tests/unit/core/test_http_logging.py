from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI, Request, Response

from app.core.http_logging import setup_http_logging


@pytest.mark.anyio
async def test_http_logging_middleware_success():
    app = FastAPI()
    setup_http_logging(app)

    # Grab the middleware function
    middleware_fn = app.user_middleware[0].kwargs["dispatch"]

    request = MagicMock(spec=Request)
    request.method = "GET"
    request.url.path = "/test"
    request.client.host = "127.0.0.1"

    response = Response(content="ok", status_code=200)
    call_next = AsyncMock(return_value=response)

    res = await middleware_fn(request, call_next)
    assert res.status_code == 200
    assert "X-Request-ID" in res.headers


@pytest.mark.anyio
async def test_http_logging_middleware_server_error():
    app = FastAPI()
    setup_http_logging(app)

    middleware_fn = app.user_middleware[0].kwargs["dispatch"]

    request = MagicMock(spec=Request)
    request.method = "GET"
    request.url.path = "/error"
    request.client = None

    response = Response(content="server error", status_code=500)
    call_next = AsyncMock(return_value=response)

    res = await middleware_fn(request, call_next)
    assert res.status_code == 500


@pytest.mark.anyio
async def test_http_logging_middleware_unhandled_exception():
    app = FastAPI()
    setup_http_logging(app)

    middleware_fn = app.user_middleware[0].kwargs["dispatch"]

    request = MagicMock(spec=Request)
    request.method = "GET"
    request.url.path = "/crash"

    call_next = AsyncMock(side_effect=RuntimeError("unexpected crash"))

    with pytest.raises(RuntimeError, match="unexpected crash"):
        await middleware_fn(request, call_next)
