# Production Operations Runbook

This document serves as the master production manual for deploying, scaling, and maintaining the **Praxis** operational decision platform.

---

## 1. System Components and Architecture

A production Praxis stack consists of four Docker containers:
1.  `web`: Next.js frontend application serving the operator workspace (listening on port `3000`).
2.  `api-gateway`: FastAPI application proxying calls, validating auth, and evaluating decisions (listening on port `8000`).
3.  `db`: PostgreSQL relational database for persistent event logs, decision states, and outbox tables (listening on port `5432`).
4.  `outbox-worker`: Background worker processing transactionally-queued decisions and publishing actions to external systems.

---

## 2. Production Deployment Guide

Production environments must utilize **Docker Compose Production Mode** (`docker-compose.prod.yml`) to ensure proper container hardening, TLS configurations, and PostgreSQL scaling.

### Step 2.1: Configure Environment Variables (`.env`)
Ensure that production `.env` files are fully hardened. **Never** leave default secret values in production!
```ini
# Production Environment Guard
ENV=production
NEXT_PUBLIC_DEMO_MODE=0

# Security and Keying
SECRET_KEY=highly_secure_random_string_kms_generated
PPP_SIGNING_KEY_PATH=/etc/praxis/keys/ppp_private_key.pem

# Persistence
POSTGRES_DB=praxis_prod
POSTGRES_USER=praxis_admin
POSTGRES_PASSWORD=strong_postgres_password
DATABASE_URL=postgresql://praxis_admin:strong_postgres_password@db:5432/praxis_prod
```

### Step 2.2: Build and Boot the Production Stack
```bash
# Pull and build all hardened images
docker compose -f docker-compose.prod.yml build --no-cache

# Boot services in detached/background daemon mode
docker compose -f docker-compose.prod.yml up -d
```

---

## 3. Common Operations Commands

### Check Platform Container Status
```bash
docker compose ps
```

### View Live Aggregated Logs
```bash
docker compose logs -f --tail=100
```

### Trigger Outbox Manual Re-evaluation
If a network partition causes transactionally queued outbox messages to stall, you can manually trigger redelivery:
```bash
docker exec -it praxis-api-gateway-1 .venv/bin/python scripts/reprocess_stalled_outbox.py
```

### Perform Cold Database Migration
To seed baseline operational ontologies and scenarios:
```bash
docker exec -it praxis-api-gateway-1 .venv/bin/python scripts/seed_database.py
```

---

## 4. Scaling Guidelines

-   **API Gateway scaling**: The FastAPI router is stateless and can be scaled horizontally behind a round-robin load balancer (Nginx or AWS ALB):
    ```bash
    docker compose up -d --scale api-gateway=3
    ```
-   **Database scaling**: Standard production deployments require mounting high-speed, persistent SSD volumes directly to the PostgreSQL database container. Ensure weekly vacuum operations are scheduled.
-   **Outbox Isolation**: To prevent heavy decision evaluation workloads from blocking API gateway responsiveness, run the outbox consumer worker on a completely isolated thread or container.

---

## 5. Telemetry and Logging Monitoring

-   **Active Health Probe**: Ping the health endpoint regularly to monitor gateway and database state:
    ```bash
    curl -f http://localhost:8000/health
    ```
-   **Prometheus Metrics**: Scrape standard Prometheus metrics on `http://localhost:8000/metrics`.
-   **Log Auditing**: Look out for `[TAMP-ALERT]` or `[SIG-ALERT]` patterns in log files which indicate active verification anomalies or key compromises.
