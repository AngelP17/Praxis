# ADR 0005: Use FieldLab Local Emulation for Forward-Deployed Proof

## Status
Accepted

## Context
Praxis is designed as a forward-deployed platform, meaning it is deployed directly in remote environments (like factories, edge network closets, or offline security zones). Testing and verifying the system's integration with cloud resources (like S3 buckets, SQS queues, and DynamoDB tables) during dev/CI without an internet connection or real AWS credentials is extremely difficult.

## Decision
We utilize a local emulation framework called **FieldLab** powered by **Floci** (a local LocalStack/SRE substrate).
- Floci mimics S3, SQS, DynamoDB, and EventBridge locally on port 4566.
- The pipeline codebase uses custom local endpoints (`http://localhost:4566`) when running in development or verification environments.
- This allows full integration tests, SQS ingest tests, and proof generation runs to execute offline.

## Alternatives Considered
- **Mocking at Code Level**: Using Python unit test mocks (`unittest.mock`) for S3/SQS client calls. Rejected because it does not test real networking, concurrency, or wire serialization issues.
- **Shared AWS Dev Account**: Rejected because it requires active internet connectivity, credential management, and incurs operational costs.

## Consequences
### Positive
- Enables 100% offline development and complete local integration verification.
- Guarantees identical execution between developer laptops and sandboxed CI runners.
- Eliminates cloud hosting costs during development and PR testing.

### Negative
- Requires a local Docker daemon to run Floci containers.
- LocalStack/Floci may occasionally lag behind real AWS API updates.

## How this is verified
- Verified using `make praxis-floci-verify` and `scripts/check_floci_runtime.py` to check port and endpoint reachability.
- Validated via `test_fieldlab_sqs_to_decision.py` which ingests events from a local SQS queue and validates the full pipeline execution.
