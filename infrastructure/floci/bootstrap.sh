#!/bin/bash
set -euo pipefail

echo "=== Praxis FieldLab Bootstrap ==="
echo ""

# Wait for Floci to be ready
echo "Waiting for Floci to be ready..."
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

for i in $(seq 1 30); do
  if curl -s http://localhost:4566/_floci/health > /dev/null 2>&1; then
    echo "Floci is ready."
    break
  fi
  echo "  Attempt $i/30..."
  sleep 2
done

# Create SQS queues
echo "Creating SQS queues..."
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name praxis-incident-events --region us-east-1 2>/dev/null || true
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name praxis-dead-letter --region us-east-1 2>/dev/null || true

# Create S3 buckets
echo "Creating S3 buckets..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://praxis-raw-events --region us-east-1 2>/dev/null || true
aws --endpoint-url=http://localhost:4566 s3 mb s3://praxis-audit-artifacts --region us-east-1 2>/dev/null || true
aws --endpoint-url=http://localhost:4566 s3 mb s3://praxis-solution-pack-assets --region us-east-1 2>/dev/null || true

# Create DynamoDB tables
echo "Creating DynamoDB tables..."
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name PraxisIncidentState \
  --attribute-definitions AttributeName=incident_id,AttributeType=S \
  --key-schema AttributeName=incident_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 2>/dev/null || true

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name PraxisReplayIndex \
  --attribute-definitions AttributeName=replay_hash,AttributeType=S \
  --key-schema AttributeName=replay_hash,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 2>/dev/null || true

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name PraxisValueCase \
  --attribute-definitions AttributeName=value_case_id,AttributeType=S \
  --key-schema AttributeName=value_case_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 2>/dev/null || true

# Create EventBridge bus
echo "Creating EventBridge event bus..."
aws --endpoint-url=http://localhost:4566 events create-event-bus --name praxis-workflow-events --region us-east-1 2>/dev/null || true

echo ""
echo "=== Praxis FieldLab Ready ==="
echo "  SQS:     praxis-incident-events, praxis-dead-letter"
echo "  S3:      praxis-raw-events, praxis-audit-artifacts, praxis-solution-pack-assets"
echo "  DynamoDB: PraxisIncidentState, PraxisReplayIndex, PraxisValueCase"
echo "  Events:   praxis-workflow-events"
