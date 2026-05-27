# Backup and Restore Procedures

This document details database backups, secret configurations, and restore verification procedures for the **Praxis** platform.

---

## 1. Backup Strategy

Praxis runs on a dual database architecture depending on deployment targets:
- **Development/Sandbox**: SQLite databases (`praxis.db`, `aether-sentinel.db`).
- **Production**: PostgreSQL.

### Postgres Backup Procedure
Run hourly logical backups via `pg_dump`:
```bash
docker exec -t praxis-db-1 pg_dump -U praxis -d praxis_prod | gzip > /var/backups/praxis/praxis_db_$(date +%F_%H%M%S).sql.gz
```
Backups must be securely uploaded to a write-only, encrypted S3 bucket (or offline storage target) with a 30-day lifecycle retention policy.

### SQLite Sandbox Backup Procedure
For SQLite local edge deployments, copy the database using the safe, non-blocking `.backup` command:
```bash
sqlite3 praxis.db ".backup '/var/backups/praxis/praxis_db_$(date +%F_%H%M%S).db'"
```

---

## 2. Secrets and Configuration Backup

Do **NOT** store secret keys or certificates in database backups. Secure the following external configurations:
- `.env` configuration file.
- Private Ed25519 signing keys.
- TLS/SSL certificates for the gateway API.

Ensure these secrets are backed up securely within a centralized Vault or AWS KMS and are never exposed on standard disks.

---

## 3. Restore and Recovery Procedures

In the event of a severe partition or disk corruption:

### Step 3.1: Provision Clean Hardware / Containers
Ensure that all containers are stopped and clean storage is mounted:
```bash
docker compose down -v
docker compose up -d db
```

### Step 3.2: Restore Postgres Data
Locate the target backup file (e.g. `praxis_db_latest.sql.gz`), copy it to the container, and unzip/restore:
```bash
gunzip -c praxis_db_latest.sql.gz | docker exec -i praxis-db-1 psql -U praxis -d praxis_prod
```

### Step 3.3: Verify Restore Integrity
1. Start the API gateway:
   ```bash
   docker compose up -d api-gateway
   ```
2. Verify system health and run the proof validation check:
   ```bash
   .venv/bin/python scripts/run_fieldlab_demo.py --verify-only
   ```
3. Run the replay benchmarks to verify no drift has occurred:
   ```bash
   .venv/bin/python scripts/run_benchmarks.py
   ```
