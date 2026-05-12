resource "aws_s3_bucket" "praxis_raw_events" {
  bucket = "praxis-raw-events"
}

resource "aws_s3_bucket" "praxis_audit_artifacts" {
  bucket = "praxis-audit-artifacts"
}

resource "aws_s3_bucket" "praxis_solution_pack_assets" {
  bucket = "praxis-solution-pack-assets"
}
