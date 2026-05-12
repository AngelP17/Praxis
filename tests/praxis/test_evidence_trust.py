from astraea.praxis.evidence_trust import EvidenceTrustScorer, Evidence


def test_perfect_evidence():
    ev = Evidence(1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
    scorer = EvidenceTrustScorer()
    assert scorer.score(ev) == 1.0


def test_low_evidence():
    ev = Evidence(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    scorer = EvidenceTrustScorer()
    assert scorer.score(ev) == 0.0


def test_score_from_dict():
    scorer = EvidenceTrustScorer()
    score = scorer.score_from_dict(
        {
            "source_reliability": 0.8,
            "freshness": 0.9,
            "corroboration": 0.7,
            "completeness": 0.6,
            "consistency": 0.8,
            "auditability": 0.9,
        }
    )
    assert 0.7 < score < 0.9


def test_requires_human_review():
    scorer = EvidenceTrustScorer()
    assert scorer.requires_human_review(0.5, 0.8) is True
    assert scorer.requires_human_review(0.8, 0.5) is False


def test_trust_level():
    scorer = EvidenceTrustScorer()
    assert scorer.trust_level(0.85) == "high"
    assert scorer.trust_level(0.7) == "medium"
    assert scorer.trust_level(0.4) == "low"
