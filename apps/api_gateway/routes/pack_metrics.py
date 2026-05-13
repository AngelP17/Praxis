"""Per-pack metrics endpoint with in-memory ring buffer.

Provides:
    GET /api/metrics/packs — returns runs, p50/p95 latency, proof-validity
      rate over last N runs per solution pack.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

MAX_RUNS_PER_PACK = 50


@dataclass
class PackMetrics:
    total_runs: int = 0
    valid_proofs: int = 0
    total_latency_ms: float = 0.0
    latencies: list[float] = None

    def __post_init__(self):
        if self.latencies is None:
            self.latencies = []

    def record(self, latency_ms: float, valid: bool):
        self.total_runs += 1
        if valid:
            self.valid_proofs += 1
        self.total_latency_ms += latency_ms
        self.latencies.append(latency_ms)
        if len(self.latencies) > MAX_RUNS_PER_PACK:
            excess = self.latencies[:-MAX_RUNS_PER_PACK]
            self.latencies = self.latencies[-MAX_RUNS_PER_PACK:]
            self.total_latency_ms -= sum(excess)

    def p50_latency(self) -> float:
        if not self.latencies:
            return 0.0
        sorted_lat = sorted(self.latencies)
        mid = len(sorted_lat) // 2
        return sorted_lat[mid]

    def p95_latency(self) -> float:
        if not self.latencies:
            return 0.0
        idx = int(len(self.latencies) * 0.95)
        return sorted(self.latencies)[min(idx, len(self.latencies) - 1)]

    def validity_rate(self) -> float:
        if self.total_runs == 0:
            return 1.0
        return self.valid_proofs / self.total_runs


_pack_metrics: dict[str, PackMetrics] = defaultdict(PackMetrics)


def record_pack_run(pack_id: str, latency_ms: float, valid: bool):
    _pack_metrics[pack_id].record(latency_ms, valid)


@router.get("/packs")
async def get_pack_metrics():
    """Return per-pack metrics for all tracked solution packs."""
    result: dict[str, Any] = {}
    for pack_id, metrics in sorted(_pack_metrics.items()):
        result[pack_id] = {
            "total_runs": metrics.total_runs,
            "valid_proofs": metrics.valid_proofs,
            "validity_rate": round(metrics.validity_rate(), 3),
            "avg_latency_ms": round(
                metrics.total_latency_ms / max(metrics.total_runs, 1), 1
            ),
            "p50_latency_ms": round(metrics.p50_latency(), 1),
            "p95_latency_ms": round(metrics.p95_latency(), 1),
        }
    return {
        "packs": result,
        "tracked_packs": len(result),
        "max_runs_per_pack": MAX_RUNS_PER_PACK,
    }
