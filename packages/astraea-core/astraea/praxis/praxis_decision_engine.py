from dataclasses import dataclass

from .causal_graph import CausalGraph
from .evidence_trust import Evidence, EvidenceTrustScorer
from .use_case_score import UseCaseScorer
from .value_of_information import ValueOfInformation


@dataclass
class PraxisDecision:
    priority_score: float
    evidence_trust: float
    next_best_questions: list[dict]
    value_case: dict
    requires_human_review: bool
    confidence: float = 0.7


class PraxisDecisionEngine:
    PRIORITY_WEIGHTS = {
        "operational_severity": 0.16,
        "business_process_criticality": 0.14,
        "customer_visible_impact": 0.13,
        "recurrence_risk": 0.12,
        "dependency_centrality": 0.10,
        "sla_exposure": 0.10,
        "stakeholder_urgency": 0.08,
        "actionability": 0.07,
        "expansion_relevance": 0.05,
        "evidence_trust": 0.05,
    }

    UNCERTAINTY_PENALTY = 0.10

    def __init__(self):
        self.evidence_scorer = EvidenceTrustScorer()
        self.use_case_scorer = UseCaseScorer()
        self.voi = ValueOfInformation()
        self.causal_graph = CausalGraph()

    def score(
        self, event: dict, ontology: dict = None, customer_context: dict = None
    ) -> PraxisDecision:
        if customer_context is None:
            customer_context = {}

        evidence = Evidence(
            source_reliability=event.get("source_reliability", 0.7),
            freshness=event.get("freshness", 0.8),
            corroboration=event.get("corroboration", 0.6),
            completeness=event.get("completeness", 0.7),
            consistency=event.get("consistency", 0.8),
            auditability=event.get("auditability", 0.7),
        )
        evidence_trust = self.evidence_scorer.score(evidence)

        asset_id = event.get("asset_id", event.get("asset", ""))
        centrality = self.causal_graph.dependency_centrality(asset_id, ontology)

        missing_fields = event.get("missing_fields", [])
        voi_questions = self.voi.rank(missing_fields, event, customer_context)

        use_case = event.get("use_case", {})
        value_case = self.use_case_scorer.score(use_case, customer_context)

        severity_score = float(event.get("severity_score", 0.5))
        business_criticality = float(event.get("business_process_criticality", 0.5))
        customer_impact = float(event.get("customer_visible_impact", 0.5))
        recurrence_risk = float(event.get("recurrence_risk", 0.3))
        sla_exposure = float(event.get("sla_exposure", 0.5))
        stakeholder_urgency = float(customer_context.get("stakeholder_urgency", 0.5))
        actionability = float(event.get("actionability", 0.5))
        expansion_relevance = float(value_case.get("score", 0.5))
        uncertainty_penalty = float(event.get("uncertainty_penalty", 0.0))

        priority = (
            sum(
                [
                    self.PRIORITY_WEIGHTS["operational_severity"] * severity_score,
                    self.PRIORITY_WEIGHTS["business_process_criticality"] * business_criticality,
                    self.PRIORITY_WEIGHTS["customer_visible_impact"] * customer_impact,
                    self.PRIORITY_WEIGHTS["recurrence_risk"] * recurrence_risk,
                    self.PRIORITY_WEIGHTS["dependency_centrality"] * centrality,
                    self.PRIORITY_WEIGHTS["sla_exposure"] * sla_exposure,
                    self.PRIORITY_WEIGHTS["stakeholder_urgency"] * stakeholder_urgency,
                    self.PRIORITY_WEIGHTS["actionability"] * actionability,
                    self.PRIORITY_WEIGHTS["expansion_relevance"] * expansion_relevance,
                    self.PRIORITY_WEIGHTS["evidence_trust"] * evidence_trust,
                ]
            )
            - self.UNCERTAINTY_PENALTY * uncertainty_penalty
        )

        priority = max(0.0, min(1.0, priority))
        priority = round(priority, 4)

        requires_review = self.requires_review(priority, evidence_trust)

        return PraxisDecision(
            priority_score=priority,
            evidence_trust=evidence_trust,
            next_best_questions=voi_questions,
            value_case=value_case,
            requires_human_review=requires_review,
            confidence=evidence_trust,
        )

    def requires_review(self, priority: float, evidence_trust: float) -> bool:
        if priority > 0.70:
            return True
        if evidence_trust < 0.65:
            return True
        return False
