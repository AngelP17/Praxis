import type {
  ActionCaptureResponse,
  FieldLabExecuteResponse,
  FieldLabRun,
  FieldLabTimeline,
  PraxisProof,
  SolutionPack,
} from "./praxis-client";

export const DEMO_PACK_IDS = [
  "manufacturing-printer-gpo",
  "erp-access-disruption",
  "k8s-ingress-degradation",
] as const;

export const DEMO_PACKS: SolutionPack[] = [
  {
    id: "manufacturing-printer-gpo",
    name: "Manufacturing Printer Deployment Failure",
    industry: "Manufacturing",
    buyer: "VP of Manufacturing Operations",
    primary_pain: "Recurring printer GPO failures delay shipments by 4-6 hours per incident",
    demo_length_minutes: 7,
    event_count: 12,
    sources: ["active_directory", "print_server", "helpdesk", "network_monitor", "observability", "erp_shipping", "sccm_client"],
    eventCount: 12,
    score: "0.77",
    annualValue: "$38,482",
    status: "production",
    rootCause: "printer_deployment_policy_drift",
    recommendedAction: "approve_remediation",
    priorityScore: 0.7708,
    evidenceTrust: 0.829,
    valueConfidence: 0.77,
    nextBestQuestions: ["delayed_shipments", "support_hours", "vendor_escalations"],
    objectsCreated: 12,
    linksCreated: 45,
    mappingConfidence: 0.84,
    primaryValueDriver: "Downtime reduction",
    technicalPersona: "Active Directory Administrator",
  },
  {
    id: "erp-access-disruption",
    name: "ERP Access Disruption",
    industry: "Logistics",
    buyer: "Director of Supply Chain",
    primary_pain: "ERP access failures block warehouse operations for 2-3 hours per event",
    demo_length_minutes: 5,
    event_count: 9,
    sources: ["identity_provider", "erp_shipping", "helpdesk", "network_monitor", "wms_integration"],
    eventCount: 9,
    score: "0.72",
    annualValue: "$31,200",
    status: "staging",
    rootCause: "identity_provider_token_expiry",
    recommendedAction: "rotate_idp_tokens",
    priorityScore: 0.72,
    evidenceTrust: 0.78,
    valueConfidence: 0.72,
    nextBestQuestions: ["wms_sync_latency", "fallback_auth_configured"],
    objectsCreated: 8,
    linksCreated: 28,
    mappingConfidence: 0.79,
    primaryValueDriver: "Labor savings",
    technicalPersona: "Identity Platform Engineer",
  },
  {
    id: "k8s-ingress-degradation",
    name: "Kubernetes Ingress Degradation",
    industry: "Technology",
    buyer: "VP of Platform Engineering",
    primary_pain: "Ingress controller misconfiguration degrades API response times by 800%",
    demo_length_minutes: 6,
    event_count: 10,
    sources: ["kubernetes", "observability", "network_monitor", "gitops", "helpdesk", "ingress_controller"],
    eventCount: 10,
    score: "0.75",
    annualValue: "$35,600",
    status: "staging",
    rootCause: "ingress_annotation_drift",
    recommendedAction: "rollback_ingress_config",
    priorityScore: 0.75,
    evidenceTrust: 0.86,
    valueConfidence: 0.75,
    nextBestQuestions: ["replica_count", "node_pool_utilization"],
    objectsCreated: 10,
    linksCreated: 38,
    mappingConfidence: 0.87,
    primaryValueDriver: "API availability",
    technicalPersona: "Platform SRE",
  },
];

const PACK_HASHES: Record<string, string> = {
  "manufacturing-printer-gpo":
    "sha256:f76f26dcb71a9e4c077eb1bde1fae0cb9f9a8d0a528c21c740a0181fc0ece3f3",
  "erp-access-disruption":
    "sha256:1d4aa5bd26e57a1bfdca0d1f16d53be0161677726861fc4bb7d84a2bcefb3567",
  "k8s-ingress-degradation":
    "sha256:4f9ec24f5a66d3b595fdbe0ad3fe2c487130ceb31f27d1e4e7a9b2403bbcc2b7",
};

const PACK_CONTEXT_HASHES: Record<string, string> = {
  "manufacturing-printer-gpo":
    "sha256:abd0f9b374bcd8ffaedd80ef3bf5cff48c1a902667b045e4c037218c78c34a79",
  "erp-access-disruption":
    "sha256:5b1d35b51375d4d1ff81a6e6d9d7bc4a958cc95f4277785b98280e1c50e5f577",
  "k8s-ingress-degradation":
    "sha256:c45f9d0375bc2df0f95de9dab75a2f1837394e305e7e4abfc75afd8f109943dd",
};

const PACK_ROOT_CAUSES: Record<string, string> = {
  "manufacturing-printer-gpo": "printer_deployment_policy_drift",
  "erp-access-disruption": "identity_provider_token_expiry",
  "k8s-ingress-degradation": "ingress_annotation_drift",
};

const PACK_ACTIONS: Record<string, string> = {
  "manufacturing-printer-gpo": "approve_remediation",
  "erp-access-disruption": "rotate_idp_tokens",
  "k8s-ingress-degradation": "rollback_ingress_config",
};

const PACK_MODES: Record<string, string> = {
  "manufacturing-printer-gpo": "HUMAN_APPROVAL",
  "erp-access-disruption": "ASSISTED_ACTION",
  "k8s-ingress-degradation": "HUMAN_APPROVAL",
};

const PACK_ACTORS: Record<string, string> = {
  "manufacturing-printer-gpo": "operator",
  "erp-access-disruption": "identity-admin",
  "k8s-ingress-degradation": "platform-sre",
};

const PACK_RISKS: Record<string, string> = {
  "manufacturing-printer-gpo": "medium",
  "erp-access-disruption": "medium",
  "k8s-ingress-degradation": "high",
};

const PACK_ROLLBACKS: Record<string, string> = {
  "manufacturing-printer-gpo": "Requires rollback plan",
  "erp-access-disruption": "Re-enable previous token policy if auth errors rise",
  "k8s-ingress-degradation": "Revert ingress manifest to last healthy deployment",
};

const PACK_EXPANSION: Record<string, Array<{ name: string; expansion_score: number; reason: string }>> = {
  "manufacturing-printer-gpo": [
    { name: "ERP Access Disruption", expansion_score: 0.68, reason: "Shared identity provider" },
    { name: "K8s Ingress Degradation", expansion_score: 0.55, reason: "Infrastructure dependency" },
  ],
  "erp-access-disruption": [
    { name: "Manufacturing Printer Deployment Failure", expansion_score: 0.61, reason: "Shared directory governance" },
    { name: "K8s Ingress Degradation", expansion_score: 0.49, reason: "Shared auth edge patterns" },
  ],
  "k8s-ingress-degradation": [
    { name: "ERP Access Disruption", expansion_score: 0.59, reason: "Shared platform auth boundary" },
    { name: "Manufacturing Printer Deployment Failure", expansion_score: 0.46, reason: "Shared change governance" },
  ],
};

export const DEMO_PIPELINE_STAGES = [
  { stage: "s3.write", label: "Archiving raw events to S3" },
  { stage: "sqs.send", label: "Queuing incident events via SQS" },
  { stage: "dynamo.put", label: "Writing state to DynamoDB" },
  { stage: "events.emit", label: "Emitting workflow events via EventBridge" },
  { stage: "proof.hash", label: "Computing deterministic proof hash" },
  { stage: "proof.sign", label: "Signing proof with Ed25519" },
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

export function getDemoProof(packId = "manufacturing-printer-gpo", runId = `fieldlab_run_${packId}`): PraxisProof {
  const pack = packFor(packId);
  return {
    proof_id: `proof_${pack.id.replace(/-/g, "_")}_001`,
    run_id: runId,
    solution_pack: pack.id,
    proof_hash: PACK_HASHES[pack.id] ?? PACK_HASHES["manufacturing-printer-gpo"],
    customer_context_hash:
      PACK_CONTEXT_HASHES[pack.id] ?? PACK_CONTEXT_HASHES["manufacturing-printer-gpo"],
    generated_at: "2026-05-14T00:00:00Z",
    decision: {
      priority_score: pack.priorityScore,
      root_cause_hypothesis: PACK_ROOT_CAUSES[pack.id] ?? pack.rootCause,
      requires_human_review: true,
      evidence_trust: pack.evidenceTrust,
      confidence: pack.valueConfidence,
      next_best_questions: pack.nextBestQuestions.map((question, index) => ({
        question: `What is the value for ${question}?`,
        field: question,
        expected_confidence_gain: Number((0.17 - index * 0.02).toFixed(2)),
        business_impact_weight: Number((0.5 + index * 0.1).toFixed(2)),
        acquisition_feasibility: Number((0.7 - index * 0.08).toFixed(2)),
        reason: `Expected confidence gain: ${Number((0.17 - index * 0.02).toFixed(2))}`,
      })),
    },
    evidence: {
      evidence_trust: pack.evidenceTrust,
      raw_events: pack.event_count,
      sources: pack.sources,
    },
    ontology: {
      objects_created: pack.objectsCreated,
      links_created: pack.linksCreated,
      actions_available: 6,
      mapping_confidence: pack.mappingConfidence,
    },
    action: {
      recommended_action: PACK_ACTIONS[pack.id] ?? pack.recommendedAction,
      mode: PACK_MODES[pack.id] ?? "HUMAN_APPROVAL",
      actor: PACK_ACTORS[pack.id] ?? "operator",
      status: "approved",
      run_id: runId,
      risk: PACK_RISKS[pack.id] ?? "medium",
      rollback: PACK_ROLLBACKS[pack.id] ?? "Requires rollback plan",
      action_log_hash: `sha256:${(PACK_HASHES[pack.id] ?? "").replace("sha256:", "").slice(0, 48)}0000`,
    },
    value_case: {
      estimated_annual_value: Number(pack.annualValue.replace(/[$,]/g, "")),
      confidence: pack.valueConfidence,
      bucket: pack.priorityScore >= 0.75 ? "High Value" : "Qualified",
      primary_value_driver: pack.primaryValueDriver,
      roi_calculations: {
        annual_value: Number(pack.annualValue.replace(/[$,]/g, "")),
        labor_savings: Math.round(Number(pack.annualValue.replace(/[$,]/g, "")) * 0.31),
        downtime_savings: Math.round(Number(pack.annualValue.replace(/[$,]/g, "")) * 0.57),
        risk_reduction: Math.round(Number(pack.annualValue.replace(/[$,]/g, "")) * 0.12),
      },
    },
    expansion: PACK_EXPANSION[pack.id] ?? PACK_EXPANSION["manufacturing-printer-gpo"],
    replay: {
      replay_hash: PACK_HASHES[pack.id] ?? PACK_HASHES["manufacturing-printer-gpo"],
      deterministic: true,
      verified_at: "2026-05-14T00:00:00Z",
    },
  };
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
    run_id: runId,
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
    run_id: runId,
    solution_pack: packId,
    proof_hash: proof.proof_hash,
    conformance: "L1",
    events_processed: proof.evidence.raw_events,
    ontology_objects: proof.ontology.objects_created,
    priority_score: proof.decision.priority_score,
    evidence_trust: proof.evidence.evidence_trust,
    estimated_value: proof.value_case.estimated_annual_value,
    download_url: `/api/proofs/${packId}`,
    verify_command: `uvx praxis-verify artifacts/latest/${packId}/praxis_proof.json`,
  };
}
