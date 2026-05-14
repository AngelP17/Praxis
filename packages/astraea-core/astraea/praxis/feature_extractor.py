"""Normalize messy FieldLab events into deterministic Praxis decision features."""

from __future__ import annotations

import re
from collections import Counter
from typing import Any

SEVERITY_SCORES = {
    "critical": 1.0,
    "high": 0.9,
    "medium": 0.6,
    "low": 0.3,
}


class EventFeatureExtractor:
    """Convert raw solution-pack signals into PraxisDecisionEngine inputs."""

    def extract(
        self,
        events: list[dict[str, Any]],
        scenario_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        scenario_context = scenario_context or {}
        sources = sorted({str(event.get("source", "unknown")) for event in events})
        event_types = [str(event.get("event_type", "")).lower() for event in events]
        metric_keys = self._metric_keys(events)
        business_metrics = [str(metric) for metric in scenario_context.get("business_metrics", [])]

        shipments_delayed = self._max_numeric(events, "shipments_delayed", "delayed_shipments")
        downtime_minutes = self._max_numeric(events, "downtime_minutes", "incident_minutes")
        blocked_orders = self._max_numeric(events, "blocked_orders")
        failed_requests = self._max_numeric(events, "failed_requests")

        impact_values = [shipments_delayed, downtime_minutes, blocked_orders, failed_requests]
        has_customer_impact = any(value > 0 for value in impact_values)
        recurrence_count = sum(
            1 for event_type in event_types if event_type.startswith("recurrence")
        )
        has_vendor_escalation = any(
            "vendor_escalation" in event_type for event_type in event_types
        )
        has_support_escalation = any(
            "support_escalation" in event_type for event_type in event_types
        )
        has_root_cause = any(event.get("finding") for event in events)
        has_workaround = any(
            "workaround" in event_type or "override" in event_type for event_type in event_types
        )
        severity_score = self._severity_score(events)
        root_cause = self._root_cause_hypothesis(events, scenario_context)
        missing_fields = sorted(metric for metric in business_metrics if metric not in metric_keys)
        asset_id = self._most_referenced(events, "asset")

        business_impact = max(
            min(shipments_delayed / 5, 1.0),
            min(downtime_minutes / 60, 1.0),
            min(blocked_orders / 50, 1.0),
            min(failed_requests / 15000, 1.0),
        )
        source_coverage = min(
            len(sources) / max(len(scenario_context.get("systems", [])) or 1, 1), 1.0
        )

        customer_impact = business_impact if has_customer_impact else 0.35
        sla_exposure = (
            0.82 if has_vendor_escalation else 0.72 if has_support_escalation else 0.42
        )
        actionability = (
            0.88 if has_root_cause and has_workaround else 0.74 if has_root_cause else 0.52
        )
        completeness = (
            0.78 if not missing_fields else max(0.55, 0.82 - 0.06 * len(missing_fields))
        )

        signal = {
            "severity_score": round(severity_score, 4),
            "business_process_criticality": round(max(0.5, business_impact), 4),
            "customer_visible_impact": round(max(0.45, customer_impact), 4),
            "recurrence_risk": round(min(0.35 + 0.22 * recurrence_count, 0.95), 4),
            "sla_exposure": sla_exposure,
            "actionability": actionability,
            "source_reliability": round(0.62 + 0.28 * source_coverage, 4),
            "freshness": 0.91,
            "corroboration": round(min(0.45 + 0.05 * len(sources), 0.9), 4),
            "completeness": round(completeness, 4),
            "consistency": 0.78,
            "auditability": 0.88 if any(source == "praxis" for source in sources) else 0.72,
            "missing_fields": missing_fields,
            "asset_id": asset_id,
            "root_cause_hypothesis": root_cause,
            "recommended_action": self._recommended_action(root_cause, has_root_cause),
            "use_case": self._use_case(events, business_impact, source_coverage, recurrence_count),
            "metrics_observed": {
                key: self._max_numeric(events, key) for key in sorted(metric_keys)
            },
        }
        return signal

    def _severity_score(self, events: list[dict[str, Any]]) -> float:
        scores = [
            SEVERITY_SCORES.get(str(event.get("severity", "")).lower(), 0.5)
            for event in events
        ]
        if not scores:
            return 0.5
        # Bias toward the worst field signal while keeping corroborating volume deterministic.
        return min(max(scores) * 0.75 + (sum(scores) / len(scores)) * 0.25, 1.0)

    def _metric_keys(self, events: list[dict[str, Any]]) -> set[str]:
        keys: set[str] = set()
        for event in events:
            for key, value in event.items():
                if isinstance(value, int | float) and not isinstance(value, bool):
                    keys.add(key)
        return keys

    def _max_numeric(self, events: list[dict[str, Any]], *keys: str) -> float:
        values: list[float] = []
        for event in events:
            for key in keys:
                value = event.get(key)
                if isinstance(value, int | float) and not isinstance(value, bool):
                    values.append(float(value))
        return max(values) if values else 0.0

    def _most_referenced(self, events: list[dict[str, Any]], key: str) -> str:
        values = [str(event.get(key, "")) for event in events if event.get(key)]
        if not values:
            return ""
        counts = Counter(values)
        return sorted(counts.items(), key=lambda item: (-item[1], item[0]))[0][0]

    def _root_cause_hypothesis(
        self,
        events: list[dict[str, Any]],
        scenario_context: dict[str, Any],
    ) -> str:
        for event in events:
            finding = event.get("finding")
            if finding:
                summary = re.split(
                    r"\s+[—-]\s+| between | increased | caused ",
                    str(finding),
                    maxsplit=1,
                )[0]
                return self._slugify(summary)
        pain = (
            scenario_context.get("primary_pain")
            or scenario_context.get("target_outcome")
            or "unknown cause"
        )
        return self._slugify(str(pain))

    def _slugify(self, value: str) -> str:
        value = value.lower()
        value = value.replace("gpo", "")
        value = re.sub(r"[^a-z0-9]+", "_", value)
        value = re.sub(r"_+", "_", value).strip("_")
        stopwords = {
            "and",
            "not",
            "the",
            "a",
            "an",
            "to",
            "from",
            "with",
            "between",
            "in",
            "during",
            "caused",
            "causes",
            "group",
        }
        parts = [part for part in value.split("_") if part and part not in stopwords]
        return "_".join(parts[:12]) or "unknown_root_cause"

    def _recommended_action(self, root_cause: str, has_root_cause: bool) -> str:
        if not has_root_cause:
            return "acknowledge_incident"
        if "vendor" in root_cause or "sla" in root_cause:
            return "request_vendor_support"
        return "approve_remediation"

    def _use_case(
        self,
        events: list[dict[str, Any]],
        business_impact: float,
        source_coverage: float,
        recurrence_count: int,
    ) -> dict[str, float]:
        event_count = len(events)
        return {
            "pain_intensity": round(max(0.5, business_impact), 4),
            "data_readiness": round(max(0.45, source_coverage), 4),
            "stakeholder_urgency": round(min(0.55 + 0.05 * recurrence_count, 0.9), 4),
            "workflow_writeback_potential": 0.55,
            "measurable_value": round(max(0.5, business_impact), 4),
            "deployability": 0.78 if event_count >= 6 else 0.58,
            "security_feasibility": 0.72,
            "expansion_leverage": 0.7,
            "differentiation": 0.74,
        }
