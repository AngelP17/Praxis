# Praxis Verification

This folder is for durable evidence from local or CI validation runs.

For the authoritative agent-entry guide covering all commands, setup paths, and source-of-truth hierarchy, see `AGENTS.md` at the repo root.
For the compact verification matrix, see `docs/13-validation-and-quality-gates.md`.

## End-To-End FieldLab Proof

Run this sequence when you need to prove the full local FieldLab workflow:

```bash
make install
make praxis-fieldlab-up
make praxis-validate-all 2>&1 | tee docs/verification/YYYY-MM-DD-validation.log
make praxis-fieldlab-down
```

`make praxis-validate-all` chains:

- `make lint`
- `make test`
- `make praxis-benchmark`
- `make praxis-floci-verify`
- `make praxis-canvas-verify`
- `make praxis-proof-hashes`

The Floci verification step requires Docker and the local Floci service on `http://localhost:4566`. If Floci is not running, that failure is expected and should be recorded as the blocker.

When recording a blocker, include:

- the exact command attempted
- the specific blocker
- whether the blocker is expected in the current environment

## Proof Artifacts

The proof path writes generated artifacts under `artifacts/latest/`:

- `praxis_proof.json`
- `proof-summary.md`

These files are generated outputs. Regenerate them with `make praxis-proof` instead of hand-editing them.

## Summary Template

When preserving a run, create `docs/verification/SUMMARY.md` with:

- git SHA
- date and local timezone
- Floci endpoint
- commands run
- pass/fail result per command
- exact blockers for skipped or failed checks
