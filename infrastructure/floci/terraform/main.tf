module "sqs" {
  source = "./sqs.tf"
}

module "s3" {
  source = "./s3.tf"
}

module "dynamodb" {
  source = "./dynamodb.tf"
}

module "eventbridge" {
  source = "./eventbridge.tf"
}
