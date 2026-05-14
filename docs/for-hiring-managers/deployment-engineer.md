# Praxis for Deployment Engineer

## What this role needs to prove

Deployment Engineer candidates need to show they can connect messy customer operations to a working technical proof, explain the risk boundary, and translate the result into value.

## How Praxis proves it

Praxis demonstrates Floci runtime, validation commands, deterministic replay, proof archive.

## Demo path

1. Open /why-praxis.
2. Open /fieldlab?pack=manufacturing-printer-gpo.
3. Click Run FieldLab.
4. Approve the recommended action.
5. Verify the proof hash shown in the proof viewer.

## Commands to run

```bash
make praxis-proof
.venv/bin/pytest tests/praxis -q
pnpm web:typecheck
pnpm web:build
```

## Screens to open

- /fieldlab
- /proof/proof_praxis_manufacturing_printer_gpo_001?pack=manufacturing-printer-gpo
- /why-praxis

## Artifacts to inspect

- artifacts/latest/praxis_proof.json
- artifacts/latest/proof-summary.md
- solution-packs/manufacturing-printer-gpo/expected-output/proof.json

## Interview talking points

Praxis is strongest when the interviewer asks how a customer-facing engineer proves a solution before production access. The answer is the field loop: solution pack, local runtime, computed decision, human action, verified proof, and value case.
