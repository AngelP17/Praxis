# Executive Readout: Identity Onboarding Drift

## Incident Summary
- **Incident:** TKT-4799
- **Site:** Plant-A
- **Asset:** Active Directory
- **Primary Impact:** User onboarding delay and ERP access failures
- **Recurrence:** 2 times in 4 weeks
- **Root Cause:** Okta GPO policy drift combined with Active Directory group synchronization delays

## Decision
- **Priority Score:** 0.85
- **Evidence Trust:** 0.87
- **Recommendation:** Reconcile GPO policies, synchronize Okta user groups, and allocate pending ERP licenses
- **Action:** Human-approved IAM remediation workflow

## Value Case
- **Estimated Annual Value:** $64,800
- **Key Driver:** Avoided new hire idle downtime ($57,600/yr) + support engineering triage hours ($7,200/yr)
- **Confidence:** 85%

## Expansion Opportunities
- **IAM Lifecycle Automation:** Integrate directly with HR information system triggers to dynamically provision access.
- **Access Governance Auditing:** Run automated weekly compliance scans across all AD user accounts to detect permission creep.

## Next Step
Approve Phase 2 rollout for automated IAM onboarding reconciliation.
