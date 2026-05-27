import time
from collections import defaultdict
from fastapi import Request, Response
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware

from apps.api_gateway.config import settings
from apps.api_gateway.logging_config import get_logger
from apps.api_gateway.services.auth_service import ALGORITHM

logger = get_logger("rate_limiter")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter for mutating requests.

    Authenticated requests are keyed by JWT subject first. Anonymous or invalid
    requests fall back to client IP so public mutation endpoints remain bounded.
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
        identity_key = self._identity_key(request) or f"ip:{client_ip}"
        now = time.time()
        window_start = now - 60

        self._requests[identity_key] = [ts for ts in self._requests[identity_key] if ts > window_start]

        if len(self._requests[identity_key]) >= self.max_requests:
            logger.warning(
                "rate_limit_exceeded",
                client_ip=client_ip,
                identity_key=identity_key,
                path=request.url.path,
                limit=self.max_requests,
            )
            return Response(
                content='{"detail":"Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        self._requests[identity_key].append(now)
        return await call_next(request)

    def _identity_key(self, request: Request) -> str | None:
        header = request.headers.get("authorization", "")
        scheme, _, token = header.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return None
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
        username = payload.get("sub")
        if not username:
            return None
        return f"user:{username}"
