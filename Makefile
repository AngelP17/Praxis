.PHONY: install test demo demo-api demo-platform demo-decision demo-web dev-api dev-platform dev-decision dev-web lint format clean clean-demo

install:
	python3 -m venv .venv
	.venv/bin/pip install -e . -e packages/astraea-core -e packages/domain -e packages/pipelines
	cd apps/web && pnpm install

test:
	.venv/bin/pytest tests/unit tests/integration -v

demo: demo-api demo-platform demo-decision demo-web
	@echo "Aether Sentinel demo is running:"
	@echo "  API Gateway:    http://localhost:8000"
	@echo "  Decision Svc:   http://localhost:8001"
	@echo "  Platform Svc:   http://localhost:8080"
	@echo "  Web App:        http://localhost:3000"

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

dev-api:
	.venv/bin/uvicorn apps.api_gateway.main:app --reload --port 8000

dev-platform:
	.venv/bin/uvicorn services.platform-service.src.main:app --reload --port 8080

dev-decision:
	.venv/bin/uvicorn services.decision-service.main:app --reload --port 8001

dev-web:
	cd apps/web && npm run dev

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
