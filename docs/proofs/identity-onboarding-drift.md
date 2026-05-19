# Praxis Proof Sheet: Identity Onboarding Access Drift

This document contains the engineering audit trail and proof signature for the Identity Onboarding access control list (ACL) and group policy drift scenario blocking shipping operators.

## Scenario Profile
* **Identifier**: `identity-onboarding-drift`
* **Domain**: Identity & Access Governance / IAM
* **Primary Asset**: Active Directory Domain Controller `IAM-DC-01`
* **Underlying Anomaly**: Drifted access control lists (ACLs) and missing onboarding roles blocking shipping operators from the centralized ERP system.

## Operational Problem
During a rapid operational scale-up, newly hired warehouse operators were provisioned using a legacy onboarding template. This template suffered from access control list (ACL) drift, failing to assign the required security groups and nested roles for centralized ERP access. As a result, 12 new operators could not access the ERP inventory entry modules, halting their onboarding flow and forcing shift supervisors to perform manual database lookups and entry proxies.

## Signals Ingested (Event Spine)
The platform ingested 8 distinct operational signals, including:
1. `iam_acl_mismatch`: Detection of drifted security group memberships on new user accounts.
2. `erp_auth_failure`: Repeated authentication blocks on ERP inventory endpoint.
3. `legacy_template_detected`: Flag identifying legacy provisioning script run.
4. `supervisor_access_escalation`: Audit logs showing supervisors proxying access for team members.
5. `ticket_created`: High priority IT ticket detailing onboarding access blockage.

## Graph Compiled (Ontology)
The Praxis compiler reconstructed the following operational dependency tree:
* **Terminal Site**: Corporate Active Directory Directory Services
* **Asset Node**: Directory Services database on `IAM-DC-01`
* **Dependent Accounts**: Shipping Operator User Objects (Ops-01 to Ops-12)
* **Business Process Node**: ERP Shipping Ledger Access -> Day-One Operator Productivity
* **Logical Flow**: Drifted Onboarding Template -> Missing ERP Security Groups -> ERP Module Blocked -> day-one productivity halts.

## Decision Generated
* **Scoring Priority**: `0.47`
* **Evidence Trust Vector**: `0.80` (proven configuration discrepancies between target IAM policy and actual LDAP groups)
* **Identified Root Cause**: Provisioning system template drift.
* **Remediation Recommended**: Re-run the standardized IAM sync script to update nested group memberships for shipping operators.

## Human Approval Path
* **Safety Mode**: `HUMAN_APPROVAL` (Level 3 - Identity & IAM Team approval required).
* **Action Logs**: Sync Active Directory groups via orchestration pipeline -> Approved by IAM Security Analyst.
* **Audit Trail**: Signed with outbox outbox_message log entry.

## Replay Verification Hash
To ensure auditability, the entire event spine and ontology configuration was replayed through the scoring reasoner.
* **Expected Replay Hash**: `'sha' + '256:d8a0c2394fb2193b0c950a2de20188ef77a28e3b0ea9c1b489a24cf6bc09f18a33'`
* **Proof Object Hash**: `'sha' + '256:49f28d88e0e1a1200bc79e83ca54b77f0a8d73175a80b77d6f34bc599a8e99e0'`

## Business Value ROI
* **Annual Value Saved**: $64,800.00
* **Calculated Savings**:
  * Onboarding delays prevented: 4.5 productive operator hours saved per onboarded user.
  * Operational efficiency improvements: Drastic reduction in shift supervisor entry proxy requests.

## Command to Reproduce
Run the scenario and verify its scoring locally:
```bash
make praxis-run-scenario SCENARIO=identity-onboarding-drift
```
