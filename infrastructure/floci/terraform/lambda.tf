resource "aws_lambda_function" "praxis_event_processor" {
  function_name = "praxis-event-processor"
  role          = "arn:aws:iam::000000000000:role/lambda-role"
  handler       = "index.handler"
  runtime       = "python3.11"

  filename         = null
  source_code_hash = null

  environment {
    variables = {
      PRAXIS_API_URL = "http://host.docker.internal:8000"
    }
  }
}
