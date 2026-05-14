import time
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from apps.api_gateway.config import settings
from apps.api_gateway.logging_config import get_logger

logger = get_logger("rate_limiter")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter: requests per minute per client IP.

    Only rate-limits mutating requests (POST, PUT, PATCH, DELETE).
    GET, HEAD, and OPTIONS requests pass through without counting.
    """

    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    def __init__(self, app, max_requests: int = None):
        super().__init__(app)
        self.max_requests = max_requests or settings.RATE_LIMIT_PER_MINUTE
        self._requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.method not in self.MUTATING_METHODS:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - 60

        self._requests[client_ip] = [ts for ts in self._requests[client_ip] if ts > window_start]

        if len(self._requests[client_ip]) >= self.max_requests:
            logger.warning(
                "rate_limit_exceeded",
                client_ip=client_ip,
                path=request.url.path,
                limit=self.max_requests,
            )
            return Response(
                content='{"detail":"Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        self._requests[client_ip].append(now)
        return await call_next(request)
