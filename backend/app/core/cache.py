import logging

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend
from redis import Redis as SyncRedis
from redis.asyncio import Redis

from app.core.config import settings

logger = logging.getLogger("app.core.cache")
redis: Redis | None = None

# Initialize FastAPICache immediately on import with InMemoryBackend
# so endpoints decorated with @cache never raise 'You must call init first!'
FastAPICache.init(
    InMemoryBackend(),
    prefix="exoplanets-cache",
)


async def init_cache() -> None:
    global redis

    try:
        redis = Redis.from_url(
            settings.REDIS_URL,
            socket_connect_timeout=1.0,
        )
        await redis.ping()
        FastAPICache.init(
            RedisBackend(redis),
            prefix="exoplanets-cache",
        )
        logger.info("FastAPICache initialized with Redis at %s", settings.REDIS_URL)
    except Exception as exc:
        logger.warning(
            "Could not connect to Redis (%s). Keeping InMemoryBackend: %s",
            settings.REDIS_URL,
            exc,
        )
        redis = None
        FastAPICache.init(
            InMemoryBackend(),
            prefix="exoplanets-cache",
        )


async def close_cache() -> None:
    global redis

    if redis is not None:
        try:
            await redis.close()
        except Exception:
            pass


async def clear_cache() -> None:
    # 1. Clear in-memory backend if active
    try:
        backend = FastAPICache.get_backend()
        if isinstance(backend, InMemoryBackend):
            backend._store.clear()
    except Exception as exc:
        logger.warning("Error clearing FastAPICache in-memory backend: %s", exc)

    # 2. Clear Redis backend
    if redis is not None:
        try:
            prefix = FastAPICache.get_prefix() or "exoplanets-cache"
            async for key in redis.scan_iter(f"{prefix}*".encode()):
                await redis.delete(key)
            async for key in redis.scan_iter(b"*exoplanet*"):
                await redis.delete(key)
        except Exception as exc:
            logger.warning("Error clearing Redis cache: %s", exc)


def clear_cache_sync() -> None:
    # 1. Clear in-memory backend if active
    try:
        backend = FastAPICache.get_backend()
        if isinstance(backend, InMemoryBackend):
            backend._store.clear()
    except Exception as exc:
        logger.warning("Error clearing FastAPICache in-memory backend: %s", exc)

    # 2. Clear Redis backend
    try:
        redis_sync = SyncRedis.from_url(settings.REDIS_URL, socket_connect_timeout=1.0)
        prefix = FastAPICache.get_prefix() or "exoplanets-cache"
        for key in redis_sync.scan_iter(f"{prefix}*"):
            redis_sync.delete(key)
        for key in redis_sync.scan_iter("*exoplanet*"):
            redis_sync.delete(key)
        redis_sync.close()
    except Exception as exc:
        logger.warning("Error clearing Redis cache sync: %s", exc)
