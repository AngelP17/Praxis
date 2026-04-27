from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from apps.api_gateway.deps import get_db

router = APIRouter()

PLATFORM_SERVICE_URL = "http://localhost:8080"


async def _proxy_platform(path: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PLATFORM_SERVICE_URL}{path}", timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Platform service error: {exc}")


@router.get("/summary")
async def platform_summary():
    return await _proxy_platform("/platform/summary")


@router.get("/slo")
async def platform_slo():
    return await _proxy_platform("/platform/slo")


@router.get("/incidents")
async def platform_incidents():
    return await _proxy_platform("/platform/incidents")


@router.get("/incidents/{incident_id}")
async def platform_incident_detail(incident_id: str):
    return await _proxy_platform(f"/platform/incidents/{incident_id}")


@router.get("/runbooks")
async def platform_runbooks():
    return await _proxy_platform("/platform/runbooks")


@router.get("/topology")
async def platform_topology():
    return await _proxy_platform("/platform/topology")


@router.get("/controls")
async def platform_controls():
    return await _proxy_platform("/platform/controls")


@router.post("/chaos/degraded")
async def platform_chaos_degraded():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{PLATFORM_SERVICE_URL}/platform/chaos/degraded", timeout=10.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Platform service error: {exc}")


@router.post("/chaos/reset")
async def platform_chaos_reset():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{PLATFORM_SERVICE_URL}/platform/chaos/reset", timeout=10.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Platform service error: {exc}")
