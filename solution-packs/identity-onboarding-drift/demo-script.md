# Demo Script: Identity Onboarding Drift

This script demonstrates how Praxis simplifies access governance and automates role mapping.

## Introduction (2 minutes)
- Introduce the new hire onboarding process in the Praxis UI.
- Explain the key problem: new hires blocked from ERP shipping, wasting hours of high-value labor.
- Point out the IAM ontology: Alice Smith (Identity SRE) managing OKTA and Active Directory mappings.

## The Incident (1 minute)
- Ingest an ad_onboarding_drift event, representing GPO sync failures.
- Show that access_denied_erp logs are generated because GPO group mappings did not execute correctly.
- Observe Praxis grouping these signals into a high-priority incident block.

## Correlation & Resolution (2 minutes)
- Praxis correlates the logs to identify the root cause: "identity onboarding drift due to GPO group sync block."
- Show the recommended action: sync identity groups and allocate ERP license.
- Click Approve to automatically trigger the Active Directory role mapping task, instantly restoring new operator access.
