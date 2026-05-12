# ADR 0001: Monorepo Operational Platform

## Status
Accepted

## Context
Praxis integrates three independent systems:
- **Ticketing**: event ingestion, ticket workflow, operator UI
- **Astraea**: deterministic decision engine, scoring, prioritization
- **k8s-resilience-pilot**: SLO evidence, infrastructure context, platform proxy

Each was a standalone repository with its own deployment, database, and versioning. Integrating them as microservices across separate repos would create:
- Cross-repo dependency hell
- Inconsistent data models
- Divergent deployment practices
- Difficult end-to-end testing
- Fragmented documentation

## Decision
We will migrate all three systems into a single monorepo with a unified operational platform structure:
- `apps/`: user-facing services (API gateway, web UI)
- `services/`: background/decision services (decision engine, platform proxy)
- `packages/`: shared libraries (domain models, pipelines, Astraea core)
- `infrastructure/`: database, Kubernetes, Terraform
- `tests/`: unit and integration tests across the entire system

## Consequences

### Positive
- Atomic commits across the full acceptance path
- Single `make test` validates the entire pipeline
- Shared domain models prevent schema drift
- Unified versioning and release process
- One README explains the whole system

### Negative
- Larger repository size
- More complex CI (must test multiple languages/stacks)
- Risk of tight coupling if boundaries are not respected

## Mitigation
- Strict package boundaries with `__init__.py` contracts
- Separate `pyproject.toml` per package for independent publishing
- Frontend and backend CI run in parallel
- ADR 0002 enforces deterministic boundaries for the decision engine

## Date
2024-01-15

## Author
Angel Pinzon
