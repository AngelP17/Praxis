# Praxis Proof Object Spec

## What is a proof object?

A Praxis proof object is a deterministic, verifiable artifact that connects raw operational evidence to a business value case. It is the flagship technical differentiator of the Praxis platform.

> Praxis does not just output recommendations. It outputs verifiable proof objects that connect raw events to business value.

## Proof object shape

```json
{
  "proof_id": "proof_praxis_manufacturing_printer_gpo_001",
  "run_id": "fieldlab_run_manufacturing-printer-gpo",
  "solution_pack": "manufacturing-printer-gpo",
  "customer_context_hash": "sha256:...",
  "evidence": {
    "raw_events": 12,
    "sources": ["operator_note", "print_server", "ticket_export", "msp_update"],
    "source_coverage": 0.86,
    "corroboration_score": 0.74,
    "freshness_score": 0.91,
    "evidence_trust": 0.82
  },
  "ontology": {
    "objects_created": 9,
    "links_created": 14,
    "actions_available": 5,
    "mapping_confidence": 0.79
  },
  "decision": {
    "root_cause_hypothesis": "printer_deployment_policy_drift",
    "priority_score": 0.84,
    "confidence": 0.76,
    "requires_human_review": true,
    "next_best_questions": [
      "How many shipping documents were delayed?",
      "Which users are mapped through GPO versus direct IP?"
    ]
  },
  "action": {
    "recommended_action": "validate_point_and_print_policy",
    "mode": "human_approval",
    "actor": "operator",
    "status": "approved",
    "action_log_hash": "sha256:..."
  },
  "value_case": {
    "estimated_annual_value": 38400,
    "confidence": 0.68,
    "primary_value_driver": "reduced triage and shipping delay"
  },
  "replay": {
    "replay_hash": "sha256:...",
    "deterministic": true,
    "verified_at": "2026-05-12T00:00:00Z"
  },
  "proof_hash": "sha256:...",
  "generated_at": "2026-05-12T00:00:00Z"
}
```

## Field descriptions

| Field | Description | Deterministic |
|-------|-------------|---------------|
| `proof_id` | Unique identifier for this proof | Yes |
| `run_id` | Links back to the FieldLab run | Yes |
| `solution_pack` | Which solution pack generated this | Yes |
| `customer_context_hash` | SHA-256 of customer context markdown | Yes |
| `evidence.raw_events` | Count of ingested events | Yes |
| `evidence.sources` | Unique source systems | Yes |
| `evidence.source_coverage` | Sources found / expected sources | Yes |
| `evidence.evidence_trust` | Composite trust score (0-1) | Yes |
| `ontology.objects_created` | Objects in compiled ontology | Yes |
| `ontology.links_created` | Causal links between objects | Yes |
| `ontology.mapping_confidence` | Confidence in ontology mapping | Yes |
| `decision.root_cause_hypothesis` | Primary hypothesis | Yes |
| `decision.priority_score` | Weighted priority (0-1) | Yes |
| `decision.confidence` | Decision confidence (0-1) | Yes |
| `decision.requires_human_review` | Human gate flag | Yes |
| `decision.next_best_questions` | Ranked discovery questions | Yes |
| `action.recommended_action` | Suggested remediation | Yes |
| `action.mode` | Action safety mode | Yes |
| `action.status` | Current status | Yes |
| `action.action_log_hash` | Hash of action log | Yes |
| `value_case.estimated_annual_value` | Annualized value in USD | Yes |
| `value_case.confidence` | Value case confidence (0-1) | Yes |
| `value_case.primary_value_driver` | Main value narrative | Yes |
| `replay.replay_hash` | Hash of replay payload | Yes |
| `replay.deterministic` | Replay verified flag | Yes |
| `proof_hash` | Top-level integrity hash | Yes |

## Action modes

Praxis supports five safety-gated action modes:

| Mode | Description | Writeback? |
|------|-------------|------------|
| `READ_ONLY` | Observe without mutation | No |
| `HUMAN_APPROVAL` | Operator review required | No |
| `ASSISTED_ACTION` | AI-guided with checkpoints | Simulated |
| `WRITEBACK` | Production mutation | Only in FieldLab |
| `BLOCKED` | Unsafe, do not proceed | No |

## Verification

Run the proof verifier:

```bash
make praxis-proof
```

Expected output:

```text
Praxis Proof Verification

Solution Pack: manufacturing-printer-gpo
Events loaded: 12
Ontology objects: 9
Ontology links: 14
Decision replay: verified
Evidence trust: 0.82
Value case: $38,400 annualized
Human action: approved
Proof hash: sha256:9f3...

Status: PROOF VALID
```

## Tamper detection

Changing any value in the proof object invalidates the `proof_hash`. The verifier detects:

- Missing required fields
- Evidence trust below threshold (0.5)
- Ontology counts below minimums
- Missing root cause hypothesis
- Replay hash mismatch
- Proof hash mismatch

## Why this matters

Most operational systems output recommendations. Praxis outputs **verifiable proof** that connects:

1. Raw evidence -> Ontology mapping
2. Ontology -> Decision scoring
3. Decision -> Human action
4. Action -> Audit trail
5. Audit -> Business value

This makes Praxis suitable for regulated industries, financial audits, and executive reporting where "the AI said so" is not enough.
