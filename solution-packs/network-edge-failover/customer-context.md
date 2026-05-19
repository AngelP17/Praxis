# Customer Context: Plant-A Network Edge Outages

## Situation
Plant-A is a high-throughput manufacturing site with strict shipping SLAs. The site is equipped with a primary fiber connection (ISP-PRIMARY) and a secondary satellite connection (Starlink-Backup-01) controlled by Firewall-EDGE-01.

## Complication
When ISP-PRIMARY suffers physical line issues or routing dropouts, WAN failover policies fail because the Starlink terminal fails to renew its DHCP lease fast enough, or because DNS requests are blocked on the secondary interface. This leaves the entire shipping network and ERP access offline, blocking delayed shipments for hours.

## Impact
Every hour of downtime delays outbound shipments, costing over $450 in penalties and causing significant customer delivery friction. IT teams lose hours manually troubleshooting switch ports, routing rules, and vendor coordination.

## Resolution
With Praxis, the network edge is monitored dynamically. When primary ISP dropouts occur, Praxis correlates the dead gateway with DHCP failures and interface degradation, initiating automated fallback routes to LTE-GATEWAY-01 and notifying the SRE team immediately.
