"""Floci health detail endpoint.

Provides:
    GET /health/floci
    Returns per-service status by querying Floci resources.
"""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

try:
    from services.fieldlab_service import FlociClient

    HAS_FLOCI = True
except ImportError:
    HAS_FLOCI = False


@router.get("/floci")
async def floci_health():
    """Return detailed Floci service health status."""
    if not HAS_FLOCI:
        return {
            "status": "unavailable",
            "message": "Floci service not configured",
            "services": {},
        }

    try:
        client = FlociClient(endpoint_url="http://localhost:4566")
        health = client.healthcheck()

        services = {}
        for svc in ["sqs", "s3", "dynamodb", "events"]:
            try:
                status = (
                    client.check_service(svc)
                    if hasattr(client, "check_service")
                    else {"status": "ok"}
                )
                services[svc] = {
                    "status": "healthy" if status.get("status") == "ok" else "degraded",
                    "endpoint": "http://localhost:4566",
                }
            except Exception:
                services[svc] = {"status": "unreachable", "endpoint": "http://localhost:4566"}

        return {
            "status": "healthy" if health.get("status") == "ok" else "degraded",
            "endpoint": "http://localhost:4566",
            "services": services,
        }
    except Exception as e:
        return {
            "status": "unreachable",
            "message": str(e),
            "endpoint": "http://localhost:4566",
            "services": {
                "sqs": {"status": "unknown"},
                "s3": {"status": "unknown"},
                "dynamodb": {"status": "unknown"},
                "events": {"status": "unknown"},
            },
        }
