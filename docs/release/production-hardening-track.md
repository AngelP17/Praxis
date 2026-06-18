# Praxis Production Hardening Track

Praxis supports a deterministic public demo, a local FieldLab proof path, and a
self-hosted backend. This document tracks the production-hardening posture
honestly: what the code now enforces, and what still depends on your deployment
environment and must be supplied and verified before a real public launch.

## Enforced In Code

These blockers are closed in the current checkout and covered by
`tests/integration/test_production_hardening.py`:

- **Production safety validator** (`apps/api_gateway/config.py`): when
  `ENV=production`, the app refuses to start with `DEBUG=true`, an insecure or
  empty `SECRET_KEY`, a wildcard/localhost-only `ALLOWED_ORIGINS`, or no public
  origin.
- **Demo credential boot guard** (`apps/api_gateway/main.py` +
  `services/auth_service.py`): when `ENV=production`, startup is blocked if any
  account still uses a shipped demo password hash. Rotate `users.json` or set
  `USERS_FILE` first.
- **Production-gated auth** (`apps/api_gateway/security.py`,
  `require_operator` / `require_admin_gated`): state-mutating and customer-data
  routers (incidents, decisions, recommendations, reports, replay, metrics,
  assets, events, platform, audit, fieldlab, solution-packs, ontology,
  value-cases, deployment-plans, discovery) require a valid bearer token and
  role when `ENV=production`. Platform chaos endpoints require an admin. In
  non-production the checks are a no-op so the deterministic demo stays open.
- **Security headers** (`apps/api_gateway/main.py`): `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, and
  `Permissions-Policy` on every response; HSTS added when `ENV=production`.
- **Durable state** (`services/value_case_service.py`,
  `services/deployment_plan_service.py`): value cases and deployment plans now
  persist to the `value_cases` and `deployment_plans` tables instead of process
  memory, with deterministic demo records seeded on first use.

## You Must Supply And Verify (Environment-Bound)

These cannot be proven from this checkout because they depend on your
infrastructure. They are required before claiming public production:

- Provision a real `SECRET_KEY` from your secret manager (not committed).
- Set `ALLOWED_ORIGINS` to your exact public frontend domains.
- Replace `users.json` with real, rotated credentials (or mount `USERS_FILE`),
  and confirm the boot guard passes.
- Point `DATABASE_URL` at a managed Postgres instance (not SQLite) and run
  migrations.
- When the backend runs with `ENV=production`, the frontend must attach bearer
  tokens to gateway calls.
- Run and record a fresh Docker Compose production proof (requires Docker) after
  the above configuration is set.

## Claim Standard

- Use **public demo** for the Vercel/Next.js deterministic experience.
- Use **FieldLab-verified** only for the local proof path backed by a current
  verifier run.
- Use **production-ready** only after the environment-bound checklist above is
  completed and linked to current verification evidence for your deployment.
