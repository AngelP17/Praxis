from typing import Any

from pydantic import BaseModel, Field


class ProofCreateRequest(BaseModel):
    solution_pack: str = Field(default="manufacturing-printer-gpo")
    run_id: str | None = None
    events: list[dict[str, Any]] = Field(default_factory=list)
    customer_context: str = ""


class ProofResponse(BaseModel):
    proof_id: str
    run_id: str
    solution_pack: str
    customer_context_hash: str
    evidence: dict[str, Any]
    ontology: dict[str, Any]
    decision: dict[str, Any]
    action: dict[str, Any]
    value_case: dict[str, Any]
    replay: dict[str, Any]
    generated_at: str
    proof_hash: str


class ProofVerificationResponse(BaseModel):
    valid: bool
    status: str
    errors: list[str]
    proof_hash: str
