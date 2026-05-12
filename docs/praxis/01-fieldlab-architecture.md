# Praxis FieldLab Architecture

## Overview

Praxis FieldLab lets a solutions engineer or forward-deployed engineer reproduce a customer workflow locally before touching production infrastructure using Floci, a local AWS emulator.

## Components

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| SQS Queue | `praxis-incident-events` | Customer event ingestion |
| DLQ | `praxis-dead-letter` | Failed event replay |
| S3 | `praxis-raw-events` | Raw event archives |
| S3 | `praxis-audit-artifacts` | Decision audits and replay artifacts |
| S3 | `praxis-solution-pack-assets` | Solution pack configuration |
| DynamoDB | `PraxisIncidentState` | Incident operational state |
| DynamoDB | `PraxisReplayIndex` | Replay hash index |
| DynamoDB | `PraxisValueCase` | Value case storage |
| EventBridge | `praxis-workflow-events` | Workflow event routing |

## Network Architecture

All services communicate over localhost. No external network access required for demo scenarios.

## Usage

```bash
make praxis-fieldlab-up     # Start
make praxis-fieldlab-down   # Stop
```
