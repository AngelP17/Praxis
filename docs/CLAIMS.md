# Claim-to-proof matrix

| Claim | Code / verification | Scope |
|---|---|---|
| Deterministic proof hashes | scripts/verify_cross_process.py; scripts/check_replay_determinism.py | Fixture packs; separate Python processes and hash seeds |
| Proof integrity | tests/praxis/test_protocol_adversarial.py; tests/praxis/test_proof_cli_parity.py | L0 integrity relative to a trusted hash, not signer identity |
| Emulated AWS integration | scripts/run_fieldlab_demo.py --strict-runtime | Fixture event publishing, state and archival; no fallback allowed |
| Human approval | tests/integration/test_decision_spine.py | Workflow implementation; demo action is synthetic |

CI publishes proof and cross-process evidence tied to the workflow commit. The strict FieldLab path currently computes decisions from local fixtures, not consumed SQS messages. Do not claim queue-to-decision replay until independently verified. Sigstore is optional; L0 is not authentication. No public production deployment is asserted. Branch results are pending.
