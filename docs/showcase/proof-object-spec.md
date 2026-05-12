# Praxis Proof Object Spec

`praxis_proof.json` is the canonical artifact produced by a FieldLab run. It links raw evidence, ontology mapping, decision scoring, human action, replay verification, and business value.

Required sections:

- `evidence`
- `ontology`
- `decision`
- `action`
- `value_case`
- `replay`
- `proof_hash`

Verify with:

```bash
make praxis-proof
```
