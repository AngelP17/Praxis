# Determinism Guarantees

Praxis decision proofs are **bit-deterministic**: given the same solution pack and the same input events, every run produces the identical proof hash. This is not aspirational — it is enforced by a CI gate on every push.

## Why This Matters

| Concern | Determinism Property |
|---------|---------------------|
| **Auditability** | Regulators and auditors can replay any historical decision and verify the exact same outcome. |
| **Dispute Resolution** | If two parties disagree about a decision, they can run the same inputs and compare hashes. A hash mismatch proves drift. |
| **CI Integrity** | Every commit that changes scoring logic produces a detectable hash change. The determinism gate catches unintentional drift at the PR level. |
| **Reproducibility** | Forward-deployed engineers can run the same proof locally, in CI, or in a customer's environment and get identical results. |

## CI Enforcement

The determinism gate runs on every push and pull request via `.github/workflows/fieldlab-proof.yml`:

```
1. Generate proof A from solution-pack events
2. Generate proof B from the same solution-pack events
3. Assert proof_hash_A == proof_hash_B
4. Fail the build if hashes diverge
```

Script: `scripts/check_replay_determinism.py`

## Local Verification

```bash
python scripts/check_replay_determinism.py --solution-pack manufacturing-printer-gpo
```

Expected output: `DETERMINISM GATE: PASSED`

## What Breaks Determinism

- Non-deterministic random number generators (the codebase uses `SeededRandom` everywhere)
- Clock-dependent logic (timestamps use fixed seeds, not `datetime.now()`)
- Hash-order-dependent iteration (all hashing uses `sort_keys=True` canonical JSON)
- External API calls during proof generation (proof building is pure computation)

## Scope

Determinism applies to the proof generation layer (`packages/astraea-core/astraea/praxis/proof_object.py`). The live Floci runtime path includes network I/O and transient state, which is intentionally not bit-deterministic per-run but produces deterministic replay artifacts when the same events are replayed.

## Related

- [Praxis Proof Protocol v0.1](docs/spec/praxis-proof-protocol.md)
- [Proof Object Schema](docs/spec/proof-object.schema.json)
- [Whitepaper](docs/whitepaper/praxis-proof-protocol.md)
