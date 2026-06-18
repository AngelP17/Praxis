# 2026-06-18 Truth Reset Verification

## Scope

This pass reset Praxis from broad "production/flagship" claims to an evidence-backed product demo:

- Public demo copy now describes deterministic demo mode, local FieldLab proof, and separate production hardening.
- A single active case spine carries `pack`, `scenario`, and `ticket` through overview, decision, proof, readout, portfolio, and command surfaces.
- Primary CTAs now mutate demo state, download proof JSON, open focused views, or use honest labels.
- Shared demo evidence, audit, feedback, platform assets, pipeline logs, and run summaries cover all four registered cases instead of collapsing back to the printer case.
- The visible workbench navigation is curated around the core product journey.

## Screenshots Captured

Captured against `http://localhost:3000` with `database-failover-lag` / `INC-4785`:

- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-truth-reset-landing.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-truth-reset-overview.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-truth-reset-decision-center.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-truth-reset-proof.png`
- `/var/folders/vn/0xm1037d6p5dzd_bm_p51p440000gn/T/cursor/screenshots/praxis-truth-reset-readout.png`

## Commands Run

```bash
make verify-web
make praxis-proof-hashes
.venv/bin/python -m py_compile apps/api_gateway/services/fieldlab_service.py apps/api_gateway/services/value_case_service.py apps/api_gateway/services/deployment_plan_service.py
.venv/bin/ruff check apps/api_gateway/services/fieldlab_service.py apps/api_gateway/services/value_case_service.py apps/api_gateway/services/deployment_plan_service.py
```

## Results

- `make verify-web`: passed.
- TypeScript: passed.
- GPT-taste hard gate: passed with `--max-warnings=0`.
- Playwright smoke: 16/16 passed, including multi-case continuity and proof JSON artifact checks.
- Next production build: passed, 61 static pages generated.
- `make praxis-proof-hashes`: passed.
- Targeted Python `py_compile` and Ruff checks: passed.

## Production Boundary

Demo-ready means the deterministic web journey is clickable, case-aware, and backed by local proof artifacts. FieldLab-verified means `make praxis-proof` has been run with Floci available. Public production still requires the hardening track in `docs/release/production-hardening-track.md`: real secrets, public origins, credential rotation, auth coverage, durable state, and a fresh Docker Compose production proof.
