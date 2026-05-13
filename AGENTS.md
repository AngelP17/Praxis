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

## Setup

- Install everything: `make install`
- Python environment: `.venv` is created by `make install`.
- Frontend package manager: `pnpm@10.29.3` from the root `package.json`.
- Python: `pyproject.toml` requires Python `>=3.11`; CI currently uses Python `3.12`.
- Node: CI uses Node `22`.
- FieldLab runtime dependencies, including `boto3`, are declared in `packages/pipelines/pyproject.toml` and installed by `make install`.
- Docker is required for Floci/FieldLab targets such as `make praxis-fieldlab-up`, `make praxis-floci-verify`, and `make praxis-validate-all`.

## Common Commands

- Full monorepo dev: `make demo`
- Seed flagship scenario: `make demo-seed`
- Validate flagship path: `make demo-validate`
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

## Praxis-Specific Commands

- FieldLab up: `make praxis-fieldlab-up`
- FieldLab down: `make praxis-fieldlab-down`
- Run flagship demo: `make praxis-demo`
- Validate solution pack: `make praxis-validate-pack`
- Generate executive readout: `make praxis-readout RUN_ID=<id>`
- Generate and verify proof object: `make praxis-proof`
- Run solution-pack benchmarks: `make praxis-benchmark`
- Praxis algorithm tests: `make praxis-test`
- Verify Floci runtime: `make praxis-floci-verify`
- Verify Praxis canvas/design references: `make praxis-canvas-verify`
- Verify active proof code has no fake hashes: `make praxis-proof-hashes`
- Run full Praxis validation suite: `make praxis-validate-all`

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
- Raw events are intended to be immutable; decision records and evidence are audit artifacts.
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

If a command cannot run because services, ports, dependencies, or credentials are unavailable, record the exact blocker and the command attempted.

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
- Frontend changes pass the GPT-taste/design gate or list concrete remaining violations.
- Documentation changes reflect commands and conventions that exist in this repo, not invented workflow.
- Praxis visual changes follow `docs/praxis/Praxis-Brand-Replication.md` or document the intentional divergence.
- UI claims include a screenshot path or an explicit reason screenshots were not captured.
- CTA/link work includes a route or handler audit for the affected surfaces.
- If the task touched canvas, proof, or generated artifacts, the corresponding verification command is run or the blocker is named.
