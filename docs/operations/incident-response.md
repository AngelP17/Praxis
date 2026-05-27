# Incident Response Playbook

This runbook defines SRE escalation paths and mitigation procedures for critical operational failures on the **Praxis** platform.

---

## 1. Classification and Response Times

| Severity | Description | Target Response | Target Resolution |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Core decision pipelines down, proof verification mismatch, or key compromise. | $< 15\text{ mins}$ | $< 2\text{ hours}$ |
| **P1 (High)** | Platform available but running in degraded/mock states, or elevated latencies. | $< 30\text{ mins}$ | $< 6\text{ hours}$ |
| **P2 (Medium)** | Non-blocking dashboard issues, reporting anomalies, or non-critical CLI failures. | $< 2\text{ hours}$ | $< 24\text{ hours}$ |

---

## 2. Step-by-Step Incident Scenarios

### Scenario P0-A: API Gateway Unavailable
*   **Symptom**: Health checks failing (`/health`). HTTP 502/504 errors on `/api/...` endpoints.
*   **Remediation Steps**:
    1. Check container running status:
       ```bash
       docker compose ps
       ```
    2. Inspect gateway containers:
       ```bash
       docker compose logs api-gateway --tail=100
       ```
    3. If container crashed due to database connection loss, restart the database container first, then the gateway:
       ```bash
       docker compose restart db
       sleep 5
       docker compose restart api-gateway
       ```

### Scenario P0-B: Decision Service Unavailable
*   **Symptom**: API gateway returns 503 Service Unavailable when invoking decisions.
*   **Remediation Steps**:
    1. Verify background process status.
    2. Check decision service CPU/memory usage to ensure it hasn't encountered an Out Of Memory (OOM) killer.
    3. Restart compose processes:
       ```bash
       docker compose restart decision-service
       ```

### Scenario P0-C: Postgres Database Offline
*   **Symptom**: Logs show `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError)`.
*   **Remediation Steps**:
    1. Inspect Postgres container logs:
       ```bash
       docker compose logs db --tail=50
       ```
    2. Check physical disk usage. If disk space is exhausted ($100\%$ full), clear space immediately.
    3. Recover database and execute a recovery restart:
       ```bash
       docker compose restart db
       ```

### Scenario P0-D: Proof Verification Mismatch (TAMP-ALERT)
*   **Symptom**: Verifier returns `PROOF INVALID` with `proof_hash mismatch`.
*   **Severity**: **P0 (High Security Risk)** - Indicates active tampering of historical database records, or event manipulation!
*   **Remediation Steps**:
    1. Isolate the affected proof artifact JSON immediately.
    2. Re-run the manual verification CLI to locate the mismatch:
       ```bash
       .venv/bin/python scripts/verify_praxis_proof.py <path_to_proof.json>
       ```
    3. Compare the database events with the proof `raw_events` and `ontology` snapshots.
    4. Terminate any active outbox publishers to prevent writebacks on the unverified decision.
    5. Trigger a full security audit review of database access logs.

### Scenario P0-E: Signature Verification Failure (SIG-ALERT)
*   **Symptom**: L1/L2 verifications return `ed25519 signature verification failed`.
*   **Severity**: **P0 (Security Alert)** - Operator key mismatch, or proof forgery!
*   **Remediation Steps**:
    1. Identify the public key and key ID used (`public_key_hex` and `signer_kid`).
    2. Cross-reference the key ID against the authorized operators register.
    3. If the key is valid, check if the payload was modified post-signature (meaning a post-sign tamper attempt).
    4. If the key is not recognized, block the associated IP and rotate credentials immediately.

### Scenario P0-F: Replay Hash Drift (DRIFT-ALERT)
*   **Symptom**: Replay verifies `valid` but `replay_hash` differs from expected.
*   **Remediation Steps**:
    1. Re-run the replay benchmark:
       ```bash
       .venv/bin/python scripts/run_benchmarks.py
       ```
    2. Identify if a recent system update modified ontology compile logic or scoring formulas.
    3. Revert the software build to the last known green commit if the drift is an accidental side effect.

### Scenario P0-G: Compromised Signing Key (KEY-ALERT)
*   **Symptom**: Authorized operator private key is leaked to public repositories or unauthorized personnel.
*   **Remediation Steps**:
    1. Refer to [key-rotation.md](key-rotation.md) immediately.
    2. Mark the compromised `signer_kid` as revoked in the database/OIDC configuration.
    3. All proofs signed by the compromised key after the breach timestamp must be flagged as `SUSPECT` and re-evaluated by human auditors.

### Scenario P0-H: Demo Credentials Exposed
*   **Symptom**: `users.json` contains production credentials or default passwords checked into version control.
*   **Remediation Steps**:
    1. Change default passwords in `users.json` immediately.
    2. Ensure that in production builds, `users.json` is overwritten or credentials are read from environment variables.
    3. Revoke any active session tokens.
