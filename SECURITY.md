# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Aether Sentinel, please report it privately.

1. **Do not** open a public issue.
2. Email details to the maintainer with a clear description of the vulnerability.
3. Allow reasonable time for response before any public disclosure.

## Security Measures

- All dependencies are audited via `pnpm audit --prod` in CI
- Secret scanning via TruffleHog on every push
- No secrets or credentials are committed to the repository
- Authentication uses JWT with rotating tokens
- All replay artifacts are checksummed for integrity
