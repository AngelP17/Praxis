# Praxis FieldLab

Local AWS-compatible environment for customer workflow simulation.

## Components

- **Floci**: AWS SDK/CLI-compatible local service emulator at `http://localhost:4566`
- **SQS**: Event queues (praxis-incident-events, praxis-dead-letter)
- **S3**: Audit and evidence archives (praxis-raw-events, praxis-audit-artifacts, praxis-solution-pack-assets)
- **DynamoDB**: Operational state tables (PraxisIncidentState, PraxisReplayIndex, PraxisValueCase)
- **EventBridge**: Workflow event bus (praxis-workflow-events)

## Usage

```bash
# Start FieldLab
docker compose up -d
./bootstrap.sh

# Seed sample data
./seed-fieldlab.sh

# Stop FieldLab
docker compose down
```

## Terraform (optional)

```bash
cd terraform
terraform init
terraform apply -auto-approve
```
