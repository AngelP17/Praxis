# ADR 0007: Flagship Modernization (Outbox, Alembic, Dynamic Hashing, and SSE Streams)

## Status
Accepted

## Context
As the Praxis platform scales from an advanced demonstration monorepo to a production-grade centerpiece, it requires architectural maturity across its database lifecycles, cross-service communication, real-time telemetry, and cryptographic proofs.

Four key challenges needed systematic solutions:
1. **Database Schema Drift**: Direct inline DDL SQL blocks bypassed proper migration workflows.
2. **Decoupled Event Distribution**: Direct service integrations risk data loss on transient connection drops.
3. **Parity in Proof Hashing**: The frontend served static hashes, while the backend generated real hashes, breaking the protocol's core verification promise.
4. **Real-time telemetries**: The dashboard relied on interval polling, leading to latency and excessive network request logs.

## Decision
We implemented a series of flagship modernizations:
1. **Unified SQLAlchemy Base & Alembic**: Converted all 31 models under a single registry base and configured Alembic to bootstrap and auto-apply migrations on startup.
2. **Lifespan Async Outbox Relayer**: Implemented a non-blocking asynchronous outbox polling worker directly in the API gateway's lifespan hooks, ensuring decoupled, safe transaction publishing to Floci.
3. **Pure JS Deterministic Hashing**: Built a pure-JS SHA-256 and key-sorted JSON canonicalizer in the frontend, matching the backend's `astraea.praxis.proof_hash` logic exactly.
4. **In-Memory SSE pub-sub and TTL Caching**: Created a thread-safe TTL cache decorator for read-heavy routes and implemented async in-memory event queues (`SSEBroadcaster`) to stream events and decisions instantly.

## Consequences

### Positive
- **Verification Guarantee**: Frontend demo proofs now compute identical hashes to real backend runs, making proof verifications completely authentic.
- **Sub-Second Responsiveness**: Dashboards receive telemetry streams instantly via SSE on `/api/events/stream` and `/api/decisions/stream`, removing interval pollings.
- **Enterprise Db Posture**: Schema changes are managed strictly via Alembic migrations, with programmatic safety gates checking migration states on start.
- **Reliable Event Spine**: System outboxes guarantee "at-least-once" delivery of approved decisions even during transient AWS/EventBridge disruptions.

### Negative
- Slight processing overhead for in-memory queue broadcasts.
- Developers must run `make db-migrate` when changing database schemas instead of relying on inline SQL alterations.

## Date
2026-05-27

## Author
Antigravity AI
