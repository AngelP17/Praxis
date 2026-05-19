# Demo Script: Network Edge Failover

This demo shows how Praxis detects, alerts, and coordinates WAN failovers for high-resilience manufacturing networks.

## Introduction (2 minutes)
- Point out the physical topology of Plant-A in the Praxis Graph.
- Show Firewall-EDGE-01 as the primary gateway, linked to ISP-PRIMARY (primary) and Starlink-Backup-01 (secondary).
- Explain the business stakes: shipping network offline means delayed shipments, costing $450/hour.

## The Incident (2 minutes)
- Ingest a primary_isp_offline event: WAN 1 is down.
- Observe that the backup interface (Starlink) is not routing traffic due to DHCP/DNS timeouts.
- Praxis highlights the critical path in red on the Topology Graph, raising a high-priority incident.

## Automated Correlation & Triage (2 minutes)
- Praxis correlates the events and presents the Operator with the root cause hypothesis: "backup routing failure via Starlink-Backup-01 due to interface lockup."
- Present the recommended action: Acknowledge, reset Starlink DHCP lease, and failover temporarily to LTE-GATEWAY-01.

## Resolution & Value Captured (1 minute)
- Click Approve to trigger the WAN lease renewal script.
- Show the network routes clearing, and display the realized savings of $3,925/month.
