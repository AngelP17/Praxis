output "sqs_incident_queue_url" {
  value = aws_sqs_queue.praxis_incident_events.url
}

output "sqs_dead_letter_url" {
  value = aws_sqs_queue.praxis_dead_letter.url
}

output "s3_raw_events_bucket" {
  value = aws_s3_bucket.praxis_raw_events.bucket
}

output "s3_audit_artifacts_bucket" {
  value = aws_s3_bucket.praxis_audit_artifacts.bucket
}

output "dynamodb_incident_table" {
  value = aws_dynamodb_table.praxis_incident_state.name
}

output "eventbridge_bus" {
  value = aws_cloudwatch_event_bus.praxis_workflow_events.name
}
