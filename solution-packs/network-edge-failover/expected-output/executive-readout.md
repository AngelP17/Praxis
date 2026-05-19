# Executive Readout: Network Edge Resilience

## Incident Summary
- **Incident:** TKT-4814
- **Site:** Plant-A
- **Asset:** Firewall-EDGE-01
- **Primary Impact:** Shipping and ERP offline status
- **Recurrence:** 3 times in 3 weeks
- **Root Cause:** Primary ISP outage combined with secondary Starlink DHCP/DNS failures

## Decision
- **Priority Score:** 0.88
- **Evidence Trust:** 0.88
- **Recommendation:** Reset backup interfaces, temporarily route traffic via LTE, and flush DNS
- **Action:** Human-approved routing remediation workflow

## Value Case
- **Estimated Annual Value:** $47,100
- **Key Driver:** Avoided outbound shipping delays ($43,200/yr) + engineering triage hours ($3,900/yr)
- **Confidence:** 88%

## Expansion Opportunities
- **SD-WAN Policy Monitoring:** Monitor real-time routing metrics across other plant sites.
- **Failover SLA Tracking:** Automatically audit ISP SLA failure events for vendor rebates.

## Next Step
Approve Phase 2 rollout for Plant-A backup integration.
