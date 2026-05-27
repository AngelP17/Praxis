import type {
  ActionCaptureResponse,
  FieldLabExecuteResponse,
  FieldLabRun,
  FieldLabTimeline,
  PraxisProof,
  SolutionPack,
} from "./praxis-client";
import generatedProofs from "./generated/proofs.generated.json";

export const DEMO_PACK_IDS = [
  "manufacturing-printer-gpo",
  "network-edge-failover",
  "identity-onboarding-drift",
  "database-failover-lag",
] as const;

export const DEMO_PACKS: SolutionPack[] = [
  {
    id: "manufacturing-printer-gpo",
    name: "Manufacturing Printer Deployment Failure",
    industry: "Manufacturing",
    buyer: "VP of Manufacturing Operations",
    primary_pain: "Recurring printer GPO failures delay shipments by 4-6 hours per incident",
    demo_length_minutes: 7,
    event_count: 8,
    sources: ["active_directory", "print_server", "helpdesk", "network_monitor", "observability", "erp_shipping"],
    eventCount: 8,
    score: "0.87",
    annualValue: "$38,400",
    status: "production",
    rootCause: "gpo_permission_drift",
    recommendedAction: "approve_remediation",
    priorityScore: 0.87,
    evidenceTrust: 0.91,
    valueConfidence: 0.91,
    nextBestQuestions: ["delayed_shipments", "support_hours", "vendor_escalations"],
    objectsCreated: 12,
    linksCreated: 45,
    mappingConfidence: 0.84,
    primaryValueDriver: "Downtime reduction",
    technicalPersona: "Active Directory Administrator",
  },
  {
    id: "network-edge-failover",
    name: "Network Edge Failover",
    industry: "Logistics",
    buyer: "Director of Supply Chain",
    primary_pain: "Primary ISP outages combined with misconfigured backup routes block outbound shipping",
    demo_length_minutes: 5,
    event_count: 8,
    sources: ["network_monitor", "msp_ticketing", "praxis", "operator_note"],
    eventCount: 8,
    score: "0.88",
    annualValue: "$47,100",
    status: "production",
    rootCause: "failover_route_degraded",
    recommendedAction: "approve_remediation",
    priorityScore: 0.88,
    evidenceTrust: 0.88,
    valueConfidence: 0.88,
    nextBestQuestions: ["delayed_shipments", "support_hours"],
    objectsCreated: 9,
    linksCreated: 49,
    mappingConfidence: 0.84,
    primaryValueDriver: "Outbound shipping availability",
    technicalPersona: "Platform Engineer",
  },
  {
    id: "identity-onboarding-drift",
    name: "Identity Onboarding Drift",
    industry: "Logistics",
    buyer: "VP of Human Resources",
    primary_pain: "Fragmented access onboarding ownership blocks new hires from shipping workflows for days",
    demo_length_minutes: 5,
    event_count: 8,
    sources: ["active_directory", "identity_provider", "msp_ticketing", "praxis"],
    eventCount: 8,
    score: "0.85",
    annualValue: "$64,800",
    status: "production",
    rootCause: "ad_onboarding_drift",
    recommendedAction: "approve_remediation",
    priorityScore: 0.85,
    evidenceTrust: 0.87,
    valueConfidence: 0.85,
    nextBestQuestions: ["employee_onboarding_delay", "support_hours"],
    objectsCreated: 8,
    linksCreated: 35,
    mappingConfidence: 0.88,
    primaryValueDriver: "Labor savings & idle downtime reduction",
    technicalPersona: "Identity Platform Engineer",
  },
  {
    id: "database-failover-lag",
    name: "Database Replication Lag",
    industry: "Technology Services",
    buyer: "Director of Infrastructure",
    primary_pain: "Transactional latency and replication spikes cause order timeouts and database lockouts",
    demo_length_minutes: 8,
    event_count: 12,
    sources: ["postgres-replica", "pgpool_load_balancer", "monitoring_alerts", "checkout_microservice", "helpdesk"],
    eventCount: 12,
    score: "0.92",
    annualValue: "$110,000",
    status: "production",
    rootCause: "postgresql_replication_lag",
    recommendedAction: "tune_connection_pools",
    priorityScore: 0.92,
    evidenceTrust: 0.92,
    valueConfidence: 0.92,
    nextBestQuestions: ["checkout_timeout_count", "average_query_latency_ms"],
    objectsCreated: 10,
    linksCreated: 40,
    mappingConfidence: 0.85,
    primaryValueDriver: "Database latency & SLA breach prevention",
    technicalPersona: "Principal Database Engineer",
  },
];

export const DEMO_PIPELINE_STAGES = [
  { stage: "s3.write", label: "Archiving raw events to S3" },
  { stage: "sqs.send", label: "Queuing incident events via SQS" },
  { stage: "dynamo.put", label: "Writing state to DynamoDB" },
  { stage: "events.emit", label: "Emitting workflow events via EventBridge" },
  { stage: "proof.hash", label: "Computing deterministic proof hash" },
  { stage: "proof.verify", label: "Verifying L0 proof contract" },
] as const;

export const DEMO_HEALTH = {
  status: "healthy",
  endpoint: "demo://fieldlab",
  services: {
    s3: { status: "healthy", endpoint: "demo://s3" },
    sqs: { status: "healthy", endpoint: "demo://sqs" },
    dynamodb: { status: "healthy", endpoint: "demo://dynamodb" },
    events: { status: "healthy", endpoint: "demo://events" },
  },
};

function packFor(packId: string) {
  return DEMO_PACKS.find((pack) => pack.id === packId) ?? DEMO_PACKS[0];
}

const GENERATED_PROOFS = generatedProofs as Record<string, PraxisProof>;

export function getDemoProof(packId = "manufacturing-printer-gpo", _runId?: string): PraxisProof {
  const proof = GENERATED_PROOFS[packId] ?? GENERATED_PROOFS["manufacturing-printer-gpo"];
  return structuredClone(proof);
}

export const DEMO_PROOF = getDemoProof();

export function getDemoRun(packId = "manufacturing-printer-gpo"): FieldLabRun {
  return {
    run_id: `demo_${packId}`,
    solution_pack_id: packId,
    customer_profile: {
      buyer: packFor(packId).buyer,
      industry: packFor(packId).industry,
    },
    status: "created",
    floci_endpoint: DEMO_HEALTH.endpoint,
    started_at: "2026-05-14T00:00:00Z",
    completed_at: null,
    summary_json: null,
    created_at: "2026-05-14T00:00:00Z",
  };
}

export function getDemoTimeline(packId = "manufacturing-printer-gpo", runId = `demo_${packId}`): FieldLabTimeline {
  const proof = getDemoProof(packId, runId);
  return {
    run_id: proof.run_id,
    solution_pack_id: packId,
    status: "executed",
    metadata: {
      pack_id: packId,
      proof_hash: proof.proof_hash,
    },
    events: [
      { event_type: "SignalsIngested", status: "verified", actor: "fieldlab", proof_impact: packFor(packId).event_count },
      { event_type: "OntologyCompiled", status: "verified", actor: "compiler", proof_impact: proof.ontology.objects_created },
      { event_type: "DecisionScored", status: "verified", actor: "astraea", proof_impact: proof.decision.priority_score },
      { event_type: "ActionPrepared", status: "pending_review", actor: "operator", proof_impact: proof.action.recommended_action },
      { event_type: "ProofBuilt", status: "verified", actor: "api", proof_impact: proof.proof_hash },
    ],
  };
}

export function getDemoExecuteResponse(packId = "manufacturing-printer-gpo", runId = `demo_${packId}`): FieldLabExecuteResponse {
  const proof = getDemoProof(packId, runId);
  return {
    run_id: runId,
    status: "executed",
    proof,
    decisions_generated: 1,
    priority_score: proof.decision.priority_score,
    evidence_trust: proof.evidence.evidence_trust,
    root_cause_hypothesis: proof.decision.root_cause_hypothesis,
    ontology_objects: proof.ontology.objects_created,
    actions_captured: 1,
    action_mode: proof.action.mode,
    estimated_annual_value: proof.value_case.estimated_annual_value,
  };
}

export function getDemoActionCapture(
  runId: string,
  packId = "manufacturing-printer-gpo",
  status: "approved" | "rejected" | "request_evidence" | "escalated" = "approved",
): ActionCaptureResponse {
  const proof = getDemoProof(packId, runId);
  return {
    run_id: runId,
    status: "captured",
    action: {
      ...proof.action,
      status,
      actor: "operator",
    },
    proof_hash: proof.proof_hash,
  };
}

export function getDemoPipelineCompletion(packId = "manufacturing-printer-gpo", runId = `fieldlab_run_${packId}`) {
  const proof = getDemoProof(packId, runId);
  return {
    run_id: proof.run_id,
    solution_pack: packId,
    proof_hash: proof.proof_hash,
    conformance: "L0",
    events_processed: proof.evidence.raw_events,
    ontology_objects: proof.ontology.objects_created,
    priority_score: proof.decision.priority_score,
    evidence_trust: proof.evidence.evidence_trust,
    estimated_value: proof.value_case.estimated_annual_value,
    download_url: `/api/proofs/${packId}`,
    verify_command: `uvx praxis-verify artifacts/latest/${packId}/praxis_proof.json --level L0`,
  };
}
