# Roadmap

## Near Term

- Add measured proof-generation, verification, replay, and outbox metrics.
- Add a dedicated production outbox relay process if the deployment model requires separating it from the API gateway.
- Generate and publish OpenAPI-derived frontend types.
- Add measured SLO dashboards after real metric collection exists.

## Later

- Implement real Sigstore bundle/Rekor inclusion verification for L2.
- Add production signing identity and key registry.
- Add Redis-backed deterministic proof and solution-pack read cache if load testing proves it is needed.
