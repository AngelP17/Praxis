"use client";

import type { PraxisProof } from "./praxis-client";

export const DEMO_PROOF: PraxisProof = {
  proof_id: "proof_praxis_manufacturing_printer_gpo_001",
  run_id: "fieldlab_run_manufacturing-printer-gpo",
  solution_pack: "manufacturing-printer-gpo",
  proof_hash:
    "sha256:f76f26dcb71a9e4c077eb1bde1fae0cb9f9a8d0a528c21c740a0181fc0ece3f3",
  customer_context_hash:
    "sha256:abd0f9b374bcd8ffaedd80ef3bf5cff48c1a902667b045e4c037218c78c34a79",
  generated_at: "2026-05-14T00:00:00Z",
  decision: {
    priority_score: 0.7708,
    root_cause_hypothesis: "printer_deployment_policy_drift",
    requires_human_review: true,
    evidence_trust: 0.829,
    confidence: 0.829,
    next_best_questions: [
      {
        question: "What is the value for delayed_shipments?",
        field: "delayed_shipments",
        expected_confidence_gain: 0.17,
        business_impact_weight: 0.5,
        acquisition_feasibility: 0.7,
        reason: "Expected confidence gain: 0.17",
      },
    ],
  },
  evidence: {
    evidence_trust: 0.829,
    raw_events: 12,
    sources: [
      "active_directory",
      "erp_shipping",
      "helpdesk",
      "identity_provider",
      "kubernetes",
      "msp_ticketing",
      "network_monitor",
      "observability",
      "operator_note",
      "praxis",
      "print_server",
      "sccm_client",
    ],
  },
  ontology: {
    objects_created: 12,
    links_created: 45,
    actions_available: 6,
    mapping_confidence: 0.84,
  },
  action: {
    recommended_action: "approve_remediation",
    mode: "HUMAN_APPROVAL",
    actor: "operator",
    status: "approved",
    run_id: "fieldlab_run_manufacturing-printer-gpo",
    risk: "medium",
    rollback: "Requires rollback plan",
    action_log_hash:
      "sha256:64caf0ce28bfd9e6728f7fde527cbbce02102369fb9df3fc5163b07e51c78a60",
  },
  value_case: {
    estimated_annual_value: 38481.6,
    confidence: 0.77,
    bucket: "High Value",
    primary_value_driver: "Downtime reduction",
    roi_calculations: {
      annual_value: 38481.6,
      labor_savings: 12000,
      downtime_savings: 22000,
      risk_reduction: 4481.6,
    },
  },
  expansion: [
    { name: "ERP Access Disruption", expansion_score: 0.68, reason: "Shared identity provider" },
    { name: "K8s Ingress Degradation", expansion_score: 0.55, reason: "Infrastructure dependency" },
  ],
  replay: {
    replay_hash:
      "sha256:f76f26dcb71a9e4c077eb1bde1fae0cb9f9a8d0a528c21c740a0181fc0ece3f3",
    deterministic: true,
    verified_at: "2026-05-14T00:00:00Z",
  },
};
