import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from prometheus_client import Counter, Histogram

# Initialize Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests received",
    ["method", "path", "status_code"],
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware to track request durations and HTTP status codes via Prometheus client."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method
        
        # Don't track scrapings of the /metrics endpoint itself to avoid noise
        if path == "/metrics":
            return await call_next(request)

        start_time = time.time()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception:
            status_code = 500
            raise
        finally:
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, path=path, status_code=status_code).inc()
            REQUEST_LATENCY.labels(method=method, path=path).observe(duration)
