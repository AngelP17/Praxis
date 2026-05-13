# Validation and Quality Gates

This guide records commands that exist in the current repository. If a command here conflicts with `Makefile`, `package.json`, `apps/web/package.json`, or `.github/workflows/*.yml`, trust the executable file and update this guide.

## Local Setup

```bash
make install
```

`make install` creates `.venv`, installs the editable Python packages, and runs `pnpm install` in `apps/web`.

Runtime versions are derived from local manifests and CI:

- Python: `>=3.11` locally; GitHub Actions uses `3.12`.
- Node: GitHub Actions uses `22`.
- pnpm: root `package.json` pins `pnpm@10.29.3`.
- Docker: required for Floci/FieldLab verification.

## Python Gates

```bash
make lint
make test
make praxis-test
```

- `make lint` runs `ruff check apps packages services`.
- `make test` runs `pytest tests/unit tests/integration -v`.
- `make praxis-test` runs `pytest tests/praxis tests/integration -v`.

The CI workflow also runs selected Astraea reasoning tests:

```bash
pytest tests/astraea/test_provenance.py \
       tests/astraea/test_counterfactual.py \
       tests/astraea/test_causal_replay.py \
       tests/astraea/test_integrity.py \
       tests/astraea/test_calibration.py \
       tests/astraea/test_benchmarks.py -v
```

## Frontend Gates

Run root scripts when possible so the commands match the monorepo setup:

```bash
pnpm web:typecheck
pnpm web:build
pnpm web:test:smoke
pnpm web:lint:gpt-taste:ci
```

- `pnpm web:typecheck` filters to `praxis-web` and runs `tsc --noEmit`.
- `pnpm web:build` filters to `praxis-web` and runs `next build`.
- `pnpm web:test:smoke` runs Playwright smoke specs in `apps/web/tests/*.smoke.spec.ts`.
- `pnpm web:lint:gpt-taste:ci` runs the custom GPT-taste ESLint config.

`pnpm web:lint:gpt-taste:ci` runs with `--max-warnings=0`. Any warning fails the script — this is the canonical local gate. A separate `lint:gpt-taste:json` variant is available for tooling that needs JSON output (it does not enforce the warning cap and exists only for reporting).

CI caveat: `.github/workflows/ci.yml` `gpt-taste-qa` invokes `pnpm lint:gpt-taste` (the non-strict text variant) and is marked `continue-on-error: true`. The CI job is therefore advisory. Run the strict `:ci` script locally and treat its failure as the authoritative signal until the workflow is hardened.

For readable local GPT-taste output:

```bash
cd apps/web
pnpm lint:gpt-taste
```

## FieldLab And Proof Gates

FieldLab commands require Docker and the local Floci service.

```bash
make praxis-fieldlab-up
make praxis-proof
make praxis-benchmark
make praxis-floci-verify
make praxis-canvas-verify
make praxis-proof-hashes
make praxis-fieldlab-down
```

The strict combined gate is:

```bash
make praxis-fieldlab-up
make praxis-validate-all
make praxis-fieldlab-down
```

`make praxis-validate-all` chains `make lint`, `make test`, `make praxis-benchmark`, `make praxis-floci-verify`, `make praxis-canvas-verify`, and `make praxis-proof-hashes`. If Docker or Floci is unavailable, record that as the blocker instead of substituting a weaker command silently.

Generated proof outputs live under `artifacts/latest/`:

- `praxis_proof.json`
- `proof-summary.md`

Regenerate these through `make praxis-proof`; do not hand-edit them.

## Solution Pack Gates

```bash
make praxis-validate-pack
make praxis-benchmark
```

`make praxis-validate-pack` validates `solution-packs/manufacturing-printer-gpo`. The `solution-pack-validation` workflow iterates over every directory under `solution-packs/` and runs `scripts/validate_solution_pack.py`.

## Demo Gates

```bash
make demo
make demo-seed
make demo-validate
make clean-demo
```

`make demo` starts the API gateway, platform service, decision service, and web app. `make demo-seed` loads a deterministic scenario, and `make demo-validate` checks the flagship path. These commands assume dependencies are installed and the local ports are available.

## CI Gates

GitHub Actions currently include:

- `.github/workflows/ci.yml`: Python unit/integration tests, selected Astraea reasoning tests, TypeScript check, Next build, production pnpm audit, GPT-taste QA, and TruffleHog secret scan.
- `.github/workflows/fieldlab-proof.yml`: solution-pack validation, Floci startup, proof emission, proof verification, determinism check, benchmarks, algorithm smoke tests, and best-effort Sigstore signing.
- `.github/workflows/solution-pack-validation.yml`: validation of all solution pack directories.

## Choosing A Narrow Verification Set

- Documentation-only change: targeted `rg` checks plus the nearest doc-specific verification, such as `make praxis-canvas-verify` for canvas docs or `make praxis-proof-hashes` for proof docs.
- Python-only change: `make lint` and `make test`; add `make praxis-test` for Praxis algorithms or FieldLab-adjacent logic.
- Frontend route/component change: `pnpm web:typecheck`, `pnpm web:lint:gpt-taste:ci`, `pnpm web:build`, and smoke tests when links/routes or browser behavior changed.
- FieldLab/proof change: bring Floci up, run the proof and benchmark commands, verify Floci, then bring Floci down.
- Screenshot/visual change: run the web app, capture or inspect the affected pages, and report screenshot paths. Refresh committed screenshots only when the task asks for it.

## Done When

- The requested change is complete without unrelated behavior changes.
- Commands run, pass/fail results, skipped checks, and exact blockers are reported.
- Generated files, local databases, screenshots, and build outputs are not edited unless the task explicitly requires it.
- Documentation reflects executable commands and current repo conventions.
- UI claims include screenshot evidence or a clear reason screenshots were not captured.
