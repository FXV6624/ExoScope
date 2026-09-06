from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend

import app.core.cache as cache_module


@pytest.mark.anyio
async def test_init_cache_success():
    mock_redis = AsyncMock()
    mock_redis.ping.return_value = True

    FastAPICache.reset()
    with (
        patch("app.core.cache.Redis.from_url", return_value=mock_redis),
        patch.object(FastAPICache, "init") as mock_cache_init,
    ):
        await cache_module.init_cache()
        assert cache_module.redis == mock_redis
        mock_cache_init.assert_called_once()
        assert isinstance(mock_cache_init.call_args[0][0], RedisBackend)


@pytest.mark.anyio
async def test_init_cache_redis_failure():
    FastAPICache.reset()
    with (
        patch(
            "app.core.cache.Redis.from_url",
            side_effect=Exception("Redis connection error"),
        ),
        patch.object(FastAPICache, "init") as mock_cache_init,
    ):
        await cache_module.init_cache()
        assert cache_module.redis is None
        mock_cache_init.assert_called_once()
        assert isinstance(mock_cache_init.call_args[0][0], InMemoryBackend)


@pytest.mark.anyio
async def test_close_cache():
    mock_redis = AsyncMock()
    cache_module.redis = mock_redis
    await cache_module.close_cache()
    mock_redis.close.assert_called_once()

    # When redis is None, shouldn't raise
    cache_module.redis = None
    await cache_module.close_cache()


@pytest.mark.anyio
async def test_clear_cache_in_memory():
    FastAPICache.reset()
    backend = InMemoryBackend()
    backend._store["key1"] = "val1"
    FastAPICache.init(backend)
    cache_module.redis = None

    await cache_module.clear_cache()
    assert len(backend._store) == 0


@pytest.mark.anyio
async def test_clear_cache_with_redis():
    mock_redis = AsyncMock()

    async def mock_scan_iter(_match):
        yield b"exoplanets-cache:1"
        yield b"exoplanets-cache:2"

    mock_redis.scan_iter = mock_scan_iter
    cache_module.redis = mock_redis

    await cache_module.clear_cache()
    assert mock_redis.delete.call_count >= 2


def test_clear_cache_sync():
    FastAPICache.reset()
    backend = InMemoryBackend()
    backend._store["key1"] = "val1"
    FastAPICache.init(backend)

    mock_sync_redis = MagicMock()
    mock_sync_redis.scan_iter.side_effect = [
        ["exoplanets-cache:1"],
        ["cached:exoplanet:2"],
    ]

    with patch("app.core.cache.SyncRedis.from_url", return_value=mock_sync_redis):
        cache_module.clear_cache_sync()
        assert len(backend._store) == 0
        mock_sync_redis.delete.assert_any_call("exoplanets-cache:1")
        mock_sync_redis.delete.assert_any_call("cached:exoplanet:2")
        mock_sync_redis.close.assert_called_once()


def test_clear_cache_sync_redis_exception():
    FastAPICache.reset()
    backend = InMemoryBackend()
    FastAPICache.init(backend)

    with patch(
        "app.core.cache.SyncRedis.from_url", side_effect=Exception("Redis down")
    ):
        # Should not raise exception, logs warning
        cache_module.clear_cache_sync()
