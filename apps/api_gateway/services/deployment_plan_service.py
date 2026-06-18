import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from infrastructure.db.models.deployment_plan import DeploymentPlan


DEMO_PACK_IDS = [
    "manufacturing-printer-gpo",
    "network-edge-failover",
    "identity-onboarding-drift",
    "database-failover-lag",
]


def _row_to_dict(row: DeploymentPlan) -> dict:
    return {
        "plan_id": row.plan_id,
        "solution_pack_id": row.solution_pack_id,
        "value_case_id": row.value_case_id,
        "phases": row.phases_json or [],
        "timeline_weeks": row.timeline_weeks,
        "created_at": row.created_at,
    }


class DeploymentPlanService:
    """Durable deployment-plan store backed by the `deployment_plans` table.

    Deterministic demo plans are seeded into the database on first use; created
    plans persist across restarts instead of living in process memory.
    """

    def __init__(self, db: Session):
        self.db = db
        self._seed_deployment_plans()

    def _seed_deployment_plans(self) -> None:
        seeded = False
        for index, pack_id in enumerate(DEMO_PACK_IDS):
            plan_id = f"dp_demo_{pack_id}"
            if self.db.query(DeploymentPlan).filter_by(plan_id=plan_id).first():
                continue
            timeline_weeks = 7 + index
            self.db.add(
                DeploymentPlan(
                    plan_id=plan_id,
                    solution_pack_id=pack_id,
                    value_case_id=f"vc_demo_{pack_id}",
                    phases_json=self._generate_phases(timeline_weeks),
                    timeline_weeks=timeline_weeks,
                    created_at=datetime(2026, 5, 14, 15, 10 + index * 7),
                )
            )
            seeded = True
        if seeded:
            self.db.commit()

    def create_plan(self, payload: dict) -> dict:
        plan_id = f"dp_{uuid.uuid4().hex[:12]}"
        timeline_weeks = payload.get("timeline_weeks", 8)
        pack_id = payload.get("solution_pack_id", "unknown")
        row = DeploymentPlan(
            plan_id=plan_id,
            solution_pack_id=pack_id,
            value_case_id=payload.get("value_case_id"),
            phases_json=self._generate_phases(timeline_weeks),
            timeline_weeks=timeline_weeks,
            created_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        return _row_to_dict(row)

    def get_plan(self, plan_id: str) -> dict:
        row = self.db.query(DeploymentPlan).filter_by(plan_id=plan_id).first()
        if row is not None:
            return _row_to_dict(row)

        pack_id = "unknown"
        for p in DEMO_PACK_IDS:
            if p in plan_id:
                pack_id = p
                break
        row = DeploymentPlan(
            plan_id=plan_id,
            solution_pack_id=pack_id,
            value_case_id=None if pack_id == "unknown" else f"vc_demo_{pack_id}",
            phases_json=self._generate_phases(8),
            timeline_weeks=8,
            created_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        return _row_to_dict(row)

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
        rollout_weeks = max(1, timeline_weeks - 6)
        return [
            {
                "phase": 1,
                "name": "Discovery and Data Mapping",
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
                "name": "Value Case and Readout",
                "weeks": 1,
                "deliverable": "Executive summary",
            },
            {
                "phase": 5,
                "name": "Staged Production Rollout",
                "weeks": rollout_weeks,
                "deliverable": "Production deployment",
            },
        ]
