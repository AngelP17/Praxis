# ADR 0007: Use Docker Compose as the Blessed Production Path

## Status
Accepted

## Context
Praxis requires a multi-container stack: the FastAPI API gateway, Next.js web application, a persistent PostgreSQL datastore, and a message bus/outbox worker. While Kubernetes is highly scalable, it adds huge operations overhead, resource footprints, and setup complexity—making it poorly suited for offline forward-deployed systems, single edge servers, or simple dev-staging evaluations.

## Decision
We establish **Docker Compose** as the primary, production-recommended self-hosted deployment target.
- Dev and local SRE runs leverage `docker-compose.yml` for quick setups.
- Real production releases leverage `docker-compose.prod.yml` which hardens configurations (e.g. turning off debug paths, loading real PostgreSQL, setting strict security variables, and using secrets).
- The monorepo continues supporting Kubernetes templates, but compose remains the verified deployment target.

## Alternatives Considered
- **Kubernetes-Only Deployments**: Directing all production targets to Helm/K8s. Rejected due to excessive compute requirements in low-footprint edge zones.
- **Bare-Metal Manual Installs**: Standardizing on manual systemd setups. Rejected because dependency drift makes bare-metal environments irreproducible and hard to support.

## Consequences
### Positive
- Negligible system overhead: compose runs perfectly on tiny edge hardware or single nodes.
- High reproducibility: identical container boundaries from local developer environments to production.
- Extremely simple deployments: single command `docker compose up -d` boots the entire stack.

### Negative
- Lacks native multi-node clustering and automatic scaling features out-of-the-box (though rarely needed in Praxis's target environments).

## How this is verified
- Enforced at CI level by `.github/workflows/ci.yml` running a Docker Compose production-proof job verifying container builds and integrations.
- Described and tracked in `docs/verification/` logs and `docs/architecture/deployment-guide.md`.
