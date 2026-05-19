# Security Review: Identity Onboarding Drift Controls

## Data Privacy & Access Control
Praxis functions as a secure identity telemetry listener. Event metadata such as GPO mapping checks, Okta sync statuses, and Active Directory permission drift logs are monitored via secure LDAP and identity provider webhooks. User passwords, credentials, and personal identifiable information are explicitly filtered and never stored or transmitted.

## Execution Model Security
Identity group synchronization actions are carried out via standard API calls using scoped credentials with OAuth2 or service-account delegation. Automated workflows never execute destructive AD changes. Active Directory modifications (such as group reassignment or provisioning ERP licenses) require explicit HUMAN_APPROVAL prior to action dispatch.
