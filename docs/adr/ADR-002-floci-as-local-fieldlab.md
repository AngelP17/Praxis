# ADR-002: Floci as Local FieldLab

## Status
Accepted

## Context
Praxis needs a way for solutions engineers and forward-deployed engineers to reproduce customer workflows locally before touching production infrastructure.

## Decision
Use Floci (local AWS emulator) as the "Praxis FieldLab" — a local AWS-compatible environment for simulating customer signals, cloud services, queueing, event storage, audit artifacts, workflow decisions, and business impact.

## Rationale
1. **No cloud credentials required**: Runs entirely local via Docker
2. **AWS SDK compatibility**: Uses standard boto3 SDK through `http://localhost:4566`
3. **Full service coverage**: S3, SQS, DynamoDB, EventBridge, Lambda
4. **Credible demo artifact**: Shows real operational workflows without cloud dependencies
5. **Recruiter-friendly**: Proves infrastructure understanding in a self-contained repo

## Consequences
- `infrastructure/floci/` directory with docker-compose, terraform, bootstrap
- FieldLab API routes for run management and event flow
- Pipeline adapters for fieldlab producer/consumer patterns
- CI workflow (`fieldlab-proof.yml`) to validate FieldLab integrity on every push
