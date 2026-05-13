"""Rate-limit middleware for /api/proofs endpoints.

Simple in-memory rate limiter using a sliding window.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


@dataclass
class WindowBucket:
    window_start: float
    count: int


class ProofRateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._buckets: dict[str, WindowBucket] = {}

    def _client_key(self, request: Request) -> str:
        api_key = request.headers.get("x-praxis-key", "")
        if api_key:
            return f"key:{api_key}"
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        host = request.client.host if request.client else "unknown"
        return f"ip:{host}"

    def allow(self, request: Request) -> tuple[bool, int]:
        now = time.monotonic()
        key = self._client_key(request)
        bucket = self._buckets.get(key)

        if bucket is None or (now - bucket.window_start) > self.window_seconds:
            self._buckets[key] = WindowBucket(window_start=now, count=1)
            return True, self.max_requests - 1

        if bucket.count >= self.max_requests:
            return False, 0

        bucket.count += 1
        return True, self.max_requests - bucket.count


_rate_limiter = ProofRateLimiter()


class ProofRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not request.url.path.startswith("/api/proofs"):
            return await call_next(request)

        allowed, remaining = _rate_limiter.allow(request)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "Too many proof requests. Try again shortly.",
                    "retry_after_seconds": 60,
                },
                headers={"Retry-After": "60"},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Limit"] = str(_rate_limiter.max_requests)
        return response
