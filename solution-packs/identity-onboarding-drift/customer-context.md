# Customer Context: Access Onboarding Drift

## Situation
In modern enterprises, hiring and role changes happen daily. New hires at Plant-A require access to active directory groups, identity providers (OKTA-IDP), shipping networks, and ERP access to execute shipping documentation.

## Complication
When user accounts are created, GPO mappings fail or sync slowly between the IDP and local Active Directory. Consequently, new workers suffer "access denied" ERP failures and are unable to perform their duties. Onboarding tickets sit in queue for days due to fragmented ownership between HR, local IT, and Platform teams.

## Impact
Every incident leaves high-value operators idle, costing over $200 per hour in idle labor and delays, while dragging down team onboarding velocity.

## Resolution
With Praxis, onboarding identity anomalies are detected immediately. Praxis correlates OKTA sync logs with AD group properties, detects active directory drift, and offers SREs a simple, human-in-the-loop action to synchronize groups and allocate required ERP licenses.
