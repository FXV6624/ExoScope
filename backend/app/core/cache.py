from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import Redis as SyncRedis
from redis.asyncio import Redis

from app.core.config import settings

redis: Redis | None = None


async def init_cache() -> None:
    global redis

    redis = Redis.from_url(
        "redis://redis:6379",
    )

    FastAPICache.init(
        RedisBackend(redis),
        prefix="exoplanets-cache",
    )


async def close_cache() -> None:
    global redis

    if redis is not None:
        await redis.close()


async def clear_cache() -> None:
    if redis is None:
        return

    async for key in redis.scan_iter(b"exoplanets-cache*"):
        await redis.delete(key)


def clear_cache_sync() -> None:
    redis_sync = SyncRedis.from_url(settings.REDIS_URL)

    try:
        for key in redis_sync.scan_iter("exoplanets-cache*"):
            redis_sync.delete(key)
    finally:
        redis_sync.close()
