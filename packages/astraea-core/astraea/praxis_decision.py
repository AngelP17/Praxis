from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AstraeaDecision:
    severity_score: float
    urgency_score: float
    business_impact_score: float
    sla_risk_score: float
    recurrence_score: float
    dependency_criticality_score: float
    actionability_score: float
    uncertainty_penalty: float
    priority_score: float
    root_cause_hypothesis: str
    confidence_score: float
    risk_level: str
    requires_human_review: bool
    recommendation: str
    rationale: dict[str, Any]
    policy_version: str = "astraea-operational-resilience-v1"


def decide(
    event: dict[str, Any],
    blast_radius: list[dict[str, Any]],
    policy: dict[str, Any],
) -> AstraeaDecision:
    normalized = event.get("normalized_payload") or event.get("data") or event
    severity = str(event.get("severity") or normalized.get("severity") or "low").lower()

    severity_score = {
        "low": 0.25,
        "medium": 0.5,
        "high": 0.75,
        "critical": 0.95,
    }.get(severity, 0.25)

    impacted_critical_assets = [
        item
        for item in blast_radius
        if str(item.get("criticality", "")).lower() in {"high", "critical"}
    ]
    dependency_criticality_score = min(1.0, 0.2 + (len(impacted_critical_assets) * 0.2))
    business_impact_score = min(1.0, 0.35 + dependency_criticality_score * 0.55)
    urgency_score = 0.85 if severity in {"high", "critical"} else 0.45
    sla_risk_score = 0.75 if impacted_critical_assets else 0.35
    recurrence_score = 0.25
    actionability_score = 0.8
    conf_val = normalized.get("confidence")
    if conf_val is None:
        conf_val = 0.75
    else:
        conf_val = float(conf_val)

    uncertainty_penalty = 0.05 if conf_val >= 0.8 else 0.15

    scores = [
        severity_score,
        urgency_score,
        business_impact_score,
        sla_risk_score,
        recurrence_score,
        dependency_criticality_score,
        actionability_score,
    ]
    priority_score = round((sum(scores) / len(scores)) - uncertainty_penalty, 4)

    if priority_score >= 0.8:
        risk_level = "critical"
    elif priority_score >= 0.65:
        risk_level = "high"
    elif priority_score >= 0.45:
        risk_level = "medium"
    else:
        risk_level = "low"

    asset_id = normalized.get("asset_id") or event.get("asset_id") or "unknown_asset"

    return AstraeaDecision(
        severity_score=severity_score,
        urgency_score=urgency_score,
        business_impact_score=business_impact_score,
        sla_risk_score=sla_risk_score,
        recurrence_score=recurrence_score,
        dependency_criticality_score=dependency_criticality_score,
        actionability_score=actionability_score,
        uncertainty_penalty=uncertainty_penalty,
        priority_score=priority_score,
        root_cause_hypothesis=f"{asset_id}_operational_dependency_disruption",
        confidence_score=conf_val,
        risk_level=risk_level,
        requires_human_review=True,
        recommendation="Validate asset status, notify site owner, and queue remediation workflow.",
        rationale={
            "asset_id": asset_id,
            "severity": severity,
            "blast_radius_count": len(blast_radius),
            "impacted_assets": blast_radius,
            "policy": policy,
        },
    )
