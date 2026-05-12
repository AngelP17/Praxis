#!/bin/bash
set -euo pipefail

echo "=== Praxis FieldLab Seed ==="

ENDPOINT="http://localhost:4566"
REGION="us-east-1"

# Seed sample events to SQS
echo "Seeding sample incident events..."
for i in $(seq 1 5); do
  aws --endpoint-url="$ENDPOINT" sqs send-message \
    --queue-url "$ENDPOINT/000000000000/praxis-incident-events" \
    --message-body "{\"event_type\":\"printer_failure_$i\",\"site\":\"Georgia\",\"asset\":\"WEIFPS01\",\"severity\":\"high\"}" \
    --region "$REGION" 2>/dev/null || true
done

# Upload sample to S3
echo "Seeding S3 audit artifacts..."
echo '{"status":"healthy","initialized":true}' | aws --endpoint-url="$ENDPOINT" s3 cp - s3://praxis-audit-artifacts/seed-manifest.json --region "$REGION" 2>/dev/null || true

echo "FieldLab seeded."
