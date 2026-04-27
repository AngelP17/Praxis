# Validation and Quality Gates

## Test Suite

### Unit Tests

```bash
make test-unit
```

Coverage areas:
- Decision engine scoring
- Feature extraction
- Event normalization
- Incident correlation
- Replay hash computation

### Integration Tests

```bash
make test-integration
```

Coverage areas:
- Full flagship path: ingest -> normalize -> decide -> correlate -> ticket -> feedback -> replay -> audit
- API gateway routing
- Database persistence
- Cross-service communication

### Frontend Tests

```bash
cd apps/web && npm run typecheck
cd apps/web && npm run build
```

## Quality Gates

### Pre-Commit

- Ruff linting (Python)
- TypeScript type checking
- No `console.log` in production code
- No secrets in code

### Pre-Merge

- All unit tests pass
- All integration tests pass
- Frontend builds successfully
- `npm audit --omit=dev` shows 0 high/critical vulnerabilities
- Documentation updated

### Release

- Full test suite passes
- Performance benchmarks met
- Security scan clean
- Changelog updated
- Version tagged

## Validation Commands

```bash
# Python tests
make test

# Frontend typecheck
cd apps/web && npm run typecheck

# Frontend build
cd apps/web && npm run build

# Security audit
cd apps/web && npm audit --omit=dev

# Secret scan
git-secrets --scan

# Documentation lint
markdownlint docs/
```

## Metrics

### Code Quality
- Test coverage: >80%
- Type coverage: >95%
- Lint errors: 0
- Type errors: 0

### Performance
- API response time: <200ms p95
- Frontend build time: <30s
- Database query time: <100ms p95

### Security
- Known vulnerabilities: 0 high/critical
- Secrets in code: 0
- Dependency freshness: <30 days behind

## Known Limitations

- PostgreSQL required for production; SQLite for dev/test only
- Event ingestion rate limited to 1000/minute
- Replay bundles limited to 100MB
- Frontend optimized for desktop; mobile is functional but secondary
