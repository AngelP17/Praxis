# ADR 0006: Use Solution Packs as Repeatable Field Deployment Units

## Status
Accepted

## Context
Deploying Praxis into different industrial domains (e.g. printer configuration monitoring, network edge failovers, database monitoring) requires customized schemas, events, ontology rules, and ROI models. If these are hardcoded into the platform's core code, the platform becomes brittle and impossible to scale or maintain across different environments.

## Decision
We organize operational knowledge and configurations into self-contained, repeatable deployment units called **Solution Packs**.
Each solution pack is a directory check-in under `solution-packs/` containing:
- `scenario.yaml`: core metadata and scenario definitions.
- `customer-context.md`: enterprise/operational background snapshot.
- `sample-events.jsonl`: representative operational events.
- `ontology.yaml`: local ontology compilers and mapping rules.
- `roi-model.yaml`: local ROI parameters.
- `expected-output/`: reference outputs for out-of-band verification.

## Alternatives Considered
- **Single Central Database**: Storing all configurations in database tables. Rejected because it prevents version-controlling operational logic and compromises portability.
- **Dynamic Configuration Endpoint**: Sourcing configs from a remote API. Rejected due to vulnerability to network outages in offline edge zones.

## Consequences
### Positive
- Strict isolation of domains: a bug in the printer GPO pack cannot affect the network failover pack.
- Version-controlled operational intelligence: changes to ontology rules are tracked via git.
- Rapid deployment: new use cases are added simply by creating a new directory.

### Negative
- Duplication of common configurations (e.g., standard metrics) across packs.
- Requires building directory validators to ensure pack completeness.

## How this is verified
- Enforced at compile-time by `validate_solution_pack.py` which iterates over every solution pack directory and verifies the existence of all required configuration and expected-output files.
- Enforced in CI by `.github/workflows/solution-pack-validation.yml`.
