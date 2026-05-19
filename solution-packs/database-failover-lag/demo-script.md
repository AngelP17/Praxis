# Demo Script: Database Failover and Replication Lag

## Setup
Ensure that the local Docker Compose production environment is active and the database seeded with Dallas transactional topology.

## Scene 1: The Replication Spike (Minutes 0 - 2)
1. Point out the Dallas datacenter visual map on the Praxis workbench.
2. Observe the initial telemetry spike: `database_replication_lag_critical` has crossed the threshold.
3. Show that the checkout transaction microservice is beginning to register timeout errors as read queries fall behind.

## Scene 2: Failover Trigger & Escalation (Minutes 2 - 5)
1. Point to the critical `Patroni` auto-failover notification in the incident center.
2. Note how Patroni promotes the replica database to primary to preserve write transactions.
3. Highlight that Praxis automatically correlates these telemetry events with `TKT-9912` from the ticketing system, preventing alert fatigue.

## Scene 3: Governed Resolution (Minutes 5 - 8)
1. Review the proposed action plan:
   - Acknowledge the incident.
   - Redirect read traffic directly to the newly promoted primary while replica catches up.
   - Proactively scale connection capacity in `PgPool-II`.
2. Confirm success using the generated provenance proof and value summary.
