# Demo Script: Manufacturing Printer GPO Failure

## Setup (pre-demo)
1. Start Praxis services: `make demo`
2. Start FieldLab: `make praxis-fieldlab-up`
3. Verify solution pack: `make praxis-validate-pack`

## Live Demo Flow (7 minutes)

### 0:00-1:00 — Context Setting
- "This is a real manufacturing scenario I've seen: repeated printer failures causing shipping delays."
- Show the scenario.yaml details
- Introduce the customer profile

### 1:00-2:00 — Signal Ingestion
- Start FieldLab run
- Stream 12 events from sample-events.jsonl
- Show events appearing in the FieldLab event feed

### 2:00-3:30 — Ontology Compilation
- Compile operational ontology from the raw events
- Show objects appearing: Site, Asset, BusinessProcess, Vendor, Control
- Highlight mapping confidence score

### 3:30-4:30 — Decision Generation
- Generate decision from the correlated events
- Show priority score, evidence trust score
- Show the causal graph reasoning

### 4:30-5:30 — Human Review & Action
- Review the recommendation
- Show evidence trust breakdown
- Approve the action (simulated)
- Show the action log and audit hash

### 5:30-6:00 — Replay & Audit
- Export replay artifact
- Show that the decision is deterministically reproducible

### 6:00-6:45 — Value Case & Readout
- Generate value case with ROI calculations
- Show estimated annual value: $38,400
- Show expansion map

### 6:45-7:00 — Close
- Generate executive readout
- "This same workflow applies to any customer with operational fragmentation."
