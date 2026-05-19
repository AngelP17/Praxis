FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY packages/ packages/
COPY services/decision-service/ services/decision-service/

RUN pip install --no-cache-dir -e ".[dev]" -e packages/astraea-core -e packages/domain -e packages/pipelines

EXPOSE 8001

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

WORKDIR /app/services/decision-service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
