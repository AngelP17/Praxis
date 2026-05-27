# Metrics

Praxis exposes Prometheus-format API metrics at the API gateway `/metrics` endpoint.

## Implemented Metrics

- HTTP request counters and latency are exported by the existing FastAPI middleware.
- Health information is available through `/health`.

## Not Yet Implemented

The following are planned hardening metrics and should not be claimed as active until code and dashboards exist:

- proof verification counters by level;
- replay mismatch counters;
- proof-generation latency histograms;
- outbox pending and failed gauges;
- decision latency histograms;
- OpenTelemetry traces.

## Local Check

```bash
make dev-api
curl -s http://localhost:8000/metrics | head
```

If the API gateway is running through Compose, use:

```bash
docker compose exec api-gateway curl -s http://localhost:8000/metrics | head
```
