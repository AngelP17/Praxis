# Objection Handling: Database Failover and Replication Lag

## Objection 1: "We already have APM tools like Datadog or New Relic. Why do we need Praxis?"
* **Response:** Datadog is excellent at identifying that replication lag is high, but it cannot map telemetry to direct business outcomes. Praxis links database metrics (replication seconds) to business processes (checkout timeout volumes) and provides audit-ready, tamper-proof proof objects that confirm which exact operator action corrected the drift.

## Objection 2: "Our database failover is fully automated by Patroni. Why involve humans?"
* **Response:** Automation handles the raw database failover, but it does not address application-side client scaling, load balancing pool saturation, or external vendor escalation. Praxis coordinates the holistic, multi-system workflow surrounding Patroni transitions, ensuring checkout transactions resume smoothly.
