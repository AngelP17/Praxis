"""Structured logging middleware for API Gateway with CloudWatch integration."""

import json
import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logger = logging.getLogger(__name__)


class CloudWatchMiddleware(BaseHTTPMiddleware):
    """Middleware to add structured JSON logging and CloudWatch metrics."""

    def __init__(self, app, get_cw_client=None):
        super().__init__(app)
        self._get_cw_client = get_cw_client

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            log_entry = {
                "timestamp": time.time(),
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            }

            cw = self._get_cw_client() if self._get_cw_client else None
            if cw:
                try:
                    cw.put_metric_data(
                        Namespace="Praxis/API",
                        MetricData=[{
                            "MetricName": f"{request.method.lower()}_{request.url.path.replace('/', '_')}_duration",
                            "Value": duration_ms,
                            "Unit": "Milliseconds",
                            "Timestamp": time.time(),
                        }]
                    )
                except Exception:
                    pass

            print(json.dumps(log_entry))
            return response

        except Exception as e:
            logger.error(f"Request failed: {e}")
            raise
