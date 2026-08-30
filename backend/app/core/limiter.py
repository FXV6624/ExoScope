import logging

from fastapi import Request
from redis import Redis as SyncRedis
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

logger = logging.getLogger("app.core.limiter")


def get_real_client_ip(request: Request) -> str:
    """
    Extract real client IP considering reverse proxy headers (Traefik, NGINX, Cloudflare).
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return get_remote_address(request)


storage_uri = settings.REDIS_URL
try:
    _r = SyncRedis.from_url(settings.REDIS_URL, socket_connect_timeout=0.5)
    _r.ping()
    _r.close()
except Exception:
    logger.warning(
        "Redis is unreachable at %s. Limiter falling back to in-memory storage.",
        settings.REDIS_URL,
    )
    storage_uri = "memory://"

limiter = Limiter(
    key_func=get_real_client_ip,
    storage_uri=storage_uri,
    key_prefix="exoplanet-api",
    default_limits=["200/minute"],
)
