# Security Review: Database Failover and Replication Lag

## Infrastructure Integrity
1. **Network Isolation:** Telemetry ingress is routed solely through encrypted VPC endpoints. API endpoints do not require direct database administrative access.
2. **Read-Only Telemetry:** Telemetry extraction does not touch transactional customer tables. All monitoring queries are read-only.
3. **IAM Authorization:** Execution of assisted actions (e.g. pgpool scaling) requires specific administrative credentials managed by vault storage.
