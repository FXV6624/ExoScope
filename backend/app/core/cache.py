import asyncio

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis.asyncio import Redis

redis: Redis | None = None


async def init_cache() -> None:
    global redis

    redis = Redis.from_url(
        "redis://redis:6379",
        encoding="utf-8",
        decode_responses=True,
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

    async for key in redis.scan_iter("exoplanets-cache*"):
        await redis.delete(key)

def clear_cache_sync() -> None:
    asyncio.run(clear_cache())
