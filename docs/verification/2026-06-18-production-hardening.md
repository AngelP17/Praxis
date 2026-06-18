# 2026-06-18 Production Hardening Verification

## Scope

This pass closes the code-level items on the production-hardening track while
preserving the verified deterministic demo. Enforcement is gated to
`ENV=production`; non-production behavior is unchanged.

- Production-gated auth (`require_operator` / `require_admin_gated`) applied to
  state-mutating and customer-data routers; platform chaos endpoints require an
  admin.
- Demo credential boot guard refuses to start in production when shipped demo
  password hashes are still active.
- Baseline security headers on all responses; HSTS in production.
- Durable persistence for value cases and deployment plans via existing DB
  models, replacing in-process dictionaries; deterministic demo records are
  seeded on first use.

## Commands Run

```bash
.venv/bin/python -m py_compile apps/api_gateway/main.py apps/api_gateway/security.py \
  apps/api_gateway/services/auth_service.py apps/api_gateway/services/value_case_service.py \
  apps/api_gateway/services/deployment_plan_service.py apps/api_gateway/routes/platform.py \
  tests/integration/test_production_hardening.py
make lint
make test
make praxis-test
make praxis-proof-hashes
ENV=production DEBUG=false SECRET_KEY=<generated> ALLOWED_ORIGINS=https://praxis.example.com \
  .venv/bin/python -c "from apps.api_gateway.main import _enforce_production_credentials; _enforce_production_credentials()"
```

## Results

- `py_compile`: passed.
- `make lint` (ruff over apps/packages/services): passed.
- `make test`: 61 passed.
- `make praxis-test`: 82 passed (includes the new hardening suite).
- `make praxis-proof-hashes`: all checks passed.
- Production credential guard: raised `RuntimeError` as expected when shipped
  demo credentials were active under `ENV=production`.

## Coverage

New tests in `tests/integration/test_production_hardening.py`:

- Mutating routes open in development, `401` without a token in production, and
  allowed with a valid token.
- Platform chaos endpoint requires auth in production.
- Credential boot guard raises in production with demo credentials.
- Value cases and deployment plans persist across separate DB sessions.
- Baseline security headers present on responses.

## Boundary

This pass makes the backend enforce production-grade auth, credential, header,
and persistence behavior in code. Public production still requires the
environment-bound items in `docs/release/production-hardening-track.md`: a real
secret, public origins, rotated credentials, managed Postgres, frontend token
propagation, and a fresh Docker Compose production proof (Docker required, not
run in this checkout).
