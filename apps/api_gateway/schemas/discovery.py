from typing import Any
from pydantic import BaseModel


class DiscoveryRequest(BaseModel):
    customer_signals: list[dict[str, Any]]
    adapter_profile: str = "generic"
    customer_context: dict[str, Any] = {}


class DiscoveryResponse(BaseModel):
    object_candidates: list[dict[str, Any]]
    inferred_links: list[dict[str, Any]]
    mapping_confidence: float
    next_best_questions: list[dict[str, Any]]
    recommended_solution_pack: str
