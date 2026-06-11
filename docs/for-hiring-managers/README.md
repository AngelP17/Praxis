# Praxis For Hiring Managers

Praxis is a proof-carrying field deployment system. The fastest evaluation path is:

```bash
make praxis-proof
pnpm web:typecheck
pnpm web:build
```

Then open `/fieldlab`, run the manufacturing solution pack, approve the action, and verify the proof hash shown in the UI.

## Role Guides

### Full Stack Engineer (NEW — start here)
- [Full Stack Engineer Walkthrough](fullstack-engineer-walkthrough.md) — 10-min verification path, API tour, demo script, interview pitch
- [Full Stack Case Study](fullstack-case-study.md) — Problem, solution, role, decisions, tradeoffs, what's next

### Existing Role Guides
- [Solutions Engineer](solutions-engineer.md)
- [Customer Engineer](customer-engineer.md)
- [Deployment Engineer](deployment-engineer.md)
- [Field Systems Engineer](field-systems-engineer.md)
- [Infrastructure Solutions Engineer](infrastructure-solutions-engineer.md)
- [Industrial AI Engineer](industrial-ai-engineer.md)
- [Technical Solutions Consultant](technical-solutions-consultant.md)
- [GTM Engineer](gtm-engineer.md)
- [Palantir FDE](palantir-fde.md)
- [Anduril Mission Engineer](anduril-mission-engineer.md)
- [Anthropic Applied](anthropic-applied.md)

## Quick Verification Commands

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript strict | `pnpm web:typecheck` | 0 errors |
| Design quality (GPT-taste) | `pnpm web:lint:gpt-taste:ci` | 0 warnings |
| Playwright smoke | `pnpm web:test:smoke` | All pass |
| Next.js build | `pnpm web:build` | Success |
| Python lint | `make lint` | 0 errors |
| Python tests | `make test` | All pass |
| Proof verification | `make praxis-proof` | Valid L0 proof |
| Determinism check | `make praxis-proof-hashes` | No fake hashes |

## Live Demo

https://praxis-web-eight.vercel.app (frontend-only, deterministic demo mode)
