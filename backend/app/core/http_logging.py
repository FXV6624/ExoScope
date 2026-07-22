import logging
import time
import uuid
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

from app.core.request_context import request_id_ctx

logger = logging.getLogger(__name__)


def setup_http_logging(app: FastAPI) -> None:
    @app.middleware("http")
    async def log_requests(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = str(uuid.uuid4())[:8]
        request_id_ctx.set(request_id)

        start = time.perf_counter()

        try:
            response = await call_next(request)

        except Exception:
            logger.exception(
                "%s %s | Unhandled exception",
                request.method,
                request.url.path,
            )
            raise

        elapsed = (time.perf_counter() - start) * 1000

        client_ip = request.client.host if request.client else "unknown"

        status = response.status_code

        if status >= 500:
            log = logger.error
        elif status >= 400:
            log = logger.warning
        else:
            log = logger.info

        log(
            "%s %s | %s | %.2f ms | %s",
            request.method,
            request.url.path,
            status,
            elapsed,
            client_ip,
        )

        response.headers["X-Request-ID"] = request_id

        return response
