FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY users.json .
COPY packages/ packages/
COPY apps/api_gateway/ apps/api_gateway/
COPY infrastructure/ infrastructure/

RUN pip install --no-cache-dir -e ".[dev]" -e packages/astraea-core -e packages/domain -e packages/pipelines

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "apps.api_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
