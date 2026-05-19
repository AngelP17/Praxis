# Objection Handling: Network Edge Failover

## Objection 1: "Our SD-WAN controller already handles automatic failover. Why do we need Praxis?"
**Response:** Standard SD-WAN routers switch interfaces based on simple thresholds, but they do not resolve complex, silent failures such as DHCP lease exhaustion, partial satellite blockage, or DNS routing loops. Praxis correlates these multi-signal infrastructure issues with business impacts (like delayed shipping logs) and provides human-in-the-loop validation, preventing routing loops or unstable failovers.

## Objection 2: "Can Praxis execute failover actions automatically without human approval?"
**Response:** Yes, but we recommend our ASSISTED_ACTION mode. Praxis generates the exact CLI script required to reset interface states, presenting it to the network SRE for one-click approval. This prevents automated loops from triggering false failovers.
