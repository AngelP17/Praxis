from typing import Any
from pydantic import BaseModel


class OntologyCompileRequest(BaseModel):
    records: list[dict[str, Any]]
    adapter_profile: str = "generic"
    customer_context: dict[str, Any] = {}


class OntologyCompileResponse(BaseModel):
    object_types: list[dict[str, Any]]
    links: list[dict[str, Any]]
    actions: list[dict[str, Any]]
    confidence: float
    object_count: int


class OntologyObjectList(BaseModel):
    objects: list[dict[str, Any]]


class OntologyObjectDetail(BaseModel):
    object_key: str
    object_type: str
    display_name: str
    properties_json: dict[str, Any]
    source_refs_json: list[str]
    confidence: float


class OntologyLinkList(BaseModel):
    links: list[dict[str, Any]]


class OntologyActionList(BaseModel):
    actions: list[dict[str, Any]]


class OntologyActionSimulateRequest(BaseModel):
    target_object_key: str
    payload: dict[str, Any] = {}


class OntologyActionSimulateResponse(BaseModel):
    action_type: str
    mode: str
    requires_approval: bool
    result: dict[str, Any]
    audit_hash: str
