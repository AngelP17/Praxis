# Praxis → Anduril Mission Engineer

Praxis demonstrates competencies directly applicable to Mission Engineering and Forward-Deployed Operations roles at Anduril.

| Praxis Component | Anduril Mission Engineer Competency | Evidence |
|-----------------|-------------------------------------|-----------|
| **Floci FieldLab** | Local, composable infrastructure that mirrors deployed systems | Docker-based local AWS substrate (SQS, S3, DynamoDB, EventBridge) that reproduces operational infrastructure before deployment to the edge. |
| **Deterministic Replay** | Verifiable, auditable decision chains for defense applications | Bit-deterministic proof generation with CI gate enforcement. Every decision is independently re-verifiable. Proofs can be Ed25519-signed and Sigstore-attested. |
| **Human-in-the-Loop Gating** | Explicit operator authority with governed autonomy levels | Five safety modes: READ_ONLY, HUMAN_APPROVAL, ASSISTED_ACTION, WRITEBACK. No autonomous action without explicit operator review. |
| **Operational Ontology** | Real-time data fusion from heterogeneous sensors | Compiles messy signals (tickets, logs, telemetry, operator notes) into typed objects, causal links, and action graphs. Same pattern applies to sensor fusion. |
| **Proof Protocol** | Cryptographic chain of custody for operational decisions | Published PPP v0.1 as an open protocol. SHA-256 hash chain + Ed25519 signatures + Rekor transparency log attestation. |
| **Edge-Deployable** | Runs on local infrastructure without cloud dependencies | Full Floci stack runs in Docker on a laptop. No cloud credentials required. Same binary runs on edge hardware. |
| **Expansion Graph** | Campaign-level planning from single-mission success | Scores adjacent use cases by shared sensor/data models, stake-holder overlap, and implementation reuse. |
| **Executive Readout** | Mission debrief and AAR artifact | Structured readout with problem, operational impact, findings, recommended action, and expected value — the post-mission equivalent of an AAR. |
| **CI-Enforced Determinism** | Safety-critical system verification | Every commit is validated for bit-deterministic behavior. No drift between development and deployed environments. |
| **Third-Party Verifier** | Cross-vendor interoperability | Published CLI verifier on PyPI. Any party can independently verify a Praxis proof without access to the generating system. |
