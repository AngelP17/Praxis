resource "aws_sqs_queue" "praxis_incident_events" {
  name                      = "praxis-incident-events"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 10
}

resource "aws_sqs_queue" "praxis_dead_letter" {
  name                      = "praxis-dead-letter"
  message_retention_seconds = 1209600
}
