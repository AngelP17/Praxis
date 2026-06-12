# 2026-06-12 Screenshot And Documentation Refresh

## Scope

This refresh aligned committed screenshots, screenshot tooling, and status documentation with the current frontend-only Praxis demo state.

- Checkout before this commit: `829648c`
- Local demo mode: `NEXT_PUBLIC_DEMO_MODE=1`
- Local production server: `http://127.0.0.1:3200`
- Canonical proof route used for screenshots: `/proof/fieldlab_run_manufacturing_printer_gpo?pack=manufacturing-printer-gpo`

## Screenshots Refreshed

- `screenshots/praxis/*.png` via `scripts/capture-praxis-screenshots.mjs`
- `screenshots/*.png` via `scripts/capture-all-screenshots.mjs`
- `docs/demo/screenshots/*.png` via `scripts/capture-demo-screenshots.mjs`
- `docs/screenshots/*.png` via `scripts/capture-readme-screenshots.mjs`

The capture scripts now seed the deterministic demo browser session directly and use current route anchors instead of stale backend login or legacy UI labels.

## Commands Run

```bash
NEXT_PUBLIC_DEMO_MODE=1 pnpm web:build
PORT=3200 NEXT_PUBLIC_DEMO_MODE=1 pnpm --filter praxis-web start --hostname 127.0.0.1 --port 3200
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-praxis-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-all-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-demo-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-readme-screenshots.mjs
pnpm web:typecheck
pnpm web:lint:gpt-taste:ci
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 pnpm --dir apps/web test:smoke
```

## Results

- Production demo build: passed.
- Screenshot scripts: passed after route/text-anchor updates.
- Spot checks: landing, login, command center, ontology graph, proof control, and dashboard screenshots rendered current Praxis surfaces without blank/error captures.
- Typecheck: passed.
- GPT-taste hard gate: passed with `--max-warnings=0`.
- Playwright smoke: 13/13 passed.

## Not Run

- `make praxis-validate-all` was not run because this was a documentation and screenshot refresh, not a proof or backend behavior change. Use that gate when proof artifacts, FieldLab behavior, Docker, or backend release claims change.
