# Customer Context: Database Failover and Replication Lag

## Background
The customer is a high-volume transactional platform handling over 100,000 checkout queries per minute during peak times. The infrastructure is based in the Dallas Datacenter (`site-dallas`).

## Core Pain Points
1. **Unpredictable Replication Lag:** High load periods cause replication lag between the primary database (`asset-postgres-primary`) and replica (`asset-postgres-replica`) to spike.
2. **Checkout Timeouts:** When replication lag spikes, read queries routed to the replica return stale transaction data or timeout, causing cart abandonment.
3. **Connection Pool Saturation:** In the event of primary database failures, pgpool load balancers (`asset-pgpool`) become saturated with orphaned threads, magnifying the impact of Patroni auto-failover transitions.

## Key Goals
- Proactively detect replication lag cascades before connection pools saturate.
- Ensure that Patroni failover execution triggers governance procedures to re-route queries gracefully.
- Minimize checkout transaction loss during database failovers.
