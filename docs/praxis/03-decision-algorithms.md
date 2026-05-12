# Decision Algorithms

## Praxis Priority Score

praxis_priority = 0.16 * operational_severity + 0.14 * business_process_criticality + 0.13 * customer_visible_impact + 0.12 * recurrence_risk + 0.10 * dependency_centrality + 0.10 * sla_exposure + 0.08 * stakeholder_urgency + 0.07 * actionability + 0.05 * expansion_relevance + 0.05 * evidence_trust - 0.10 * uncertainty_penalty

## Evidence Trust Score

evidence_trust = 0.25 * source_reliability + 0.20 * freshness + 0.20 * corroboration + 0.15 * completeness + 0.10 * consistency + 0.10 * auditability

## Use Case Qualification

use_case_score = 0.18 * pain_intensity + 0.15 * data_readiness + 0.14 * stakeholder_urgency + 0.13 * workflow_writeback_potential + 0.12 * measurable_value + 0.10 * deployability + 0.08 * security_feasibility + 0.05 * expansion_leverage + 0.05 * differentiation

Buckets: 0.80+ pilot now, 0.65-0.79 demo and scope, 0.45-0.64 discovery required, 0.00-0.44 disqualify

## Value of Information

VOI(field) = expected_confidence_gain * business_impact_weight * decision_sensitivity * acquisition_feasibility

## Expansion Score

expansion_score = 0.25 * shared_data_model + 0.20 * stakeholder_overlap + 0.20 * measurable_value + 0.15 * implementation_reuse + 0.10 * urgency + 0.10 * executive_visibility
