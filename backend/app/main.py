from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.cache import close_cache, init_cache
from app.core.config import settings
from app.core.http_logging import setup_http_logging
from app.core.limiter import limiter
from app.core.monitoring import setup_monitoring
from app.scheduler.scheduler import start_scheduler, stop_scheduler


def custom_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return route.name


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(
        dsn=str(settings.SENTRY_DSN),
        enable_tracing=True,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    await init_cache()
    start_scheduler()
    try:
        yield
    finally:
        stop_scheduler()
        await close_cache()


tags_metadata = [
    {
        "name": "login",
        "description": "Authentication and password recovery operations.",
    },
    {
        "name": "users",
        "description": "User management, profiles, and administration.",
    },
    {
        "name": "exoplanets",
        "description": "Exoplanet catalogue queries, multidimensional filtering, and analytical statistics.",
    },
    {
        "name": "etl",
        "description": "Data ingestion pipeline execution and execution run history.",
    },
    {
        "name": "exports",
        "description": "Data export services in multiple formats (CSV, JSON, Parquet).",
    },
    {
        "name": "scheduler",
        "description": "Background task scheduling and automated ETL pipeline control.",
    },
    {
        "name": "utils",
        "description": "System utilities, cache management, and health checks.",
    },
]

if settings.ENVIRONMENT == "local":
    tags_metadata.append(
        {
            "name": "private",
            "description": "Local development and testing endpoints.",
        }
    )

app = FastAPI(
    lifespan=lifespan,
    title=settings.PROJECT_NAME,
    description=(
        "RESTful API for the Data Engineering Platform, providing automated NASA exoplanet "
        "data ingestion, physical property enrichment, multi-criteria exploration, and dataset exports."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    openapi_tags=tags_metadata,
    generate_unique_id_function=custom_generate_unique_id,
)

setup_monitoring(app)
setup_http_logging(app)

app.state.limiter = limiter


def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    response = JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"},
    )
    if hasattr(request.state, "view_rate_limit"):
        response = request.app.state.limiter._inject_headers(
            response, request.state.view_rate_limit
        )
    return response


app.add_exception_handler(RateLimitExceeded, rate_limit_handler)  # type: ignore

app.add_middleware(SlowAPIMiddleware)

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.middleware("http")
async def disable_client_browser_cache(request: Request, call_next):  # type: ignore[no-untyped-def]
    response = await call_next(request)
    if request.url.path.startswith(settings.API_V1_STR):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


app.include_router(api_router, prefix=settings.API_V1_STR)
