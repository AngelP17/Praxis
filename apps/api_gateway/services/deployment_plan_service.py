import uuid
from datetime import datetime
from sqlalchemy.orm import Session


class DeploymentPlanService:
    def __init__(self, db: Session):
        self.db = db

    def create_plan(self, payload: dict) -> dict:
        plan_id = f"dp_{uuid.uuid4().hex[:12]}"
        timeline_weeks = payload.get("timeline_weeks", 8)
        return {
            "plan_id": plan_id,
            "solution_pack_id": payload.get("solution_pack_id", ""),
            "value_case_id": payload.get("value_case_id"),
            "phases": self._generate_phases(timeline_weeks),
            "timeline_weeks": timeline_weeks,
            "created_at": datetime.utcnow(),
        }

    def get_plan(self, plan_id: str) -> dict:
        return {
            "plan_id": plan_id,
            "solution_pack_id": "manufacturing-printer-gpo",
            "value_case_id": None,
            "phases": self._generate_phases(8),
            "timeline_weeks": 8,
            "created_at": datetime.utcnow(),
        }

    def get_risks(self, plan_id: str) -> dict:
        return {
            "plan_id": plan_id,
            "risks": [
                {
                    "risk": "Data quality",
                    "severity": "medium",
                    "mitigation": "Use Ontology Compiler confidence scoring",
                },
                {
                    "risk": "Production access",
                    "severity": "low",
                    "mitigation": "FieldLab local simulation first",
                },
                {
                    "risk": "Stakeholder alignment",
                    "severity": "medium",
                    "mitigation": "Executive readout artifacts",
                },
                {
                    "risk": "Integration complexity",
                    "severity": "low",
                    "mitigation": "Adapter-based ingestion",
                },
            ],
            "overall_risk_level": "medium",
        }

    def get_security_review(self, plan_id: str) -> dict:
        return {
            "plan_id": plan_id,
            "security_posture": "Defensible",
            "compliance_checks": [
                {"standard": "SOC 2", "status": "aligns", "note": "Audit trails and replay hashes"},
                {"standard": "ISO 27001", "status": "aligns", "note": "Immutable event records"},
                {
                    "standard": "GDPR",
                    "status": "aligns",
                    "note": "No customer data persisted without consent",
                },
            ],
            "vulnerabilities": [],
            "recommendations": [
                "Run FieldLab in isolated Docker network",
                "Use TLS for all service-to-service communication in production",
                "Rotate API keys and review IAM policies regularly",
            ],
        }

    def _generate_phases(self, timeline_weeks: int) -> list[dict]:
        return [
            {
                "phase": 1,
                "name": "Discovery & Data Mapping",
                "weeks": 1,
                "deliverable": "Operational ontology",
            },
            {
                "phase": 2,
                "name": "FieldLab Simulation",
                "weeks": 2,
                "deliverable": "Local workflow validation",
            },
            {
                "phase": 3,
                "name": "Decision Pipeline Integration",
                "weeks": 2,
                "deliverable": "Working decision loop",
            },
            {
                "phase": 4,
                "name": "Value Case & Readout",
                "weeks": 1,
                "deliverable": "Executive summary",
            },
            {
                "phase": 5,
                "name": "Staged Production Rollout",
                "weeks": timeline_weeks - 6,
                "deliverable": "Production deployment",
            },
        ]
