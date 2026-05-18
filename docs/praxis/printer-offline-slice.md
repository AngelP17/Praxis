# Printer-Offline Slice

## Purpose

This slice proves the operational-resilience spine on top of the existing Praxis API instead of introducing a second architecture.

Path:

```text
printer.offline CloudEvent
-> /api/decisions/evaluate
-> operational_events
-> asset graph lookup
-> astraea.praxis_decision.decide()
-> decision_records
-> recommendations
-> /api/decisions/{id}/approve
-> human_feedback + outbox_messages
-> /api/decisions/{id}/replay
```

## Commands

Install and run the API:

```bash
make install
make dev-api
```

Seed the graph and emit the demo event:

```bash
make praxis-seed-graph
make praxis-printer-slice
```

Replay proof:

```bash
curl -X POST http://localhost:8000/api/decisions/<decision_id>/replay
```

## Done When

- `make praxis-seed-graph` prints `Seeded operational graph.`
- `make praxis-printer-slice` prints a decision JSON payload with `priority_score`, `replay_hash`, and recommendations
- `POST /api/decisions/{id}/approve` records feedback without changing unrelated behavior
- `POST /api/decisions/{id}/replay` returns matching stored and replayed hashes with `determinism: true`

## Current Files

- CloudEvent contract: `packages/domain/domain/events.py`
- Event normalization: `apps/api_gateway/services/event_service.py`
- Graph model and service: `infrastructure/db/models/asset_edge.py`, `apps/api_gateway/services/graph_service.py`
- Pure decision function: `packages/astraea-core/astraea/praxis_decision.py`
- Decision orchestration: `apps/api_gateway/services/decision_service.py`
- Seed/demo scripts: `scripts/seed_operational_graph.py`, `adapters/printer_adapter/emit_printer_offline.py`

## Blockers To Record Explicitly

- API not running on `http://localhost:8000`
- `.venv` missing because `make install` has not been run
- local database permissions or connectivity issues
- Docker/Floci unavailable for unrelated proof-path commands
