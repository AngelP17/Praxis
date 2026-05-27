# Deployment Checklist

Use this checklist for the supported backend deployment path:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

## Required Environment

- `POSTGRES_PASSWORD` is set.
- `SECRET_KEY` is a strong non-placeholder value.
- `ALLOWED_ORIGINS` includes the real frontend origin.
- `ENV=production` and `DEBUG=false`.
- `OUTBOX_DISPATCH_MODE=eventbridge` only when an EventBridge-compatible target is actually configured; otherwise leave messages failed/pending rather than pretending delivery occurred.

## Verify

- `curl -f http://localhost:3000/api/auth/login` with a valid seeded user path.
- `curl -f http://localhost:8000/health` from inside the Compose network if the API port is not published.
- `python scripts/verify_praxis_proof.py artifacts/latest/praxis_proof.json --level L0` for generated proof artifacts.

## Known Limits

- Public demo mode is deterministic presentation data, not signed production provenance.
- L2 attestation verification is unsupported and fails closed.
- Production signing identity and key registry are not implemented in this checkout.
