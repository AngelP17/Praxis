# Praxis Production Hardening Track

Praxis currently supports a deterministic public demo and a local FieldLab proof path. Those modes are intentionally separate from a real public production launch.

## Verified Today

- **Frontend demo**: `NEXT_PUBLIC_DEMO_MODE=1` renders the product journey with deterministic demo data and route-handler fallbacks.
- **Local FieldLab proof**: `make praxis-proof` produces `artifacts/latest/praxis_proof.json` when Floci is running.
- **Recorded Compose proof**: `docs/verification/2026-05-19-docker-compose-production-proof.md` records a prior Docker Compose production proof run.

## Not Yet A Production Claim

Do not claim Praxis is fully public-production-ready until these items are completed and re-verified in the current checkout:

- Replace placeholder `SECRET_KEY` values with a runtime secret from the deployment environment.
- Set `ALLOWED_ORIGINS` to the exact public frontend domains.
- Rotate or replace demo credentials in `users.json`.
- Add auth coverage for all flagship backend routes that mutate state or expose customer records.
- Persist FieldLab, value-case, deployment-plan, and approval state durably instead of relying on in-process memory for demo paths.
- Run and record a fresh Docker Compose production proof after environment-specific configuration is set.

## Claim Standard

- Use **public demo** for the Vercel/Next.js deterministic experience.
- Use **FieldLab-verified** only for the local proof path backed by a current verifier run.
- Use **production-ready** only after the hardening checklist above is implemented and linked to current verification evidence.
