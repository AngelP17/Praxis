# 2026-06-18 Flagship Readiness Pass

## Scope

This pass tightened the frontend-only flagship demo path so Praxis reads as a cohesive, clickable system in `NEXT_PUBLIC_DEMO_MODE=1` and local development.

- Linked previously orphaned product narrative and operator workflow routes.
- Added deterministic demo fallbacks for FieldLab run listing and ontology data.
- Seeded in-process FieldLab, value-case, and deployment-plan records for cold-start demo realism.
- Refined mock operational data to avoid static or fake-perfect signals.
- Removed unused legacy Praxis experience code.
- Ran a design-taste pass for raw color tokens, visible dash tells, loading/error behavior, and route health.

## Screenshots Captured

Captured with the Cursor browser against `http://localhost:3000`:

- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-flagship-landing.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-flagship-workbench.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-flagship-decision-center.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-flagship-ontology.png`

## Commands Run

```bash
pnpm install
pnpm --filter eslint-plugin-gpt-taste build
make verify-web
python3 -m venv .venv && .venv/bin/pip install -e . -e packages/astraea-core -e packages/domain -e packages/pipelines
.venv/bin/python -m py_compile apps/api_gateway/services/fieldlab_service.py apps/api_gateway/services/value_case_service.py apps/api_gateway/services/deployment_plan_service.py
.venv/bin/python - <<'PY'
from apps.api_gateway.services.value_case_service import ValueCaseService
from apps.api_gateway.services.deployment_plan_service import DeploymentPlanService
from apps.api_gateway.services.fieldlab_service import FieldLabService
print('service imports ok')
PY
.venv/bin/ruff check apps/api_gateway/services/fieldlab_service.py apps/api_gateway/services/value_case_service.py apps/api_gateway/services/deployment_plan_service.py
make praxis-proof-hashes
make verify-web
```

## Results

- `make verify-web`: passed.
- TypeScript: passed.
- GPT-taste hard gate: passed with `--max-warnings=0`.
- Playwright smoke: 14/14 passed, including CTA audit, route health, decision center interactions, and fullstack proof path.
- Next production build: passed, 61 static pages generated.
- Touched backend services: `py_compile` passed, imports passed, Ruff passed.
- `make praxis-proof-hashes`: passed. No fake-looking proof hashes or `Math.random()` usage in proof-related files.

## Notes

- Initial verification was blocked by missing `apps/web/node_modules`; `pnpm install` fixed it.
- Initial `make verify-web` then required building the local `eslint-plugin-gpt-taste` workspace package before the hard design gate could run.
- `make praxis-proof-hashes` initially could not run because `.venv/bin/python` did not exist; the Python virtualenv was created and package installs completed before rerunning.
- True backend production hardening remains intentionally out of scope for this pass: real `SECRET_KEY`, public `ALLOWED_ORIGINS`, demo credential rotation, broad auth coverage, and durable Postgres-backed FieldLab/value-case/deployment-plan storage.

> **Superseded in part:** a later pass closed several of these items. Value cases
> and deployment plans now persist to their DB models, production-gated auth
> covers mutating/customer-data routes, a demo credential boot guard exists, and
> security headers are added. See `docs/verification/2026-06-18-production-hardening.md`
> and `docs/release/production-hardening-track.md` for the current posture.
