# Technical Elevator Pitch (Recruiter & Hiring Manager Summary)

This document provides a concise, high-impact summary of **Praxis** to share with recruiters, hiring managers, or as an introductory pitch at the start of your interviews.

---

## The Elevator Pitch (30-Second Version)

> "I designed and built **Praxis**, a proof-carrying operational decision platform. Praxis addresses a critical trust gap in enterprise AI: the fact that high-impact automated decisions are often generated from fragmented data but cannot be cryptographically replayed, verified, or audited out-of-band.
>
> Praxis solves this by converting messy enterprise telemetry into a structured operational ontology, scoring it via a deterministic rule engine, and producing a schema-validated, Ed25519-signed proof object. This allows compliance auditors and downstream systems to independently verify the complete provenance and determinism of every action without relying on databases or proprietary logs."

---

## Staff-Level System Features (The "What I Built" Summary)

When asked to describe the key achievements of the project, highlight these four core pillars:

1.  **Cryptographic Proof-Carrying Protocol**: Designed a schema-validated proof protocol using JSON Schema Draft 2020-12 and a canonical hashing layer (Ed25519) that isolates signature/attestation envelopes from the core decision payload.
2.  **Adversarial Verification Suite**: Built a strict tiered verifier (L0–L2) and a 13-attack adversarial test suite proving that any tampering with evidence, ontology, decision scores, action states, or signatures causes the verifier to fail closed.
3.  **Local FieldLab Emulation (Floci)**: Implemented an offline LocalStack SRE substrate to simulate AWS resources locally, enabling 100% offline integration testing and deterministic replay verification.
4.  **Production Hardening & SRE Runbooks**: Authored comprehensive production runbooks, Key Rotation manuals, Backup/Restore procedures, and Service Level Objectives (SLOs) defining error budgets and incident recovery workflows.
