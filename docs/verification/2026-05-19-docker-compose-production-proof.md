# Docker Compose Production Proof — 2026-05-19

- Date: 2026-05-19
- Timezone: America/Los_Angeles
- Goal: verify one live backend-backed production-mode path using `docker-compose.yml` plus `docker-compose.prod.yml`
- Working tree context: repo contained in-progress documentation and containerization changes before this proof run
- GitHub follow-up:
  - PR: [#4](https://github.com/AngelP17/Praxis/pull/4)
  - First CI run: `26118162350` on commit `a6b9125` failed in `docker-compose-production-proof` because the workflow readiness probe sent over-escaped JSON to `/api/auth/login`, causing repeated `422 Unprocessable Entity` responses.
  - Second CI run: `26118408989` on commit `8debcea` passed, including `docker-compose-production-proof`.

## Commands Run

```bash
docker --version
docker compose version
docker info
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build api-gateway decision-service
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d web
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build platform-service
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
curl -sS -D - http://localhost:8000/health
curl -sS -D - http://localhost:8001/health
curl -sS -D - http://localhost:8080/health
curl -sS -D - -H 'content-type: application/json' \
  -d '{"username":"operator","password":"operator"}' \
  http://localhost:8000/api/auth/login
curl -sS -D - -H 'content-type: application/json' \
  -d '{"username":"operator","password":"operator"}' \
  http://localhost:3000/api/auth/login
curl -sS -D - -H 'Authorization: Bearer <token>' \
  http://localhost:3000/api/auth/me
curl -sS -D - -X POST http://localhost:8001/api/decisions/dec-demo/replay
curl -sS -D - -X POST http://localhost:8000/api/decisions/dec-demo/replay
curl -sS -D - -X POST http://localhost:3000/api/decisions/dec-demo/replay
curl -sS -D - -X POST http://localhost:3000/api/decisions/4821/replay
curl -sS -D - -X POST http://localhost:3000/api/decisions/INC-4821/replay
docker exec praxis-web sh -lc "curl -sS -D - http://api-gateway:8000/health"
docker exec praxis-web sh -lc "curl -sS -D - http://api-gateway:8000/api/replay/incidents/INC-4821"
docker exec praxis-web sh -lc "curl -sS -D - -X POST http://decision-service:8001/api/decisions/4821/replay"
docker logs --tail 80 praxis-platform-service
docker logs --tail 120 praxis-decision-service
```

## Result Summary

| Check | Result |
|------|--------|
| Docker daemon availability | Pass |
| Compose config renders in production mode | Pass |
| API gateway production guard | Pass |
| API gateway `/health` | Pass |
| Decision service `/health` | Pass after fix |
| Platform service `/health` | Pass |
| Direct backend auth login | Pass |
| Web proxy auth login | Pass |
| Web proxy `/api/auth/me` with bearer token | Pass |
| Decision replay via standalone decision service | Pass |
| Numeric decision replay via web proxy | Pass |
| Published ports inspection | Pass after Compose override fix |
| `INC-*` replay via web proxy | Pass after scenario-registry fallback exposure |
| GitHub Actions `docker-compose-production-proof` | Pass on rerun `26118408989` |

## What This Proof Verifies

- The recommended Docker Compose path can boot a production-mode API gateway with hardened env expectations already enforced in code.
- The API image can now authenticate against the bundled demo user store inside the container.
- The decision-service container can now boot successfully against the current Astraea interfaces.
- The web container can now proxy to the live backend using an internal service URL instead of silently falling back to demo auth.
- A backend-backed flagship flow is verified end to end for authentication:
  - web request to `/api/auth/login`
  - live proxy to API gateway
  - successful bearer token issuance
  - web request to `/api/auth/me`
  - live proxy to API gateway
  - successful authenticated user lookup
- A backend-backed replay path is verified through the web container for numeric decision ids:
  - web request to `/api/decisions/4821/replay`
  - live proxy to API gateway and decision service
  - backend replay payload returned to the browser-facing route without demo fallback
- A backend-backed replay path is verified through the web container for the flagship `INC-4821` route:
  - web request to `/api/decisions/INC-4821/replay`
  - live proxy to API gateway `/api/replay/incidents/INC-4821`
  - canonical scenario-registry replay bundle returned from the backend with the printer-offline event type and deterministic replay hash

## What Changed To Make The Proof Work

- `apps/api_gateway/Dockerfile`
  - copy `users.json` into the image so production-mode auth has a user store available
  - install `curl` so the container healthcheck reflects the real `/health` endpoint
- `services/decision-service/main.py`
  - remove stale engine initialization that no longer matches the current Astraea APIs
  - build the demo incident graph lazily inside replay handling
- `apps/web/src/app/api/decisions/[decisionId]/replay/route.ts`
  - proxy numeric decision ids to the live backend and normalize the replay payload for the web UI
  - keep explicit demo fallback only when the backend replay lookup fails
- `apps/api_gateway/services/replay_service.py`
  - expose canonical scenario-registry replay bundles when the database does not yet contain a persisted incident for ids like `INC-4821`
- `packages/domain/domain/scenarios.py`
  - add shared lookup by scenario id, ticket id, or incident id so backend replay can resolve flagship external ids deterministically
- `docker-compose.yml`
  - set `API_INTERNAL_URL=http://api-gateway:8000` for the web container
  - build the web image from the repo root so workspace dependencies resolve in Docker
- `docker-compose.prod.yml`
  - set `API_INTERNAL_URL` default for the web container
  - use Compose override syntax to clear backend host port publishing in the production overlay
- `services/platform-service/Dockerfile`
  - install `curl` and define a matching container healthcheck so Docker health state matches the working `/health` endpoint
- `services/decision-service/Dockerfile`
  - install `curl` and define a matching container healthcheck so Docker health state reflects the live service

## Known Gaps After Live Proof

1. Backend services are intentionally internal-only in the final production overlay.
   - Evidence: final `docker compose ... ps` showed only the web service published on `0.0.0.0:3000`; backend services reported container ports only (`8000/tcp`, `8001/tcp`, `8080/tcp`, `5432/tcp`).
   - Operational implication: host-side `/health` checks for backend services are no longer valid after the override fix; use `docker exec`, container health state, or an internal reverse proxy path instead.

2. The new CI job is configured locally in `.github/workflows/ci.yml`, but this proof note does not include a completed GitHub Actions run for that job.
   - Resolved: PR `#4` rerun `26118408989` completed successfully after fixing the readiness-probe JSON quoting bug in the workflow.
   - Residual caveat: the observed green run is on the PR branch before merge to `main`, not yet a post-merge `main` run.

## Honest Claim After This Run

Praxis is now verified as:

- a strong public demo / portfolio centerpiece
- a locally provable FieldLab system
- a Docker Compose backend path that is functionally live enough to prove production-mode boot, health, backend-backed auth, numeric decision replay, and flagship `INC-4821` replay through the web layer

Praxis is **not yet** verified here as:

- a post-merge `main` run of the new Docker Compose production-proof job

## Recommended Follow-up

1. After merge, confirm the same `docker-compose-production-proof` job stays green on the next `main` push.
2. If the scenario-registry replay fallback for `INC-4821` should become persisted database state instead of an exposed canonical replay bundle, add that as a separate backend-seeding task.
