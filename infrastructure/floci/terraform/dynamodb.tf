resource "aws_dynamodb_table" "praxis_incident_state" {
  name         = "PraxisIncidentState"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "incident_id"

  attribute {
    name = "incident_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "praxis_replay_index" {
  name         = "PraxisReplayIndex"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "replay_hash"

  attribute {
    name = "replay_hash"
    type = "S"
  }
}

resource "aws_dynamodb_table" "praxis_value_case" {
  name         = "PraxisValueCase"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "value_case_id"

  attribute {
    name = "value_case_id"
    type = "S"
  }
}
