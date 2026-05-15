# Public Launch Checklist

This checklist separates what is already verified in this repo from what still needs operator decisions before a public launch.

## Launch Modes

### 1. Frontend-only public demo

This is the fastest verified public launch path today.

- Deploy the Next.js app from `apps/web/`
- Set `NEXT_PUBLIC_DEMO_MODE=1`
- Use the root [`vercel.json`](../../vercel.json) or [`apps/web/vercel.json`](../../apps/web/vercel.json), both of which now target the frontend only
- No live FastAPI deployment is required for the flagship demo surfaces

### 2. Full-stack public production

This repo can support it, but it is not a one-command path. Treat it as an explicit hardening and hosting project.

## Required Before Real Public Production

### Backend safety

- Set a strong `SECRET_KEY` in the runtime environment
- Set `ENV=production`
- Set `DEBUG=false`
- Set `ALLOWED_ORIGINS` to the real public frontend origins
- Replace or rotate the demo-backed `users.json` credentials before exposing real users or customer data

The API gateway now refuses to boot in production if `SECRET_KEY`, `DEBUG`, or `ALLOWED_ORIGINS` are left in insecure defaults.

## Verified Commands

### Local proof path

```bash
make install
make praxis-fieldlab-up
make praxis-proof
make praxis-benchmark
make praxis-floci-verify
make praxis-fieldlab-down
```

### Frontend verification

```bash
pnpm web:typecheck
pnpm web:lint:gpt-taste:ci
pnpm web:test:smoke
pnpm web:build
```

## Not Turnkey Yet

- A repo-managed public backend hosting target is not fully codified in one verified path
- The repo contains Kubernetes, Terraform, and Lambda reference assets, but CI does not currently exercise a public cloud deployment
- Demo users in [`users.json`](../../users.json) are suitable for local/demo use only

## Done When

- Demo launch: frontend deploy succeeds, `NEXT_PUBLIC_DEMO_MODE=1` is set, and the frontend verification commands pass
- Production launch: backend secrets and origins are real, demo credentials are replaced, a hosting target is chosen and tested, and the verification commands pass against that environment
