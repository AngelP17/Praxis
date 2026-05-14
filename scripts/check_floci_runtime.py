#!/usr/bin/env python3
"""Check if Floci local AWS runtime is healthy and responsive (boto3-based, no aws CLI needed)."""

import sys
import urllib.request

FLOCI_URL = "http://localhost:4566"
REGION = "us-east-1"
DUMMY_CREDS = {"aws_access_key_id": "test", "aws_secret_access_key": "test"}


def check_health() -> bool:
    """Return True if Floci responds with HTTP 200 on its health endpoint."""
    try:
        req = urllib.request.Request(f"{FLOCI_URL}/_floci/health", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


def check_s3() -> tuple[bool, str]:
    try:
        import boto3
        s3 = boto3.client("s3", endpoint_url=FLOCI_URL, region_name=REGION, **DUMMY_CREDS)
        s3.list_buckets()
        return True, "ok"
    except Exception as exc:
        return False, str(exc)


def check_sqs() -> tuple[bool, str]:
    try:
        import boto3
        sqs = boto3.client("sqs", endpoint_url=FLOCI_URL, region_name=REGION, **DUMMY_CREDS)
        sqs.list_queues()
        return True, "ok"
    except Exception as exc:
        return False, str(exc)


def check_dynamodb() -> tuple[bool, str]:
    try:
        import boto3
        ddb = boto3.client("dynamodb", endpoint_url=FLOCI_URL, region_name=REGION, **DUMMY_CREDS)
        ddb.list_tables()
        return True, "ok"
    except Exception as exc:
        return False, str(exc)


def main() -> int:
    checks: list[tuple[str, bool, str]] = []

    healthy = check_health()
    checks.append(("Floci health endpoint (port 4566)", healthy, "" if healthy else "not reachable"))

    ok, msg = check_s3()
    checks.append(("S3 list buckets", ok, msg if not ok else ""))

    ok, msg = check_sqs()
    checks.append(("SQS list queues", ok, msg if not ok else ""))

    ok, msg = check_dynamodb()
    checks.append(("DynamoDB list tables", ok, msg if not ok else ""))

    print("=" * 50)
    print("Floci Runtime Check Report")
    print("=" * 50)

    all_pass = True
    for name, result, detail in checks:
        status = "PASS" if result else "FAIL"
        if not result:
            all_pass = False
        suffix = f"  ({detail})" if detail else ""
        print(f"  [{status}] {name}{suffix}")

    print("=" * 50)
    if all_pass:
        print("RESULT: ALL CHECKS PASSED")
        return 0
    else:
        print("RESULT: SOME CHECKS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
