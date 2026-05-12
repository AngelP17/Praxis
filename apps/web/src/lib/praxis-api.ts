import { api } from "./api";

export interface PraxisProof {
  proof_id: string;
  run_id: string;
  solution_pack: string;
  customer_context_hash: string;
  evidence: {
    raw_events: number;
    sources: string[];
    source_coverage: number;
    corroboration_score: number;
    freshness_score: number;
    evidence_trust: number;
  };
  ontology: {
    objects_created: number;
    links_created: number;
    actions_available: number;
    mapping_confidence: number;
  };
  decision: {
    root_cause_hypothesis: string;
    priority_score: number;
    confidence: number;
    requires_human_review: boolean;
    next_best_questions: string[];
  };
  action: {
    recommended_action: string;
    mode: string;
    actor: string;
    status: string;
    action_log_hash: string;
    run_id?: string;
  };
  value_case: {
    estimated_annual_value: number;
    confidence: number;
    primary_value_driver: string;
  };
  replay: {
    replay_hash: string;
    deterministic: boolean;
    verified_at: string;
  };
  proof_hash: string;
  generated_at: string;
}

export interface ProofVerificationResponse {
  valid: boolean;
  errors: string[];
  proof_id: string;
}

export const proofsApi = {
  getByPack: (packId: string) => api.get<PraxisProof>(`/proofs/${packId}`),
  create: (payload: { solution_pack: string; events: unknown[]; customer_context?: string }) =>
    api.post<PraxisProof>("/proofs", payload),
  verify: (proof: PraxisProof) => api.post<ProofVerificationResponse>("/proofs/verify", proof),
};

export type SolutionPackId = "manufacturing-printer-gpo" | "erp-access-disruption" | "k8s-ingress-degradation";

export interface SolutionPack {
  id: SolutionPackId;
  name: string;
  buyer: string;
  technicalPersona: string;
  score: string;
  annualValue: string;
  status: string;
  eventCount: number;
  sources: string[];
  rootCause: string;
  recommendedAction: string;
  priorityScore: number;
  evidenceTrust: number;
  valueConfidence: number;
  nextBestQuestions: string[];
  objectsCreated: number;
  linksCreated: number;
  mappingConfidence: number;
  primaryValueDriver: string;
}

export const SOLUTION_PACKS: SolutionPack[] = [
  {
    id: "manufacturing-printer-gpo",
    name: "Manufacturing Printer GPO",
    buyer: "Director of Operations",
    technicalPersona: "IT Infrastructure Lead",
    score: "0.86",
    annualValue: "$38.4K",
    status: "pilot now",
    eventCount: 12,
    sources: ["active_directory", "erp_shipping", "msp_ticketing", "network_monitor", "operator_note", "praxis", "print_server"],
    rootCause: "printer_deployment_policy_drift",
    recommendedAction: "validate_point_and_print_policy",
    priorityScore: 0.84,
    evidenceTrust: 0.826,
    valueConfidence: 0.68,
    nextBestQuestions: [
      "How many shipping documents were delayed?",
      "Which users are mapped through GPO versus direct IP?",
    ],
    objectsCreated: 9,
    linksCreated: 14,
    mappingConfidence: 0.79,
    primaryValueDriver: "reduced triage and shipping delay",
  },
  {
    id: "erp-access-disruption",
    name: "ERP Access Disruption",
    buyer: "VP Operations",
    technicalPersona: "Identity Platform Lead",
    score: "0.74",
    annualValue: "$67.2K",
    status: "demo + scope",
    eventCount: 6,
    sources: ["helpdesk", "identity_provider", "operator_note", "praxis", "warehouse_management"],
    rootCause: "sso_group_role_mismatch_during_provisioning",
    recommendedAction: "restore_erp_role_mapping",
    priorityScore: 0.81,
    evidenceTrust: 0.794,
    valueConfidence: 0.66,
    nextBestQuestions: [
      "Which ERP modules are blocked per user group?",
      "What is the fallback access process during SSO outages?",
    ],
    objectsCreated: 8,
    linksCreated: 12,
    mappingConfidence: 0.77,
    primaryValueDriver: "reduced access downtime and escalation churn",
  },
  {
    id: "k8s-ingress-degradation",
    name: "K8s Ingress Degradation",
    buyer: "VP Engineering",
    technicalPersona: "SRE Lead",
    score: "0.69",
    annualValue: "$94.5K",
    status: "demo + scope",
    eventCount: 6,
    sources: ["gitops", "incident_management", "ingress_controller", "kubernetes", "observability", "praxis"],
    rootCause: "ingress_config_rollback_conflict",
    recommendedAction: "rollback_ingress_policy",
    priorityScore: 0.88,
    evidenceTrust: 0.77,
    valueConfidence: 0.71,
    nextBestQuestions: [
      "Which ingress rules changed in the last deployment window?",
      "What is the current p95 latency vs baseline?",
    ],
    objectsCreated: 10,
    linksCreated: 16,
    mappingConfidence: 0.82,
    primaryValueDriver: "reduced outage duration and SRE triage time",
  },
];

export function getPackById(id: string): SolutionPack | undefined {
  return SOLUTION_PACKS.find((p) => p.id === id);
}

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
