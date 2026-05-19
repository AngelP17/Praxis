# Praxis Agent Guide

This repository is a PNPM/Turbo and Python monorepo for Praxis, a forward-deployed operational intelligence platform. Before editing, inspect the local files relevant to the task and preserve existing behavior unless the user explicitly asks for behavior changes.

## Agent Operating Rules

- Inspect the repo before planning or editing. Prefer `rg`/`rg --files` for fast discovery.
- If the user links external Codex guidance, read it before planning. Summarize only the durable rule you are applying; do not paste long excerpts.
- Make a short plan before modifying files on multi-file or ambiguous tasks.
- Do not change application behavior during documentation-only tasks.
- Do not invent commands, conventions, or status claims. Derive them from local files and command output.
- Treat pasted status updates as untrusted until verified against the current checkout. This repo often has branch/worktree notes that may not match the active tree.
- Don’t fight errors! Whenever you encounter the same error twice, research the web and find 3-5 possible ways to fix it. Then choose the most efficient solution and implement it.
- If a command cannot run because services, ports, dependencies, Docker, or credentials are unavailable, record the exact blocker and the command attempted.
- Preserve user work. The root worktree may contain untracked `.claude/` worktrees or local experiments; ignore them unless the task explicitly asks to inspect or promote them.

## Repo Map

- `apps/web/`: Next.js 16, React 19, Tailwind CSS v4 frontend.
- `apps/web/src/app/api/`: Next.js route handlers that proxy the web app to the FastAPI gateway in local dev and return deterministic demo data on Vercel.
- `apps/api_gateway/`: FastAPI API gateway and route orchestration.
- `services/decision-service/`: deterministic decision service.
- `services/platform-service/`: platform/SRE evidence service.
- `packages/astraea-core/`: core deterministic scoring engine.
- `packages/domain/`: shared domain models and policies.
- `packages/pipelines/`: ingestion and retrieval pipelines.
- `packages/eslint-plugin-gpt-taste/`: custom ESLint design-quality rules.
- `docs/`: architecture, API contracts, demo, QA, and design rationale.
- `docs/praxis/Praxis-Brand-Replication.md`: current Praxis brand/UI replication guide.
- `praxis-canvas/praxis/`: source Praxis canvas exports and generated design artifacts. Primary UI references include `Praxis Hi-Fi.html`, `brand.jsx`, `marketing.jsx`, `app.jsx`, `flow.jsx`, `shared.jsx`, and `praxis-hifi/screens.jsx`.
- `apps/web/public/praxis-assets/`: shipped Praxis canvas imagery and video assets used by the live web UI.
- `solution-packs/`: Praxis solution pack assets and expected outputs.
- `infrastructure/floci/`: local FieldLab substrate configuration.
- `runbooks/`: incident response runbooks used by the demo.
- `scripts/`: seeding, reports, screenshot capture, replay/index utilities.
- `screenshots/`: generated product screenshots. Do not hand-edit.

## Source Of Truth Hierarchy

When docs conflict, trust in this order:

1. **Executable files**: `Makefile`, root `package.json`, `apps/web/package.json`, `.github/workflows/*.yml`
2. **`AGENTS.md`** (this file): authoritative agent-entry guide, derived from executables
3. **`docs/13-validation-and-quality-gates.md`**: human-readable gate reference, derived from executables
4. **Other `docs/` files**: narrative and product context; may lag behind executables

If a command in any doc conflicts with the Makefile or a workflow file, the executable is correct. Fix the doc.

## Fast Start For Codex

- Start with `AGENTS.md`, then inspect the executable sources you actually need: `Makefile`, root `package.json`, `apps/web/package.json`, and any relevant workflow under `.github/workflows/`.
- Use `README.md` for product overview, runtime modes, and human-oriented repo orientation.
- Use `docs/13-validation-and-quality-gates.md` when you need a compact verification matrix.
- Use `docs/verification/README.md` when the task is preserving a durable validation run or proof log.
- Treat other `docs/` content as architecture, product, or narrative context unless the task explicitly targets those docs.

## Setup

- **Full install** (Python venv + Node deps): `make install`
  - Creates `.venv`, installs editable Python packages (`.` `packages/astraea-core` `packages/domain` `packages/pipelines`), then runs `pnpm install` in `apps/web`.
- **Frontend-only install**: `pnpm install` (from repo root, no Python setup)
- **Workspace note**: root `pnpm install` uses the workspace lockfile and installs Node dependencies for the monorepo; `make install` is still the standard setup path when Python-backed services or verification commands are involved.
- **Combined reinstall**: `make praxis-install` (runs `pnpm install` + Python venv setup)
- Python: `pyproject.toml` requires Python `>=3.11`; CI currently uses Python `3.12`.
- Node: CI uses Node `22`; pnpm is pinned at `pnpm@10.29.3` in root `package.json`.
- FieldLab runtime dependencies, including `boto3`, are declared in `packages/pipelines/pyproject.toml` and installed by `make install`.
- Docker is required for Floci/FieldLab targets such as `make praxis-fieldlab-up`, `make praxis-floci-verify`, and `make praxis-validate-all`.

## Common Commands

- Full monorepo dev: `make demo`
- Seed flagship scenario: `make demo-seed`
- Validate flagship path: `make demo-validate`
- Reset demo state: `make demo-reset`
- Stop demo processes: `make clean-demo`
- API gateway dev: `make dev-api`
- Platform service dev: `make dev-platform`
- Decision service dev: `make dev-decision`
- Web dev: `make dev-web` or `pnpm web:dev`
- Python tests: `make test`
- Python lint: `make lint`
- Python format: `make format`
- Frontend build: `pnpm web:build`
- Frontend typecheck: `pnpm web:typecheck`
- Frontend smoke tests: `pnpm web:test:smoke`
- GPT-taste design lint: `pnpm web:lint:gpt-taste:ci`
- GPT-taste local text output: from `apps/web/`, `pnpm lint:gpt-taste`
- Root Turbo build: `pnpm build`
- Root Turbo typecheck: `pnpm typecheck`
- Package install from root: `pnpm install`

## Publishability Reality Check

- Praxis is a flagship public demo and technical proof system, with a functional but not fully productized backend production path.
- The verified paths today are the frontend-only public demo (`NEXT_PUBLIC_DEMO_MODE=1`) and the local FieldLab proof (`make praxis-proof`).
- The Docker Compose self-hosted path (`docker-compose.yml` + `docker-compose.prod.yml`) is the recommended backend deployment target. CI now includes a Docker Compose production-proof job in `.github/workflows/ci.yml`, and the first observed green PR run is recorded in `docs/verification/2026-05-19-docker-compose-production-proof.md`. Treat post-merge `main` verification as a separate check until that run exists.
- Do not describe Praxis as fully public-production-ready unless you verify both the frontend and backend release path in the current checkout.
- The root `vercel.json` is intentionally frontend-only. Do not reintroduce implicit multi-service Vercel deploy assumptions unless the user explicitly asks for that work.
- For real public production, always inspect:
  - `apps/api_gateway/config.py` (production safety guard)
  - `.env.example`
  - `docker-compose.yml` + `docker-compose.prod.yml` (recommended backend path)
  - `users.json`
  - `docs/architecture/deployment-guide.md`
  - `docs/release/public-launch-checklist.md`
- Treat these as production blockers until verified otherwise:
  - placeholder `SECRET_KEY`
  - localhost-only `ALLOWED_ORIGINS`
  - demo credentials left in `users.json`
  - deployment docs that imply a cloud path not exercised by CI
- The functional-enough production acceptance bar is documented in `docs/release/public-launch-checklist.md` and `docs/architecture/deployment-guide.md`.

## Praxis-Specific Commands

- FieldLab up: `make praxis-fieldlab-up`
- FieldLab down: `make praxis-fieldlab-down`
- Seed operational asset graph: `make praxis-seed-graph`
- Run printer-offline spine demo: `make praxis-printer-slice`
- Run flagship demo: `make praxis-demo`
- Validate solution pack: `make praxis-validate-pack`
- Generate executive readout: `make praxis-readout RUN_ID=<id>`
- Generate and verify proof object: `make praxis-proof`
- Open proof summary in browser: `make praxis-proof-open`
- Run solution-pack benchmarks: `make praxis-benchmark`
- Praxis algorithm tests: `make praxis-test`
- Verify Floci runtime: `make praxis-floci-verify`
- Verify Praxis canvas/design references: `make praxis-canvas-verify`
- Verify active proof code has no fake hashes: `make praxis-proof-hashes`
- Run full Praxis validation suite: `make praxis-validate-all`
- Run a single scenario: `make praxis-run-scenario SCENARIO=<name>`
- Run all registered scenarios: `make praxis-run-all-scenarios`
- Benchmark all scenarios: `make praxis-scenario-benchmark`
- Sync Python scenarios to frontend artifact: `make praxis-sync-frontend-scenarios`
- Run full flagship proof (validate, run, benchmark, proof, sync): `make praxis-flagship-proof`

## End-To-End Runtime Proof

Use this sequence when the task is to prove Praxis works end to end:

```bash
make install
make praxis-fieldlab-up
make praxis-proof
make praxis-benchmark
make praxis-floci-verify
make praxis-canvas-verify
make praxis-proof-hashes
make praxis-fieldlab-down
```

For the strict combined gate, run `make praxis-validate-all` after `make praxis-fieldlab-up`. It chains Python lint, core/integration tests, benchmarks, Floci verification, canvas integrity, and proof-hash integrity. If Floci is not running, `make praxis-floci-verify` and `make praxis-validate-all` are expected to fail; start it with `make praxis-fieldlab-up` first.

The proof path emits `artifacts/latest/praxis_proof.json` and `artifacts/latest/proof-summary.md`. Treat those as generated verification artifacts.

## Frontend Design System

- Praxis is the current UI/UX minimum standard. Start new flagship surfaces from `apps/web/src/components/praxis/` and the replication guide.
- Minimum design references are `praxis-canvas/praxis/Praxis Wireframes.html`, `praxis-canvas/praxis/praxis-hifi/screens.jsx`, `praxis-canvas/praxis/flow.jsx`, and the cinematic operator video copied to `apps/web/public/praxis-assets/field-operator-loop.mp4`.
- The previous V3 workbench implementation now lives under `apps/web/src/components/praxis/workbench-v3/` and `apps/web/src/styles/praxis-workbench.css`; keep new imports under `components/praxis`.
- Use `Geist`, `Geist Mono`, and `Outfit`; do not introduce `Inter`.
- Use `@phosphor-icons/react` or existing V3 SVG primitives. Do not add emojis in code, markup, labels, comments, or alt text.
- Tailwind is v4. Do not add Tailwind v3-only config patterns. The project uses `@tailwindcss/postcss` in `apps/web/postcss.config.js`.
- Use `min-h-[100dvh]` for viewport-height surfaces. Avoid `h-screen`.
- Bento/grid layouts should use CSS Grid and `grid-flow-dense` where Tailwind grids are used.
- Praxis palette: Obsidian `#0A0A14`, Onyx `#13121F`, Mineral `#1C1A2E`, Hairline `#2A263F`, Bone `#F1EDDF`, Ash `#86819F`, Iron `#48455A`, Plasma Violet `#8B5CFF`, Argon Mint `#3EFFA8`. Source of truth: `praxis-canvas/praxis/Praxis Hi-Fi.html`.
- Tokens live in `apps/web/src/app/globals.css` under `:root`: `--praxis-plasma`, `--praxis-argon`, `--praxis-obsidian`, `--praxis-surface`, `--praxis-surface-2`, `--praxis-line`, `--praxis-hairline`, `--praxis-bone`, `--praxis-mute`, `--praxis-faint`, `--praxis-crit`. Legacy names `--praxis-violet`, `--praxis-mint`, `--praxis-bg`, `--praxis-panel`, `--praxis-panel-alt`, `--praxis-muted` are aliases kept for back-compat and resolve to canvas values.
- Raw hex colors are forbidden in components. Use `var(--praxis-*)` in JSX `style={}`, SVG color attrs (fill / stroke / stopColor / color / floodColor), and variable declarations. The `gpt-taste/no-raw-hex` rule (`packages/eslint-plugin-gpt-taste/src/rules/no-raw-hex.ts`) enforces this. To add a color, edit `globals.css` first, then reference the var.
- Praxis logo must be mono. Do not use orange/amber accents or an orange logo arm.
- Prefer editorial/cinematic operator layouts, dense workbench data, mono labels, gapless bento grids, pinned GSAP sections, scrubbed text reveals, and card stacking where motion improves comprehension.
- Do not use orange/black as the dominant Praxis palette, cobalt/amber pairings, purple-blue AI gradients, neon outer glows, pure black, generic 3-column card rows, generic names, fake-perfect numbers, or Unsplash URLs.
- Keep loading, error, and empty states when replacing frontend surfaces.

## Backend And Data Conventions

- Determinism matters. Decision scoring, replay hashes, and audit records should remain reproducible for the same inputs.
- Human-in-the-loop is a product constraint. Do not add unilateral automation paths unless explicitly requested.
- Prefer shared domain models in `packages/domain/` and existing service APIs over duplicating shapes.
- CloudEvents 1.0 are accepted on the existing ingest/evaluate path. The shared contract lives in `packages/domain/domain/events.py` and should be imported as `domain.events`.
- Raw events are intended to be immutable; decision records and evidence are audit artifacts.
- The operational-resilience spine uses `apps/api_gateway/services/graph_service.py`, `packages/astraea-core/astraea/praxis_decision.py`, `infrastructure/db/models/asset_edge.py`, and `infrastructure/db/models/outbox_message.py`.
- The Floci-backed FieldLab path uses `packages/pipelines/pipelines/fieldlab/floci_*.py`, `apps/api_gateway/services/fieldlab_service.py`, and `scripts/run_fieldlab_demo.py`. Keep SQS/S3/DynamoDB/EventBridge behavior deterministic and locally reproducible.
- SQLite files such as `praxis.db`, `test_praxis.db`, and `.venv/` are local artifacts and should not be edited manually.

## New Praxis API Routes

The API gateway now includes these Field-Deployed routes in addition to the core incident/decision routes:

| Prefix | Tags | Purpose |
|--------|------|---------|
| `/api/fieldlab` | fieldlab | FieldLab run management, event ingestion, replay, executive readout |
| `/api/solution-packs` | solution-packs | Solution pack catalog, validation, launch, readiness |
| `/api/ontology` | ontology | Ontology compilation, objects, links, actions, simulate |
| `/api/value-cases` | value-cases | Value case creation, recalculation, executive summary |
| `/api/deployment-plans` | deployment-plans | Deployment plans, risk register, security review |
| `/api/discovery` | discovery | Customer signal discovery, solution pack matching |

New algorithms live in `packages/astraea-core/astraea/praxis/`:
- `ontology_compiler.py` — Maps messy data to structured operational model
- `evidence_trust.py` — Grades evidence quality (6 dimensions)
- `use_case_score.py` — Scores whether a use case is worth pursuing (9 factors)
- `value_of_information.py` — Ranks missing fields by expected confidence gain
- `intervention_planner.py` — Governs actions by safety mode (5 levels)
- `expansion_graph.py` — Shows adjacent use cases and expansion scores
- `causal_graph.py` — Dependency centrality scoring
- `praxis_decision_engine.py` — 10-factor priority scoring with evidence trust

## Files To Avoid Editing

- `node_modules/`, `.venv/`, `.pytest_cache/`, `.ruff_cache/`, `.next/`, and build outputs.
- `apps/web/tsconfig.tsbuildinfo` and other local build caches.
- `pnpm-lock.yaml` unless dependencies actually change.
- Generated screenshots in `screenshots/` and `docs/demo/screenshots/` unless the task is screenshot refresh.
- Generated verification artifacts under `artifacts/latest/`, including `praxis_proof.json` and `proof-summary.md`, unless the task is proof regeneration.
- Generated frontend artifacts: `apps/web/src/lib/generated/scenarios.generated.json` unless the task explicitly regenerates via `make praxis-sync-frontend-scenarios`.
- Local databases: `*.db`, including `praxis.db`, `test_praxis.db`, and `test_aether_sentinel.db`.
- Canvas export zips and uploads under `praxis-canvas/praxis/` unless the task explicitly asks to regenerate or package the design canvas.
- User-created untracked experiments unless the task explicitly asks to promote them.

## Verification Expectations

Pick the narrowest useful checks for the change:

- Python-only changes: `make lint` and `make test`.
- Frontend route/component changes: `pnpm web:typecheck`, `pnpm web:lint:gpt-taste:ci`, and `pnpm web:build`.
- Full-stack/demo changes: `make demo-seed` and `make demo-validate` after services are running.
- FieldLab/proof changes: `make praxis-fieldlab-up`, `make praxis-proof`, `make praxis-floci-verify`, `make praxis-benchmark`, then `make praxis-fieldlab-down`.
- Documentation-only changes: run targeted text searches plus the narrowest relevant checks, such as `make praxis-canvas-verify` when touching design docs or `make praxis-proof-hashes` when touching proof docs.
- Screenshot or visual changes: run the web app, inspect affected pages, and refresh screenshots only when requested.

If a command cannot run because services, ports, dependencies, Docker, or credentials are unavailable, record the exact blocker and the command attempted.

### Blocker Reporting

When a verification command is blocked, report:

1. The exact command attempted
2. The specific blocker (missing service, port conflict, absent dependency, Docker unavailable, etc.)
3. Whether the blocker is expected for the current environment (e.g., Floci not running locally is expected without Docker)

## CI Notes And Current Caveats

- GitHub Actions use Python `3.12`, Node `22`, and pnpm `10.29.3`.
- `.github/workflows/ci.yml` runs Python unit/integration tests, selected Astraea reasoning tests, TypeScript check, Next build, production pnpm audit, gpt-taste QA, and TruffleHog.
- `apps/web/package.json` `lint:gpt-taste:ci` runs with `--max-warnings=0` — any warning fails the script. A separate `lint:gpt-taste:json` variant is kept for tooling that needs JSON output.
- `.github/workflows/ci.yml` `gpt-taste-qa` invokes `pnpm lint:gpt-taste:ci` and is a hard gate — `continue-on-error` is removed. Any GPT-taste warning fails CI.
- `.github/workflows/fieldlab-proof.yml` starts Floci, validates the manufacturing solution pack, emits and verifies a proof, checks determinism, runs benchmarks, and attempts Sigstore signing. Sigstore signing is `continue-on-error: true`.
- `.github/workflows/solution-pack-validation.yml` loops over every directory under `solution-packs/` and runs `scripts/validate_solution_pack.py`.
- `docs/13-validation-and-quality-gates.md` is a human guide; prefer Makefile, package manifests, and workflows when a command conflicts.

## Done When

- The requested behavior or documentation change is implemented without unrelated behavior changes.
- Relevant commands are run and results are reported.
- Any unknowns, blockers, or intentionally skipped checks are explicit.
- Event-spine work is only done when `make praxis-seed-graph` succeeds, `/api/decisions/evaluate` accepts a printer CloudEvent, `/api/decisions/{id}/approve` records feedback plus an outbox row, and `/api/decisions/{id}/replay` reports deterministic hash equality.
- Frontend changes pass the GPT-taste/design gate or list concrete remaining violations.
- Documentation changes reflect commands and conventions that exist in this repo, not invented workflow.
- Documentation updates leave future agents with a clear source-of-truth path, a narrow verification choice, and explicit unknowns where the repo cannot prove a claim locally.
- Praxis visual changes follow `docs/praxis/Praxis-Brand-Replication.md` or document the intentional divergence.
- UI claims include a screenshot path or an explicit reason screenshots were not captured.
- CTA/link work includes a route or handler audit for the affected surfaces.
- If the task touched canvas, proof, or generated artifacts, the corresponding verification command is run or the blocker is named.
