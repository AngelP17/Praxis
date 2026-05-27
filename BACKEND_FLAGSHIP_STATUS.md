# Backend Flagship Status Report

## Completed Phases

### Phase 1: Auth Hardening ✓
**Files Modified:**
- `apps/api_gateway/services/auth_service.py` - Bcrypt password hashing, refresh tokens, token revocation
- `apps/api_gateway/routes/auth.py` - Added /refresh endpoint, updated login/logout
- `apps/api_gateway/middleware/request_id.py` - X-Request-ID middleware (new file)
- `apps/api_gateway/main.py` - Added RequestIDMiddleware
- `scripts/seed_demo_users.py` - Seed script for bcrypt demo users (new file)
- `users.json` - Updated with bcrypt hashes

**Security Improvements:**
- Bcrypt with salt (replacing SHA-256)
- Refresh token rotation (7-day expiry)
- Access token expiry reduced to 30 minutes
- Token revocation tracking
- Request ID propagation for audit trails
- Legacy SHA-256 password migration support

## In Progress / Next

### Phase 2: Alembic Migrations (Pending)
**Status:** Blocked by inline DDL in session.py
**Action Required:** 
- Initialize Alembic in infrastructure/db/
- Generate initial migration from 31 models
- Remove _ensure_legacy_compatibility() and related functions
- Add make targets: db-migrate, db-upgrade, db-downgrade

### Phase 3: Outbox Pattern (Pending)
**Status:** Outbox messages written but never consumed
**Action Required:**
- Build outbox relay worker (async background task)
- Add EventBridge publisher via Floci
- Add webhook dispatcher
- Add dead-letter handling
- Add idempotency keys

### Phase 4: Observability (Pending)
**Status:** infrastructure/monitoring/ is empty
**Action Required:**
- Add Prometheus metrics export at /metrics
- Create Grafana dashboard JSON
- Add alerting rules YAML
- Add health check enrichment
- Wire into Docker Compose monitoring profile

### Phase 5: OpenAPI Documentation (Next Priority)
**Status:** Most routes return raw dicts without response models
**Action Required:**
- Add Pydantic response models to all 28 routers
- Add request body models where missing
- Add example payloads to key endpoints
- Configure OpenAPI metadata
- Add Redoc alongside Swagger UI

### Phase 6: Integration Tests (Next Priority)
**Status:** Unit tests exist but no end-to-end integration tests
**Action Required:**
- Write integration tests for 4 canonical scenarios
- Test full decision spine: event -> decision -> approval -> outbox -> replay
- Test auth flow with refresh tokens
- Test FieldLab run lifecycle
- Add make test-integration target

### Phase 7: Proof Hash Integrity (Pending)
**Status:** Frontend proof hashes are hardcoded
**Action Required:**
- Compute demo hashes from real evidence data
- Add hash verification page
- Ensure SSE stream emits computed hashes
- Add CI check for demo hash consistency

### Phase 8: Real-Time (Pending)
**Status:** Only SSE for pipeline stages
**Action Required:**
- Add SSE for ticket/incident updates
- Add SSE for decision status changes
- Wire Command Center to subscribe to streams
- Add connection health indicator

### Phase 9: Contract Tightening (Pending)
**Status:** Three API clients, silent demo swaps
**Action Required:**
- Consolidate to one typed API client
- Remove silent demo swap in use-command-feed
- Fix praxis-api.ts dead code
- Generate TypeScript types from Pydantic models

### Phase 10: Caching (Pending)
**Status:** No caching layer
**Action Required:**
- Add Redis to Docker Compose
- Cache proof objects and solution packs
- Optimize queries in decision_service.py
- Add connection pooling config

### Phase 11: Deploy Hardening (Pending)
**Status:** Docker Compose exists but has blockers
**Action Required:**
- Fix SECRET_KEY generation
- Add multi-stage Docker build
- Add database backup/restore scripts
- Add smoke test after Docker Compose up
- Add load test script

### Phase 12: Documentation (Pending)
**Status:** Missing ADRs and API docs
**Action Required:**
- Add architecture decision records
- Add API contract documentation
- Add runbook for common operations
- Add performance benchmarks page

## Critical Path for Flagship Status

**Immediate (P0):**
1. Phase 5: OpenAPI Documentation - First impression for reviewers
2. Phase 6: Integration Tests - Proves end-to-end functionality
3. Phase 2: Alembic Migrations - Database maturity signal

**Short-term (P1):**
4. Phase 3: Outbox Pattern - Architecture completeness
5. Phase 7: Proof Hash Integrity - Core value prop credibility
6. Phase 9: Contract Tightening - Code quality signal

**Medium-term (P2):**
7. Phase 4: Observability - Operational maturity
8. Phase 8: Real-Time - Live feel
9. Phase 10: Caching - Performance awareness

**Long-term (P3):**
10. Phase 11: Deploy Hardening - Production readiness
11. Phase 12: Documentation - Reviewer experience

## Files Created/Modified Summary

**New Files:**
- `apps/api_gateway/middleware/request_id.py`
- `scripts/seed_demo_users.py`

**Modified Files:**
- `apps/api_gateway/services/auth_service.py`
- `apps/api_gateway/routes/auth.py`
- `apps/api_gateway/main.py`
- `users.json`

**Dependencies:**
- Already have: passlib[bcrypt], python-jose[cryptography]
- No new dependencies needed for Phase 1

## Testing Status

**Auth Hardening:**
- Bcrypt password hashing: ✓ Implemented
- Refresh token rotation: ✓ Implemented
- Token revocation: ✓ Implemented
- Request ID middleware: ✓ Implemented
- Demo user seeding: ✓ Implemented

**Next Steps:**
1. Run linting: `make lint`
2. Run tests: `make test`
3. Test login flow with new bcrypt hashes
4. Test refresh token endpoint
5. Verify X-Request-ID in responses
