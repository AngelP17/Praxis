import asyncio
import inspect
from datetime import datetime, timedelta, timezone
from functools import wraps
import threading
from typing import Any, Callable, Dict, Optional, Tuple

class SimpleTTLCache:
    def __init__(self):
        self._cache: Dict[str, Tuple[Any, datetime]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._cache:
                return None
            val, expiry = self._cache[key]
            if datetime.now(timezone.utc) > expiry:
                del self._cache[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        expiry = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        with self._lock:
            self._cache[key] = (value, expiry)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

global_cache = SimpleTTLCache()

def cache_response(ttl_seconds: int = 300):
    """Decorator to cache the response of a function with a specified TTL."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            # Create a stable cache key
            key = f"{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            cached = global_cache.get(key)
            if cached is not None:
                return cached
            
            if inspect.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
                
            global_cache.set(key, result, ttl_seconds)
            return result

        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            key = f"{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            cached = global_cache.get(key)
            if cached is not None:
                return cached
            
            result = func(*args, **kwargs)
            global_cache.set(key, result, ttl_seconds)
            return result

        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    return decorator
