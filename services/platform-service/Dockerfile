FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY packages/ packages/
COPY services/platform-service/ services/platform-service/

RUN pip install --no-cache-dir -e ".[dev]" -e packages/astraea-core -e packages/domain -e packages/pipelines

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

WORKDIR /app/services/platform-service
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
