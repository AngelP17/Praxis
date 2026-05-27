"""OpenAPI response models for Praxis API documentation."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class TicketResponse(BaseModel):
    ticket_id: str = Field(..., description="Unique ticket identifier", json_schema_extra={"example": "IT-2024001"})
    title: str = Field(..., description="Ticket title", json_schema_extra={"example": "Printer GPO offline"})
    status: str = Field(..., description="Current status", json_schema_extra={"example": "open"})
    priority: str = Field(..., description="Priority level", json_schema_extra={"example": "high"})
    category: str | None = Field(None, description="Ticket category")
    assignee: str | None = Field(None, description="Assigned operator")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    requester: str | None = Field(None, description="Requester name")
    days_open: int = Field(..., description="Days since creation", json_schema_extra={"example": 3})


class IncidentResponse(BaseModel):
    incident_id: str = Field(..., description="Unique incident identifier", json_schema_extra={"example": "INC-2024001"})
    title: str = Field(..., description="Incident title")
    severity: str = Field(..., description="Severity level", json_schema_extra={"example": "high"})
    status: str = Field(..., description="Current status", json_schema_extra={"example": "investigating"})
    root_cause: str | None = Field(None, description="Root cause hypothesis")
    ticket_count: int = Field(..., description="Number of related tickets", json_schema_extra={"example": 5})
    created_at: datetime = Field(..., description="Creation timestamp")


class DecisionResponse(BaseModel):
    decision_id: int = Field(..., description="Unique decision identifier")
    event_id: str | None = Field(None, description="Related event ID")
    priority_score: float = Field(..., description="Priority score 0-1", ge=0, le=1, json_schema_extra={"example": 0.87})
    confidence_score: float = Field(..., description="Confidence score 0-1", ge=0, le=1, json_schema_extra={"example": 0.82})
    risk_level: str = Field(..., description="Risk level", json_schema_extra={"example": "high"})
    requires_human_review: bool = Field(..., description="Whether human approval required")
    replay_hash: str | None = Field(None, description="Deterministic replay hash")
    created_at: datetime = Field(..., description="Decision timestamp")


class EventResponse(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    source: str = Field(..., description="Event source", json_schema_extra={"example": "printer-telemetry"})
    type: str = Field(..., description="Event type", json_schema_extra={"example": "printer.offline"})
    subject: str | None = Field(None, description="Event subject")
    data: dict[str, Any] = Field(..., description="Event payload")
    replay_hash: str | None = Field(None, description="Deterministic replay hash")
    created_at: datetime = Field(..., description="Ingestion timestamp")


class ProofResponse(BaseModel):
    proof_id: str = Field(..., description="Unique proof identifier")
    run_id: str = Field(..., description="FieldLab run ID")
    solution_pack: str = Field(..., description="Solution pack ID")
    proof_hash: str = Field(..., description="SHA-256 proof hash")
    evidence_trust: float = Field(..., description="Evidence trust score 0-1", ge=0, le=1)
    priority_score: float = Field(..., description="Decision priority score", ge=0, le=1)
    annual_value: float = Field(..., description="Estimated annual value in USD")
    deterministic: bool = Field(..., description="Whether replay is deterministic")
    generated_at: datetime = Field(..., description="Proof generation timestamp")


class SolutionPackResponse(BaseModel):
    id: str = Field(..., description="Solution pack identifier", json_schema_extra={"example": "manufacturing-printer-gpo"})
    name: str = Field(..., description="Human-readable name", json_schema_extra={"example": "Manufacturing Printer GPO"})
    description: str | None = Field(None, description="Solution pack description")
    priority_score: float | None = Field(None, description="Priority score", ge=0, le=1)
    evidence_trust: float | None = Field(None, description="Evidence trust score", ge=0, le=1)


class FieldLabRunResponse(BaseModel):
    run_id: str = Field(..., description="Unique run identifier")
    pack_id: str = Field(..., description="Solution pack ID")
    status: str = Field(..., description="Run status", json_schema_extra={"example": "completed"})
    events_ingested: int = Field(..., description="Number of events ingested")
    proof_hash: str | None = Field(None, description="Generated proof hash")
    started_at: datetime = Field(..., description="Run start timestamp")
    completed_at: datetime | None = Field(None, description="Run completion timestamp")


class MetricsResponse(BaseModel):
    incident_count: int = Field(..., description="Total incidents")
    open_tickets: int = Field(..., description="Open ticket count")
    critical_tickets: int = Field(..., description="Critical ticket count")
    system_status: str = Field(..., description="System health status", json_schema_extra={"example": "healthy"})


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status", json_schema_extra={"example": "healthy"})
    version: str = Field(..., description="API version", json_schema_extra={"example": "2.0.0"})
    database: str = Field(..., description="Database connectivity", json_schema_extra={"example": "connected"})
    floci: str | None = Field(None, description="Floci service status")


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message", json_schema_extra={"example": "Not found"})


class PaginatedResponse(BaseModel):
    items: list[Any] = Field(..., description="List of items")
    total: int = Field(..., description="Total count")
    page: int = Field(..., description="Current page")
    page_size: int = Field(..., description="Items per page")
