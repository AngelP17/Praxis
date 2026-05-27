# Technical Demonstration Script (7-Minute Walkthrough)

This document contains a structured, timed technical script to guide you through presenting **Praxis** to hiring managers and staff/principal-level interviewers.

---

## 0:00 to 0:45 | 1. The Core Problem (The Trust Gap)

> "Traditional enterprise AI systems are built on sand. They ingest messy operational data, run it through complex, probabilistic model layers or agent state loops, and execute high-impact interventions. But if an automated action triggers a production outage, it is virtually impossible to audit exactly why it occurred, prove that the decision logic was reproducible, or guarantee that historical event logs were not tampered with retroactively.
>
> **Praxis is a proof-carrying operational decision platform** designed to bridge this trust gap. It converts fragmented, unstructured enterprise signals into deterministic, schema-validated, and replay-verified decision objects."

---

## 0:45 to 1:45 | 2. Architecture and Pipeline (The Chain of Trust)

> "Rather than relying on un-auditable AI agents, Praxis implements a strict, structured pipeline of trust that moves from messy telemetry to a proof object:
>
> 1. **Messy Signals**: Unstructured events are ingested and normalized into immutable CloudEvents.
> 2. **Ontology Compiling**: Messy telemetry is compiled into a structured graph of operational nodes, links, and actions.
> 3. **Deterministic Engine**: An algorithmic scoring core grades evidence trust and priority scores.
> 4. **Human Gating**: Destructive writeback actions are transactionally blocked until explicit operator approval is logged.
> 5. **Proof Generation**: The pipeline produces a schema-valid Proof Object (`praxis_proof.json`) containing all input snapshots and scoring states.
> 6. **Replay & Audit Verification**: An adversarial verifier recomputes decision hashes to verify absolute determinism and lack of runtime drift."

---

## 1:45 to 3:00 | 3. The Proof Protocol (PPP)

> "Let's inspect the **Praxis Proof Protocol (PPP)**, which governs this contract.
>
> First, let's open `docs/spec/proof-object.schema.json`. It is defined using JSON Schema Draft 2020-12 and enforces lowercase protocol enums (like `human_approval`, `approved`, `pending`) and strict format patterns.
>
> Second, let's review the canonical hashing rules in `packages/astraea-core/astraea/praxis/proof_hash.py`. The canonical hash strictly excludes the `proof_hash`, `signature`, and `attestation` envelopes.
>
> This guarantees that:
>
> $$\text{proof\_hash}(\text{unsigned\_proof}) \equiv \text{proof\_hash}(\text{signed\_proof}) \equiv \text{proof\_hash}(\text{attested\_proof})$$
>
> A signature or ledger attestation validates the proof's integrity without altering the underlying data being proven."

---

## 3:00 to 4:00 | 4. Compiling the Proof (The Live Demo)

> "Let's run the compilation suite to build a pristine, schema-validated proof object from our flagship solution pack (`manufacturing-printer-gpo`):
>
> ```bash
> make praxis-proof
> ```
>
> This command compiles the local FieldLab events, runs the decision scoring engine, executes the ROI calculations, and exports the final L0 proof to `artifacts/latest/praxis_proof.json` and a human-readable SRE summary to `artifacts/latest/proof-summary.md`. Let's verify that this proof is fully schema-compliant:
>
> ```bash
> .venv/bin/python scripts/verify_praxis_proof.py artifacts/latest/praxis_proof.json --level L0
> ```
>
> The L0 verification passes successfully, confirming that the canonical hash matches and the JSON Schema is fully conformed to."

---

## 4:00 to 5:00 | 5. The Tamper Test (Adversarial Defense)

> "A system is only as strong as its ability to handle failure and malicious interventions. Let's run our adversarial test suite:
>
> ```bash
> .venv/bin/pytest tests/praxis/test_protocol_adversarial.py
> ```
>
> This suite tests 13 critical attack vectors:
> - **Post-hash Tampering**: Modifying raw event counts, ontology mappings, decision priority scores, action statuses, or value calculations after the hash is computed immediately invalidates the proof.
> - **Signature Forgery**: Forging or copying operator signatures to unauthorized proofs causes L1 verification to fail closed.
> - **Attestation Tampering**: Any L2 request fails closed with `unsupported_attestation_verification` until real transparency-log inclusion verification exists.
>
> As we can see, all 13 adversarial attacks fail closed perfectly, proving the cryptographic defense of our system."

---

## 5:00 to 6:00 | 6. CI/CD and Production Posture

> "To make this platform production-ready, we have implemented standard SRE and repository hygiene:
> - **Multi-Container Composition**: Hardened configurations are isolated between `docker-compose.yml` and `docker-compose.prod.yml`.
> - **GitHub Security Gates**: OpenSSF Scorecards, Dependabot tracking, and secret scanning are fully integrated into our GitHub Actions workflows.
> - **SRE Playbooks**: Under `docs/operations/`, we have detailed complete SLO targets, incident response runbooks, backup/restore procedures, and key rotation workflows to guarantee continuous availability."

---

## 6:00 to 7:00 | 7. The Staff-Level Close

> "To summarize, the core contribution of Praxis is not a cool dashboard. **The contribution is a deterministic, schema-validated, cryptographically verifiable operational decision pipeline with human-in-the-loop governance and deployable solution packs.**
>
> By decoupling the verification logic from the execution code, any client can independently replay and verify the entire history of an enterprise. This shifts AI systems from untrusted black boxes into mathematically defensible compliance assets."
