.PHONY: install test demo demo-api demo-platform demo-decision demo-web demo-seed demo-validate demo-reset dev-api dev-platform dev-decision dev-web lint format clean clean-demo praxis-install praxis-fieldlab-up praxis-fieldlab-down praxis-demo praxis-validate-pack praxis-readout praxis-proof praxis-proof-open praxis-benchmark praxis-test praxis-floci-verify praxis-canvas-verify praxis-proof-hashes praxis-seed-graph praxis-printer-slice praxis-validate-all praxis-run-scenario praxis-run-all-scenarios praxis-scenario-benchmark praxis-sync-frontend-scenarios praxis-flagship-proof

install:
	python3 -m venv .venv
	.venv/bin/pip install -e . -e packages/astraea-core -e packages/domain -e packages/pipelines
	cd apps/web && pnpm install

test:
	.venv/bin/pytest tests/unit tests/integration -v

test-integration:
	.venv/bin/pytest tests/integration -v --tb=short

test-unit:
	.venv/bin/pytest tests/unit -v

demo: demo-api demo-platform demo-decision demo-web
	@echo ""
	@echo "Praxis demo is running:"
	@echo "  API Gateway:    http://localhost:8000"
	@echo "  Decision Svc:   http://localhost:8001"
	@echo "  Platform Svc:   http://localhost:8080"
	@echo "  Web App:        http://localhost:3000"
	@echo ""
	@echo "Next steps:"
	@echo "  make demo-seed      # Seed a deterministic scenario"
	@echo "  make demo-validate  # Verify the flagship path"
	@echo "  make demo-reset     # Clear demo state"

demo-api:
	@echo "Starting API Gateway on port 8000..."
	@.venv/bin/uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 &

demo-platform:
	@echo "Starting Platform Service on port 8080..."
	@.venv/bin/uvicorn services.platform-service.src.main:app --host 0.0.0.0 --port 8080 &

demo-decision:
	@echo "Starting Decision Service on port 8001..."
	@.venv/bin/uvicorn services.decision-service.main:app --host 0.0.0.0 --port 8001 &

demo-web:
	@echo "Starting Web App on port 3000..."
	@cd apps/web && pnpm dev &

demo-seed:
	@echo "Seeding flagship scenarios..."
	@.venv/bin/python scripts/run_scenario.py --all --approve

demo-validate:
	@echo "Validating flagship acceptance path..."
	@.venv/bin/python scripts/demo/validate_flagship_path.py

demo-reset:
	@echo "Resetting demo state..."
	@.venv/bin/python scripts/demo/reset_demo_state.py

dev-api:
	.venv/bin/uvicorn apps.api_gateway.main:app --reload --port 8000

dev-platform:
	.venv/bin/uvicorn services.platform-service.src.main:app --reload --port 8080

dev-decision:
	.venv/bin/uvicorn services.decision-service.main:app --reload --port 8001

dev-web:
	cd apps/web && pnpm dev

lint:
	.venv/bin/ruff check apps packages services

format:
	.venv/bin/ruff format apps packages services

clean:
	rm -rf .venv __pycache__ .pytest_cache *.db

clean-demo:
	-pkill -f "uvicorn apps.api_gateway.main:app"
	-pkill -f "uvicorn services.platform-service.src.main:app"
	-pkill -f "uvicorn services.decision-service.main:app"
	-pkill -f "next-dev"
	@echo "Demo processes stopped."

# Praxis-specific targets

praxis-install:
	pnpm install
	.venv/bin/uv sync 2>/dev/null || python3 -m venv .venv && .venv/bin/pip install -e . -e packages/astraea-core -e packages/domain -e packages/pipelines && cd apps/web && pnpm install

praxis-fieldlab-up:
	cd infrastructure/floci && docker compose up -d
	cd infrastructure/floci && ./bootstrap.sh

praxis-fieldlab-down:
	cd infrastructure/floci && docker compose down

praxis-demo:
	.venv/bin/python scripts/run_fieldlab_demo.py --solution-pack manufacturing-printer-gpo

praxis-validate-pack:
	.venv/bin/python scripts/validate_solution_pack.py solution-packs/manufacturing-printer-gpo

praxis-readout:
	.venv/bin/python scripts/generate_executive_readout.py --run-id $(RUN_ID)

praxis-proof:
	.venv/bin/python scripts/run_fieldlab_demo.py --solution-pack manufacturing-printer-gpo --emit-proof
	.venv/bin/python scripts/verify_praxis_proof.py artifacts/latest/praxis_proof.json
	.venv/bin/python scripts/render_proof_summary.py artifacts/latest/praxis_proof.json

praxis-proof-open:
	open artifacts/latest/proof-summary.md

praxis-benchmark:
	.venv/bin/python scripts/run_benchmarks.py
	.venv/bin/python scripts/render_benchmark_report.py

praxis-test:
	.venv/bin/pytest tests/praxis tests/integration -v

praxis-floci-verify:
	.venv/bin/python scripts/check_floci_runtime.py

praxis-canvas-verify:
	.venv/bin/python scripts/check_canvas_integrity.py

praxis-proof-hashes:
	.venv/bin/python scripts/check_no_fake_proof_hashes.py

praxis-seed-graph:
	.venv/bin/python scripts/seed_operational_graph.py

praxis-printer-slice:
	.venv/bin/python scripts/seed_operational_graph.py
	.venv/bin/python adapters/printer_adapter/emit_printer_offline.py

praxis-validate-all: lint test praxis-benchmark praxis-floci-verify praxis-canvas-verify praxis-proof-hashes
	@echo "All validation checks completed."

# Deterministic scenario targets

praxis-run-scenario:
	.venv/bin/python scripts/run_scenario.py $(SCENARIO)

praxis-run-all-scenarios:
	.venv/bin/python scripts/run_scenario.py --all --approve

praxis-scenario-benchmark:
	.venv/bin/python scripts/run_scenario.py --benchmark

praxis-sync-frontend-scenarios:
	.venv/bin/python scripts/generate_frontend_scenarios.py

praxis-flagship-proof:
	.venv/bin/python scripts/validate_all_solution_packs.py
	.venv/bin/python scripts/run_scenario.py --all --approve
	.venv/bin/python scripts/run_scenario.py --benchmark
	.venv/bin/python scripts/run_fieldlab_demo.py --solution-pack manufacturing-printer-gpo --emit-proof
	.venv/bin/python scripts/verify_praxis_proof.py artifacts/latest/praxis_proof.json
	.venv/bin/python scripts/render_proof_summary.py artifacts/latest/praxis_proof.json
	.venv/bin/python scripts/generate_frontend_scenarios.py

