# Changelog

All notable changes to Aether Sentinel will be documented in this file.

## [1.1.0-surface-expansion] - 2026-05-01

### Added
- 6 new operational pages with real API integration:
  - `/platform` — SRE control plane with SLO metrics, topology, controls, chaos testing
  - `/decision-center` — Astraea decisioning with approve/reject and recommendation workflow
  - `/assets` — Infrastructure asset inventory
  - `/audit` — Audit trail viewer with export
  - `/recommendations` — Recommendation acceptance and rejection
  - `/event-ingestion` — Direct event ingestion interface
- Incident detail timeline view (`/incidents/[id]`) with resolve flow
- Shared API client helpers (`client-api.ts`) with timeout and fallback logic
- Route-level motion polish and loading/error/empty state components
- Surface expansion smoke tests
- Dashboard page with dense bento layout and real metrics
- Landing page cinematic redesign with AIDA structure, GSAP animations, gapless bento grid

### Changed
- Expanded system status rail with all new operational routes
- Tightened panel contrast and typography on platform and decision-center pages
- Command center now auto-falls back to demo scenario when live API returns empty
- Frontend state management now uses resilient fetching with 30s auto-refresh

### Fixed
- Command center no longer dead-ends on `/api/tickets?limit=160: 404`
- Demo fallback correctly selects highest-priority case with `INC-4821` handling
- Status labeling avoids false "Live data active" with empty queue
- Panel contrast raised from `opacity-0.08` to readable levels on dark backgrounds

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
