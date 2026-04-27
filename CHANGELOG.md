# Changelog

All notable changes to Aether Sentinel will be documented in this file.

## [1.0.0-flagship] - 2024-01-15

### Added
- Operational intelligence theory documentation
- Architecture Decision Records (6 ADRs)
- Mermaid architecture diagrams (7 diagrams)
- Demo scripts: seed, validate, reset
- Sample scenarios: Press Vibration Cascade, K8s Pod Failure, ERP Auth Outage
- Final validation report with actual outputs
- GitHub Actions CI: Python tests, Ruff, TypeScript, Next build, pnpm audit, secret scan
- Demo transcript for interview narrative

### Changed
- Frontend switched to pnpm with overrides for zero audit vulnerabilities
- Removed unused GSAP dependency
- Purged cyan/violet/purple from operational UI
- Command center page reduced to orchestration-only

### Fixed
- Replay page build corruption
- PostgreSQL NOW() incompatibility with SQLite tests
- SQLite datetime string handling in query results

## [0.9.0] - 2024-01-10

### Added
- Monorepo migration from three independent repositories
- FastAPI gateway with full CRUD for events, decisions, incidents, replay, audit
- Next.js 16 + React 19 + Tailwind CSS v4 frontend
- Phosphor Icons, Geist font, amber-only accent palette
- Framer Motion for purposeful UI transitions
- Deterministic replay hashes with SHA-256
- Feature snapshots per decision record
- 13 passing tests (5 unit + 8 integration)
