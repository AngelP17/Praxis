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

const PACK_HASHES: Record<string, string> = {
  "manufacturing-printer-gpo":
    "sha256:f76f26dcb71a9e4c077eb1bde1fae0cb9f9a8d0a528c21c740a0181fc0ece3f3",
  "network-edge-failover":
    "sha256:d5c36453cdf4158538ff13991f3ba3a567027f4d7b1a67628fde7f1b8ffed30f",
  "identity-onboarding-drift":
    "sha256:d5c36453cdf4158538ff13991f3ba3a567027f4d7b1a67628fde7f1b8ffed30a",
  "database-failover-lag":
    "sha256:4f9ec24f5a66d3b595fdbe0ad3fe2c487130ceb31f27d1e4e7a9b2403bbcc2b7",
};

const PACK_CONTEXT_HASHES: Record<string, string> = {
  "manufacturing-printer-gpo":
    "sha256:abd0f9b374bcd8ffaedd80ef3bf5cff48c1a902667b045e4c037218c78c34a79",
  "network-edge-failover":
    "sha256:abc0e9b273bcd7ffaedd80ef3bf5cff47c1a802667b045e4c037218c78c34a78",
  "identity-onboarding-drift":
    "sha256:abc0e9b273bcd7ffaedd80ef3bf5cff47c1a802667b045e4c037218c78c34a75",
  "database-failover-lag":
    "sha256:c45f9d0375bc2df0f95de9dab75a2f1837394e305e7e4abfc75afd8f109943dd",
};

const PACK_ROOT_CAUSES: Record<string, string> = {
  "manufacturing-printer-gpo": "gpo_permission_drift",
  "network-edge-failover": "failover_route_degraded",
  "identity-onboarding-drift": "ad_onboarding_drift",
  "database-failover-lag": "postgresql_replication_lag",
};

const PACK_ACTIONS: Record<string, string> = {
  "manufacturing-printer-gpo": "approve_remediation",
  "network-edge-failover": "approve_remediation",
  "identity-onboarding-drift": "approve_remediation",
  "database-failover-lag": "tune_connection_pools",
};

const PACK_MODES: Record<string, string> = {
  "manufacturing-printer-gpo": "HUMAN_APPROVAL",
  "network-edge-failover": "HUMAN_APPROVAL",
  "identity-onboarding-drift": "HUMAN_APPROVAL",
  "database-failover-lag": "ASSISTED_ACTION",
};

const PACK_ACTORS: Record<string, string> = {
  "manufacturing-printer-gpo": "operator",
  "network-edge-failover": "operator",
  "identity-onboarding-drift": "operator",
  "database-failover-lag": "database-engineer",
};

const PACK_RISKS: Record<string, string> = {
  "manufacturing-printer-gpo": "medium",
  "network-edge-failover": "high",
  "identity-onboarding-drift": "medium",
  "database-failover-lag": "medium",
};

const PACK_ROLLBACKS: Record<string, string> = {
  "manufacturing-printer-gpo": "Revert AD permission settings and spooler restart",
  "network-edge-failover": "Rollback traffic to original WAN link",
  "identity-onboarding-drift": "Revert group membership changes to original AD state",
  "database-failover-lag": "Revert pgpool query routing parameters",
};

const PACK_EXPANSION: Record<string, Array<{ name: string; expansion_score: number; reason: string }>> = {
  "manufacturing-printer-gpo": [
    { name: "Identity Onboarding Drift", expansion_score: 0.81, reason: "Shared active directory framework" },
    { name: "Network Edge Failover", expansion_score: 0.72, reason: "Shared local network dependencies" },
  ],
  "network-edge-failover": [
    { name: "Database Replication Lag", expansion_score: 0.78, reason: "Shared edge routing availability" },
    { name: "Identity Onboarding Drift", expansion_score: 0.65, reason: "Shared platform operations framework" },
  ],
  "identity-onboarding-drift": [
    { name: "Manufacturing Printer Deployment Failure", expansion_score: 0.85, reason: "Shared access governance" },
    { name: "Database Replication Lag", expansion_score: 0.58, reason: "Shared authentication boundaries" },
  ],
  "database-failover-lag": [
    { name: "Network Edge Failover", expansion_score: 0.84, reason: "Shared infrastructure failover paths" },
    { name: "Identity Onboarding Drift", expansion_score: 0.61, reason: "Shared platform change management" },
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

function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const words: number[] = [];
  const asciiLength = ascii.length;

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106bb87f,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const wordsLength = ((asciiLength + 8) >> 6) + 1;
  const wordsCount = wordsLength * 16;
  for (let i = 0; i < wordsCount; i++) words[i] = 0;
  for (let i = 0; i < asciiLength; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
  words[wordsCount - 1] = asciiLength * 8;

  for (let i = 0; i < wordsCount; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (let j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;

      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (let j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  let finalHash = "";
  for (let i = 0; i < 8; i++) {
    const hex = (hash[i] >>> 0).toString(16);
    finalHash += "00000000".slice(hex.length) + hex;
  }
  return finalHash;
}

function canonicalJson(payload: any): string {
  if (payload === null || typeof payload !== "object") {
    return JSON.stringify(payload);
  }
  if (Array.isArray(payload)) {
    return "[" + payload.map(canonicalJson).join(",") + "]";
  }
  const sortedKeys = Object.keys(payload).sort();
  const pairs = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJson(payload[key])}`;
  });
  return "{" + pairs.join(",") + "}";
}

function computeProofHash(proof: any): string {
  const normalized = { ...proof };
  delete normalized.proof_hash;
  const canonical = canonicalJson(normalized);
  return `sha256:${sha256(canonical)}`;
}

export function getDemoProof(packId = "manufacturing-printer-gpo", runId = `fieldlab_run_${packId}`): PraxisProof {
  const pack = packFor(packId);
  const rawProof: Omit<PraxisProof, "proof_hash"> = {
    proof_id: `proof_${pack.id.replace(/-/g, "_")}_001`,
    run_id: runId,
    solution_pack: pack.id,
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
      action_log_hash: "",
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
      replay_hash: "",
      deterministic: true,
      verified_at: "2026-05-14T00:00:00Z",
    },
  };

  const computedHash = computeProofHash(rawProof);
  const proof: PraxisProof = {
    ...rawProof,
    proof_hash: computedHash,
  };
  proof.replay.replay_hash = computedHash;
  proof.action.action_log_hash = `sha256:${computedHash.replace("sha256:", "").slice(0, 48)}0000`;
  return proof;
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
