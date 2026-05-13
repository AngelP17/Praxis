# Praxis Verification

This folder is for durable evidence from local or CI validation runs.

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
