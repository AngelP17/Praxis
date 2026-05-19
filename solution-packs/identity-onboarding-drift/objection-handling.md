# Objection Handling: Identity Onboarding Drift

## Objection 1: "We already have an IAM tool (like SailPoint). Why do we need Praxis?"
**Response:** SailPoint manages the provisioning requests, but it does not observe or correlate downstream runtime errors, such as GPO replication failures, local AD lockups, or license allocation exhaustion at the edge. Praxis monitors these runtime behaviors and automatically connects them back to the active ticket, giving the operator real-time visibility into onboarding friction.

## Objection 2: "Can automated group sync write changes back to Active Directory?"
**Response:** Yes, but only with explicit HUMAN_APPROVAL. Praxis compiles the precise group modification payload and presents it to the SRE. Changes are only committed once an authorized administrator clicks Approve in the Praxis interface.
