#!/usr/bin/env python3
"""Check if Floci local AWS runtime is healthy and responsive."""

import subprocess
import sys
import urllib.request

FLOCI_URL = "http://localhost:4566"
MAX_ATTEMPTS = 30
SLEEP_SECONDS = 2


def check_health() -> bool:
    """Return True if Floci responds with HTTP 200 on its health endpoint."""
    try:
        req = urllib.request.Request(f"{FLOCI_URL}/_floci/health", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


def run_aws(service: str, cmd: list[str]) -> tuple[bool, str]:
    """Run an AWS CLI command against Floci endpoint and return (ok, output)."""
    try:
        result = subprocess.run(
            ["aws", "--endpoint-url", FLOCI_URL, service] + cmd,
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        return result.returncode == 0, result.stdout + result.stderr
    except FileNotFoundError as e:
        return False, f"AWS CLI not found: {e}"
    except Exception as e:
        return False, str(e)


def main() -> int:
    checks: list[tuple[str, bool]] = []

    # 1. Health check
    healthy = check_health()
    checks.append(("Floci health endpoint (port 4566)", healthy))

    # 2. S3
    ok, _ = run_aws("s3", ["ls"])
    checks.append(("S3 list buckets", ok))

    # 3. SQS
    ok, _ = run_aws("sqs", ["list-queues"])
    checks.append(("SQS list queues", ok))

    # 4. DynamoDB
    ok, _ = run_aws("dynamodb", ["list-tables"])
    checks.append(("DynamoDB list tables", ok))

    print("=" * 50)
    print("Floci Runtime Check Report")
    print("=" * 50)

    all_pass = True
    for name, result in checks:
        status = "PASS" if result else "FAIL"
        if not result:
            all_pass = False
        print(f"  [{status}] {name}")

    print("=" * 50)
    if all_pass:
        print("RESULT: ALL CHECKS PASSED")
        return 0
    else:
        print("RESULT: SOME CHECKS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
