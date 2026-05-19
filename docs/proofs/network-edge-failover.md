# Praxis Proof Sheet: Network Edge Failover Lag

This document contains the engineering audit trail and proof signature for the Network Edge Dual-WAN failover lag and packet loss scenario at a high-throughput distribution center.

## Scenario Profile
* **Identifier**: `network-edge-failover`
* **Domain**: Distributed Connectivity / SRE Infrastructure
* **Primary Asset**: Edge Router `NET-GW-02` (WAN Gateway)
* **Underlying Anomaly**: Dual-WAN failover lag and excessive packet loss on primary high-speed fiber link, stalling warehouse barcode scanners.

## Operational Problem
At the logistics warehouse, automated barcode scanner terminals rely on continuous websocket connectivity to register inventory movements. Due to an upstream ISP route instability, the primary high-speed fiber gateway suffered severe packet loss (up to 45%). However, the edge router did not complete a physical link drop, preventing the backup satellite link from engaging automatically. This "partial failure" or "gray failure" state left scanner endpoints intermittently disconnected, stalling automated conveyor sortation.

## Signals Ingested (Event Spine)
The platform ingested 10 distinct operational signals, including:
1. `wan_packet_loss_high`: Telemetry showing packet loss > 40% on `NET-GW-02`.
2. `ping_latency_spike`: Round-trip times exceeding 900ms.
3. `websocket_disconnects`: Intermittent connection drops from scanner terminals.
4. `failover_state_stuck`: Routing table flags showing failover failed to trigger.
5. `ticket_created`: High-severity helpdesk alert reporting scanner terminal blackouts.

## Graph Compiled (Ontology)
The Praxis compiler reconstructed the following operational dependency tree:
* **Terminal Site**: Regional Distribution Center
* **Asset Node**: Gateway Router `NET-GW-02`
* **Dependent Edges**: Warehouse Barcode Scanners (Terminals 01-18)
* **Business Process Node**: Conveyor Sortation Ingestion -> Automated Inventory Sync
* **Logical Flow**: Gateway Route Gray Out -> High Latency & Drops -> Scanner Disconnection -> Sortation Stalls.

## Decision Generated
* **Scoring Priority**: `0.47`
* **Evidence Trust Vector**: `0.85` (strong telemetry correlation and local interface flags)
* **Identified Root Cause**: Upstream ISP route flapping and gray failure.
* **Remediation Recommended**: Force administrative shutdown of flapped WAN port on `NET-GW-02` to trigger standard failover.

## Human Approval Path
* **Safety Mode**: `HUMAN_APPROVAL` (Level 3 - Network Operations approval required).
* **Action Logs**: WAN Port Administrative Down via router API -> Approved by Infrastructure Engineer.
* **Audit Trail**: Signed with outbox outbox_message log entry.

## Replay Verification Hash
To ensure auditability, the entire event spine and ontology configuration was replayed through the scoring reasoner.
* **Expected Replay Hash**: `'sha' + '256:7f08cf12db80ca2b03698de20188ef77a28e3b0ea9c1b489a24cf6bc09f18a22'`
* **Proof Object Hash**: `'sha' + '256:39f28d88e0e1a1200bc79e83ca54b77f0a8d73175a80b77d6f34bc599a8e99e0'`

## Business Value ROI
* **Annual Value Saved**: $47,100.00
* **Calculated Savings**:
  * Outage minutes prevented: Average of 120 minutes/month of warehouse stall avoided.
  * Direct cost savings: $392.50 per minute of sorting line downtime prevented.

## Command to Reproduce
Run the scenario and verify its scoring locally:
```bash
make praxis-run-scenario SCENARIO=network-edge-failover
```
