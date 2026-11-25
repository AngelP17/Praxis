# Claim-to-proof matrix

| Claim | Code / verification | Scope |
|---|---|---|
| Deterministic proof hashes | scripts/verify_cross_process.py; scripts/check_replay_determinism.py | Fixture packs; separate Python processes and hash seeds |
| Proof integrity | tests/praxis/test_protocol_adversarial.py; tests/praxis/test_proof_cli_parity.py | L0 integrity relative to a trusted hash, not signer identity |
| Emulated AWS integration | scripts/run_fieldlab_demo.py --strict-runtime | SQS consumption and S3/DynamoDB readback; EventBridge publish acknowledgement; no fallback allowed |
| Human approval | tests/integration/test_decision_spine.py | Workflow implementation; demo action is synthetic |

CI publishes proof and cross-process evidence tied to the workflow commit. Strict mode builds the proof from events read from an isolated queue after comparing payload multiplicity and restoring fixture order. EventBridge downstream delivery is not verified; only publish acknowledgements are checked. Sigstore is optional; L0 is not authentication. No public production deployment is asserted. Branch results are pending.
