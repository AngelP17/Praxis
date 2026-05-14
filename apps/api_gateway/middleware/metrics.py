"""Request metrics middleware for tracking API performance.

Tracks request durations, success/failure rates, and sends metrics to CloudWatch.
"""

import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to track request metrics and send to CloudWatch."""

    def __init__(self, app):
        super().__init__(app)
        self.metrics = defaultdict(lambda: {
            "count": 0,
            "total_duration_ms": 0.0,
            "min_duration_ms": float("inf"),
            "max_duration_ms": 0.0,
            "error_count": 0,
        })

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        path = request.url.path
        method = request.method

        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            key = f"{method} {path}"
            self.metrics[key]["count"] += 1
            self.metrics[key]["total_duration_ms"] += duration_ms
            self.metrics[key]["min_duration_ms"] = min(
                self.metrics[key]["min_duration_ms"], duration_ms
            )
            self.metrics[key]["max_duration_ms"] = max(
                self.metrics[key]["max_duration_ms"], duration_ms
            )

            # Send to CloudWatch if available
            cw = getattr(request.app.state, "cw_client", None)
            if cw:
                try:
                    cw.put_metric_data(
                        Namespace="Praxis/API",
                        MetricData=[{
                            "MetricName": f"{method.lower()}_{path.replace('/', '_')}_duration",
                            "Value": duration_ms,
                            "Unit": "Milliseconds",
                            "Timestamp": time.time(),
                        }]
                    )
                except Exception:
                    pass

            return response

        except Exception:
            key = f"{method} {path}"
            self.metrics[key]["error_count"] += 1
            raise

    def get_metrics_summary(self) -> dict:
        """Return current metrics summary."""
        return {
            key: {
                "count": m["count"],
                "avg_duration_ms": round(m["total_duration_ms"] / max(m["count"], 1), 2),
                "min_duration_ms": round(m["min_duration_ms"], 2) if m["min_duration_ms"] < float("inf") else 0,
                "max_duration_ms": round(m["max_duration_ms"], 2),
                "error_count": m["error_count"],
            }
            for key, m in self.metrics.items()
        }
