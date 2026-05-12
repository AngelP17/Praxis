# Praxis Demo Script

## Flagship Demo: Printer GPO Failure to Executive Value Case

### Pre-Demo Setup
```bash
make demo
make praxis-fieldlab-up
make praxis-validate-pack
```

### Live Demo (7 minutes)

**0:00-1:00 — Context**: Introduce manufacturing scenario with real printer deployment failures.
**1:00-2:00 — Signal Ingestion**: Start FieldLab, stream 12 events.
**2:00-3:30 — Ontology Compilation**: Show objects, links, actions, confidence.
**3:30-4:30 — Decision Generation**: Priority score, evidence trust, causal graph.
**4:30-5:30 — Human Review**: Review recommendation, approve action, audit hash.
**5:30-6:00 — Replay**: Export replay artifact, verify determinism.
**6:00-6:45 — Value Case**: ROI calculation ($38,400 annual), expansion map.
**6:45-7:00 — Close**: Executive readout, next steps.

### Final Output
```
Incident: GA-PRINT-GPO-042
Primary impact: Shipping documentation delays
Root cause: Printer deployment policy drift
Evidence trust: 0.82
Estimated annual value: $38,400
Expansion: Asset governance, vendor SLA tracking, endpoint drift
```
