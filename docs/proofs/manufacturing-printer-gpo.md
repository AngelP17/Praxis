# Praxis Proof Sheet: Manufacturing Printer GPO Drift

This document contains the engineering audit trail and proof signature for the GPO policy drift and driver misconfiguration scenario at a global manufacturing shipping terminal.

## Scenario Profile
* **Identifier**: `manufacturing-printer-gpo`
* **Domain**: Edge Operations / Industrial Logistics
* **Primary Asset**: Workstation `SHIP-04` (Shipping Terminal)
* **Underlying Anomaly**: Active Directory GPO policy drift causing misconfigured driver mappings on manufacturing shipping workstations.

## Operational Problem
At the logistics edge, shipping workstations rely on label printers mapped via Active Directory Group Policy Objects (GPOs). During a standard directory synchronization cycle, a configuration drift removed printer read permission from the shipping OU. Workstation `SHIP-04` was unable to initialize its driver mapping, blocking operators from printing physical cargo barcodes, resulting in delayed shipping lanes and manual verification backlogs.

## Signals Ingested (Event Spine)
The platform ingested 12 distinct operational signals, including:
1. `printer_mapping_missing`: Telemetry showing printer `WEIFPS01` not mapped.
2. `gpo_permission_issue`: Permission error during GPO query.
3. `point_and_print_missing`: Point and Print policy restrictions preventing fallback.
4. `local_ip_printer_drift`: Out-of-band printer IP shift without GPO sync.
5. `ticket_created`: Automated helpdesk ticket indicating blocked cargo operations.

## Graph Compiled (Ontology)
The Praxis compiler reconstructed the following operational dependency tree:
* **Terminal Site**: Shipping OU Terminals
* **Asset Node**: Workstation `SHIP-04`
* **Peripheral Edge**: Label Printer `WEIFPS01`
* **Business Process Node**: Physical Barcode Printing -> Cargo Shipping Lane Dispatch
* **Logical Flow**: Removing GPO read permissions breaks Driver Mapping -> stalls Barcode Printing -> halts Dispatch.

## Decision Generated
* **Scoring Priority**: `0.77`
* **Evidence Trust Vector**: `0.83` (high data fidelity across telemetry, directory logs, and ticket state)
* **Identified Root Cause**: Active Directory GPO policy drift.
* **Remediation Recommended**: Re-apply canonical shipping OU policy and update printer driver mappings.

## Human Approval Path
* **Safety Mode**: `HUMAN_APPROVAL` (Level 3 - Operator approval required before execution).
* **Action Logs**: Remediate via AD controller script -> Approved by Logistics Supervisor.
* **Audit Trail**: Signed with outbox outbox_message log entry.

## Replay Verification Hash
To ensure auditability, the entire event spine and ontology configuration was replayed through the scoring reasoner.
* **Expected Replay Hash**: `'sha' + '256:27ec7bc2d641ecd2ca1250176e83aa4893c0e645585201b08943e1a1c4fe19c1'`
* **Proof Object Hash**: `'sha' + '256:0369f17d1c7080fa74510c0bed40e2546ea101f2a8d73175a80b77d6f34bc599'`

## Business Value ROI
* **Annual Value Saved**: $38,481.60
* **Calculated Savings**:
  * Labor waste avoidance: 32 hours/month saved.
  * Shipping delay cost mitigation: $2,100 per hour of dispatch downtime avoided.

## Command to Reproduce
Run the FieldLab simulation locally to emit and verify this proof:
```bash
make praxis-proof
```
