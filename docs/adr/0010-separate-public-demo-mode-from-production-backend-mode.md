# ADR 0010: Separate Public Demo Mode from Production Backend Mode

## Status
Accepted

## Context
Praxis serves dual roles:
1. An interactive, public web demonstration designed to showcase the user experience, brand, and layout flow to potential buyers and managers on Vercel.
2. A high-security, forward-deployed, containerized operational platform deployed on physical hardware at industrial edge zones.

Mixing these modes within a single code path creates severe vulnerabilities (e.g. leaking database configurations or exposing mock credentials in production) and leads to developer confusion.

## Decision
We enforce a strict physical and runtime separation between **Public Demo Mode** and **Production Backend Mode**.
- **Public Demo Mode (`NEXT_PUBLIC_DEMO_MODE=1`)**: Triggered automatically in frontend static deploys (like Vercel). In this mode, the web application runs entirely client-side, bypassing database/service routes and returning high-fidelity, deterministic mock scenarios and value cases directly in the browser.
- **Production Backend Mode (`NEXT_PUBLIC_DEMO_MODE=0` / undefined)**: Enforces real API route proxying, active JSON Web Token authentication, real database lookups, transactional outbox operations, and physical local or AWS emulation verification.

## Alternatives Considered
- **Universal Next.js SSR Deploys**: Deploying Next.js with active Node.js serverless functions proxying to a cloud database. Rejected because it exposes database keys in public web bundles and fails to mimic edge/offline deployments.

## Consequences
### Positive
- Direct, Zero-Config Vercel Deploys: Public demos build static bundles safely.
- Pristine Production Safety: Security rules, authentications, and credentials are completely isolated from client-side bundles.
- Highly predictable mock behaviors for sales presentations.

### Negative
- Code duplication: require maintaining dual data providers (mock scenarios inside frontend components and real scenarios inside backend databases).

## How this is verified
- Enforced at compile time: the Next.js production build (`pnpm web:build`) runs with explicit environment checks.
- Verified in `apps/web/src/app/api/` proxy route handlers which verify if they are running in local-dev or Vercel mode before returning deterministic datasets.
