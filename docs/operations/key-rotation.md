# Cryptographic Key Management and Rotation

This document specifies the provisioning, storage, rotation, and revocation procedures for **Praxis Proof Protocol (PPP) L1/L2 signing keys**.

---

## 1. Key Generation

PPP L1/L2 utilizes **Ed25519** asymmetric cryptography for signatures. To generate a secure key pair:

```bash
# Generate the private key
openssl genpkey -algorithm ed25519 -out ppp_private_key.pem

# Extract the public key in raw hex (to serve as the verified public key)
openssl pkey -in ppp_private_key.pem -pubout -outform DER | tail -c 32 | xxd -p -c 32 > ppp_public_key.hex
```

---

## 2. Key Storage and Access

- **Private Key**: Private keys must **never** be stored in cleartext files or committed to Git. In production, keys must reside inside an **AWS KMS** or **HashiCorp Vault** HSM. The API Gateway obtains only a one-time delegated signature payload via API.
- **Public Key Registry**: The gateway maintains a persistent public key registry in `users.json` or database tables, associating `signer_kid` with `public_key_hex` and operator identity.

---

## 3. Key Rotation Workflow

To maintain high security, signing keys must be rotated **every 90 days**:

1. **Generate New Key Pair**: Follow Section 1 to produce a new key pair and assign a new unique Key ID (`signer_kid`), e.g., `key_2026_q3`.
2. **Register the New Public Key**: Add the new `signer_kid` and `public_key_hex` to the database registry as `active`.
3. **Transition the Gateway Configuration**: Update the gateway signing service config to sign all *new* proofs using the new key.
4. **Retire the Old Key**: Transition the old key ID in the registry from `active` to `retired`. **Do NOT delete the retired key!** Retired keys are strictly kept to enable verification of historical proofs.

---

## 4. Verifying Historical Proofs with Retired Keys

Because retired keys are retained in the database public key registry, historical proofs can be verified successfully indefinitely:
- When a proof is validated, the verifier extracts `signature.signer_kid`.
- The verifier queries the database registry to locate the public key associated with that ID.
- The verifier validates the signature. If the key is marked as `retired`, validation completes successfully, but a compliance tag is appended noting that the proof was signed under a historically valid retired key.

---

## 5. Compromised Key Emergency Revocation Playbook

If a signing key is leaked or compromised:

1. **Immediate Revocation**: Change the key status in the registry from `active` or `retired` to `REVOKED`.
2. **Halt Gateway Signings**: Instantly change the gateway configuration to stop signing using the compromised Key ID.
3. **Audit Suspicious Proofs**: Identify all proofs signed by the compromised key between the suspected breach timestamp and the revocation timestamp:
   ```sql
   SELECT proof_id FROM proofs WHERE signer_kid = 'compromised_key_id' AND generated_at >= 'breach_timestamp';
   ```
4. **Mark Flagged Proofs**: Tag all affected proofs in the compliance ledger as `SUSPECT - KEY COMPROMISE` and trigger manual SRE/auditor re-evaluation.
