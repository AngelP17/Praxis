.PHONY: install test dev api platform web clean

install:
	python3 -m venv .venv
	.venv/bin/pip install -e . -e packages/astraea-core -e packages/domain -e packages/pipelines

test:
	.venv/bin/pytest tests/unit tests/integration -v

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
