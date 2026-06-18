# Technical Elevator Pitch (Recruiter & Hiring Manager Summary)

This document provides a concise technical summary of **Praxis** for hiring managers or reviewers.

---

## The Elevator Pitch (30-Second Version)

> "I designed and built **Praxis**, a proof-carrying operational decision platform. Praxis addresses a critical trust gap in enterprise AI: the fact that high-impact automated decisions are often generated from fragmented data but cannot be cryptographically replayed, verified, or audited out-of-band.
>
> Praxis solves this by converting messy enterprise telemetry into a structured operational ontology, scoring it via a deterministic rule engine, and producing a schema-validated proof object. L0 verification is implemented today; L1 signed proofs are supported when a valid Ed25519 signature is present; L2 attestation is designed as a fail-closed next step."

---

## Staff-Level System Features (The "What I Built" Summary)

When asked to describe the key achievements of the project, highlight these four core pillars:

1.  **Proof-Carrying Protocol**: Designed a schema-validated proof protocol using JSON Schema Draft 2020-12 and a canonical SHA-256 hashing layer that isolates signature/attestation envelopes from the core decision payload. L1 Ed25519 signature verification is supported when a proof includes a valid signature envelope.
2.  **Adversarial Verification Suite**: Built a strict tiered verifier (L0–L2) and a 13-attack adversarial test suite proving that any tampering with evidence, ontology, decision scores, action states, or signatures causes the verifier to fail closed.
3.  **Local FieldLab Emulation (Floci)**: Implemented an offline LocalStack SRE substrate to simulate AWS resources locally, enabling local integration testing and deterministic replay verification.
4.  **Production Track Separation**: Authored production runbooks, key rotation manuals, backup/restore procedures, and SLO targets while keeping public-production hardening requirements separate from demo claims.
