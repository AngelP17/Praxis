# Limitations and Future Work

## Current Limitations

### 1. Event Ingestion Scale
The current API gateway handles ~1000 events/minute. For high-volume manufacturing environments with thousands of sensors, this may require:
- Event batching at the edge
- Kafka or Redis Streams for buffering
- Horizontal scaling of ingestion workers

### 2. Decision Engine Complexity
Astraea uses rule-based scoring with feature weights. While deterministic and explainable, it does not learn from historical data automatically. Future work includes:
- Feedback-weighted feature rebalancing
- Anomaly detection for novel incident patterns
- Transfer learning from similar deployments

### 3. Real-Time Correlation
Incident correlation runs on ingest. For complex correlation across multiple dimensions (asset, time, semantic, dependency), this may introduce latency. Future work includes:
- Async correlation with event sourcing
- Graph-based relationship modeling
- Probabilistic correlation scoring

### 4. Mobile Experience
The control room is optimized for desktop operators. Mobile support is functional but not primary. Future work includes:
- Native mobile app for field operators
- Push notifications for critical incidents
- Offline mode for remote facilities

### 5. Multi-Tenant Support
Current deployment assumes single-tenant. For SaaS deployment, future work includes:
- Tenant isolation in database
- Per-tenant configuration
- Tenant-specific decision rules
- Tenant-specific SLO definitions

## Future Work

### Phase 1: Enhanced Intelligence
- [ ] Feedback-driven feature weight optimization
- [ ] Anomaly detection for novel patterns
- [ ] Predictive maintenance integration
- [ ] Natural language processing for operator notes

### Phase 2: Scale and Resilience
- [ ] Kafka-based event streaming
- [ ] Multi-region deployment
- [ ] Circuit breaker patterns for external services
- [ ] Graceful degradation modes

### Phase 3: Ecosystem Integration
- [ ] PagerDuty/Opsgenie integration
- [ ] Slack/Teams notifications
- [ ] Jira/ServiceNow ticket sync
- [ ] Grafana/Prometheus metrics export

### Phase 4: Advanced Analytics
- [ ] Incident pattern clustering
- [ ] MTTR trend analysis
- [ ] Operator performance metrics
- [ ] Cost-of-incident calculation

## Architectural Tradeoffs

### Determinism vs. Flexibility
We chose determinism for auditability. This means the system cannot adapt to new patterns without explicit rule updates. The tradeoff is justified in regulated environments but may limit effectiveness in rapidly changing operational contexts.

### Human Control vs. Automation
We chose human-in-the-loop for critical decisions. This means the system cannot respond to incidents faster than human reaction time. The tradeoff is justified for safety-critical systems but may be a limitation for high-velocity SaaS environments.

### PostgreSQL vs. Specialized Stores
We chose PostgreSQL for operational data. This provides ACID guarantees and SQL familiarity but may not scale to petabyte-scale telemetry. The tradeoff is justified for incident data (relatively small) but evidence artifacts may eventually require object storage.

## Honest Assessment

Praxis is a mature proof-of-concept for operational intelligence. It demonstrates:
- Deterministic decisioning with replay
- Human-in-the-loop control
- Platform evidence integration
- Audit and compliance capabilities

It is not yet:
- A production SaaS platform
- A replacement for established AIOps tools
- A solution for all operational domains

The system is designed to be extended, not complete.
