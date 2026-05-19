# Public Launch Checklist

This checklist separates what is already verified in this repo from what still needs operator decisions before a public launch.

## Flagship Claim

Praxis is a flagship public demo and technical proof system, with a functional but not fully productized backend production path.

## Launch Modes

### 1. Frontend-only public demo (verified)

This is the recommended public showcase path.

- Deploy the Next.js app from `apps/web/`
- Set `NEXT_PUBLIC_DEMO_MODE=1`
- Use the root [`vercel.json`](../../vercel.json) or [`apps/web/vercel.json`](../../apps/web/vercel.json), both of which now target the frontend only
- No live FastAPI deployment is required for the flagship demo surfaces

### 2. Local FieldLab proof (verified)

This is the recommended technical credibility path.

```bash
make install
make praxis-fieldlab-up
make praxis-proof
make praxis-benchmark
make praxis-floci-verify
make praxis-fieldlab-down
```

### 3. Docker Compose self-hosted (functional, CI proof job configured)

The recommended backend production path. The API gateway enforces production safety at boot, and `.github/workflows/ci.yml` now includes a Docker Compose production-proof job. Until that job has a green GitHub run on the active branch, treat the path as configured rather than historically CI-verified.

```bash
cp .env.example .env   # fill in real values
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
curl http://localhost:8000/health
```

## Required Before Real Public Production

### Backend safety

- Set a strong `SECRET_KEY` in the runtime environment
- Set `ENV=production`
- Set `DEBUG=false`
- Set `ALLOWED_ORIGINS` to the real public frontend origins
- Replace or rotate the demo-backed `users.json` credentials before exposing real users or customer data

The API gateway now refuses to boot in production if `SECRET_KEY`, `DEBUG`, or `ALLOWED_ORIGINS` are left in insecure defaults (enforced in `apps/api_gateway/config.py`).

### Functional-enough acceptance bar

Before claiming a backend-backed deployment works:

- [ ] Backend boots in production mode with real `SECRET_KEY`, `ENV=production`, `DEBUG=false`, and public `ALLOWED_ORIGINS`
- [ ] `/health` endpoint returns `{"status":"healthy"}`
- [ ] Frontend can reach the backend via `NEXT_PUBLIC_API_URL` without `NEXT_PUBLIC_DEMO_MODE`
- [ ] At least one real backend-backed workflow completes: login, core route load, and one proof/decision or solution-pack flow
- [ ] Known non-turnkey gaps are documented rather than hidden

## Verified Commands

### Frontend verification

```bash
pnpm web:typecheck
pnpm web:lint:gpt-taste:ci
pnpm web:test:smoke
pnpm web:build
```

## Known Gaps (documented, not hidden)

- Docker Compose self-hosted path now has a CI proof job configured, but this checklist should stay conservative until that job is green on GitHub
- `docker-compose.prod.yml` `ports: []` override may not fully clear base-file port bindings in all Docker Compose versions — use host firewall + reverse proxy
- Fly.io and Railway configs exist as secondary references but have not been exercised by CI
- The repo contains Kubernetes, Terraform, and Lambda reference assets that are not continuously validated
- Demo users in [`users.json`](../../users.json) are suitable for local/demo use only
- CI does not currently exercise a public cloud deployment

## Done When

- **Demo launch**: frontend deploy succeeds, `NEXT_PUBLIC_DEMO_MODE=1` is set, and the frontend verification commands pass
- **Proof launch**: local FieldLab proof completes with deterministic hash integrity
- **Production launch**: Docker Compose stack boots with real secrets, `/health` passes, frontend reaches backend without demo mode, and at least one backend-backed workflow completes
