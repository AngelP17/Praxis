from dataclasses import dataclass


@dataclass
class Evidence:
    source_reliability: float = 0.5
    freshness: float = 0.5
    corroboration: float = 0.5
    completeness: float = 0.5
    consistency: float = 0.5
    auditability: float = 0.5


class EvidenceTrustScorer:
    WEIGHTS = {
        "source_reliability": 0.25,
        "freshness": 0.20,
        "corroboration": 0.20,
        "completeness": 0.15,
        "consistency": 0.10,
        "auditability": 0.10,
    }

    def score(self, evidence: Evidence) -> float:
        return round(
            self.WEIGHTS["source_reliability"] * evidence.source_reliability
            + self.WEIGHTS["freshness"] * evidence.freshness
            + self.WEIGHTS["corroboration"] * evidence.corroboration
            + self.WEIGHTS["completeness"] * evidence.completeness
            + self.WEIGHTS["consistency"] * evidence.consistency
            + self.WEIGHTS["auditability"] * evidence.auditability,
            4,
        )

    def score_from_dict(self, evidence: dict) -> float:
        ev = Evidence(
            source_reliability=evidence.get("source_reliability", 0.5),
            freshness=evidence.get("freshness", 0.5),
            corroboration=evidence.get("corroboration", 0.5),
            completeness=evidence.get("completeness", 0.5),
            consistency=evidence.get("consistency", 0.5),
            auditability=evidence.get("auditability", 0.5),
        )
        return self.score(ev)

    def requires_human_review(self, trust_score: float, priority_score: float) -> bool:
        return trust_score < 0.65 or priority_score > 0.70

    def trust_level(self, score: float) -> str:
        if score >= 0.80:
            return "high"
        if score >= 0.60:
            return "medium"
        return "low"
