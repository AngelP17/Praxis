import { SOLUTION_PACKS, type SolutionPack, type SolutionPackId } from "./praxis-api";
import { SeededRandom, proofHash } from "./praxis-hash";

export interface WorkflowEvent {
  timestamp: string;
  source: string;
  type: string;
  summary: string;
  severity: "low" | "medium" | "high";
}

export interface WorkflowStep {
  label: string;
  status: "completed" | "active" | "pending";
  timestamp: string;
  detail: string;
}

export interface OntologyObject {
  type: string;
  key: string;
  links: number;
}

export interface DecisionWeight {
  label: string;
  value: number;
  weight: number;
}

export interface WorkflowAssumption {
  label: string;
  value: string;
}

export interface ExpansionOpportunity {
  label: string;
  score: string;
}

export interface PraxisWorkflowRun {
  runId: string;
  pack: SolutionPack;
  site: string;
  businessProcess: string;
  workflowSummary: string;
  fieldlabEndpoint: string;
  services: Array<{ service: string; resource: string; status: string }>;
  events: WorkflowEvent[];
  timeline: WorkflowStep[];
  ontologyObjects: OntologyObject[];
  mappingFactors: Array<{ label: string; value: number }>;
  decisionWeights: DecisionWeight[];
  assumptions: WorkflowAssumption[];
  expansion: ExpansionOpportunity[];
  proofHashPreview: string;
}

const STEP_LABELS = ["Select", "Context", "Compile", "FieldLab", "Stream", "Decide", "Action", "Readout"];

const SEVERITY_WEIGHTS: Array<{ severity: "high" | "medium" | "low"; weight: number }> = [
  { severity: "high", weight: 3 },
  { severity: "medium", weight: 4 },
  { severity: "low", weight: 3 },
];

const DECISION_LABEL_LIBRARY = [
  "operational severity",
  "business criticality",
  "customer impact",
  "recurrence risk",
  "evidence trust",
  "remediation speed",
  "blast radius",
  "compliance urgency",
  "sla breach",
  "stakeholder escalation",
];

const EXPANSION_LIBRARY = [
  "asset inventory accuracy",
  "vendor SLA tracking",
  "ticket routing optimization",
  "compliance evidence automation",
  "change management analytics",
  "capacity planning readout",
  "incident communications",
  "access governance review",
  "deployment guardrails",
  "cost attribution model",
  "security posture scoring",
  "tenant isolation audit",
];

const MAPPING_FACTOR_LIBRARY = [
  "schema coverage",
  "field consistency",
  "relationship density",
  "source reliability",
  "semantic match",
  "temporal alignment",
  "identity resolution",
  "context richness",
];

const ASSUMPTION_TEMPLATES_BY_PACK: Record<string, Array<{ label: string; value: string }>> = {
  "manufacturing-printer-gpo": [
    { label: "incidents per month", value: "" },
    { label: "minutes lost per incident", value: "" },
    { label: "loaded labor rate", value: "" },
    { label: "shipment delay cost", value: "" },
    { label: "current triage", value: "" },
    { label: "praxis triage", value: "" },
  ],
  "erp-access-disruption": [
    { label: "incidents per month", value: "" },
    { label: "downtime minutes", value: "" },
    { label: "blocked orders per incident", value: "" },
    { label: "loaded labor rate", value: "" },
    { label: "order cost per hour", value: "" },
    { label: "escalation reduction", value: "" },
  ],
  "k8s-ingress-degradation": [
    { label: "incidents per quarter", value: "" },
    { label: "incident minutes", value: "" },
    { label: "failed requests per incident", value: "" },
    { label: "request cost", value: "" },
    { label: "SRE triage hours", value: "" },
    { label: "MTTR reduction", value: "" },
  ],
};

function fillAssumptionValues(
  templates: Array<{ label: string; value: string }>,
  rng: SeededRandom,
  pack: SolutionPack,
): WorkflowAssumption[] {
  const monthlyIncidents = rng.int(4, 16);
  const minutesPerIncident = rng.int(25, 65);
  const hourlyRate = rng.int(40, 85);
  const annualValue = parseInt(pack.annualValue.replace(/[^0-9.]/g, "")) * (pack.annualValue.includes("K") ? 1000 : 1);

  return templates.map((t, i) => {
    if (t.label.includes("incidents per month")) return { label: t.label, value: String(monthlyIncidents) };
    if (t.label.includes("incidents per quarter")) return { label: t.label, value: String(rng.int(3, 8)) };
    if (t.label.includes("minutes lost per incident") || t.label.includes("downtime minutes") || t.label.includes("incident minutes"))
      return { label: t.label, value: String(minutesPerIncident) };
    if (t.label.includes("loaded labor rate")) return { label: t.label, value: `$${hourlyRate}/hr` };
    if (t.label.includes("shipment delay cost")) return { label: t.label, value: `$${rng.int(150, 400)}/hr` };
    if (t.label.includes("order cost per hour")) return { label: t.label, value: `$${rng.int(300, 550)}/hr` };
    if (t.label.includes("request cost")) return { label: t.label, value: `$${rng.float(0.8, 2.5, 2)}` };
    if (t.label.includes("current triage") || t.label.includes("SRE triage hours"))
      return { label: t.label, value: `${rng.float(2.5, 6, 1)} hrs` };
    if (t.label.includes("praxis triage")) return { label: t.label, value: `${rng.int(8, 18)} min` };
    if (t.label.includes("blocked orders per incident")) return { label: t.label, value: String(rng.int(20, 55)) };
    if (t.label.includes("failed requests per incident")) return { label: t.label, value: `${rng.float(8, 18, 1)}K` };
    if (t.label.includes("escalation reduction") || t.label.includes("MTTR reduction"))
      return { label: t.label, value: `${rng.int(35, 65)}%` };
    return { label: t.label, value: String(monthlyIncidents) };
  });
}

function pickExpansion(rng: SeededRandom): ExpansionOpportunity[] {
  const shuffled = rng.shuffle(EXPANSION_LIBRARY);
  return shuffled.slice(0, 6).map((label) => ({
    label,
    score: rng.float(0.55, 0.88, 2).toFixed(2),
  }));
}

function pickDecisionWeights(rng: SeededRandom, priorityScore: number): DecisionWeight[] {
  const shuffled = rng.shuffle(DECISION_LABEL_LIBRARY);
  const base = Math.round(priorityScore * 100);
  return shuffled.slice(0, 5).map((label, i) => {
    const jitter = rng.int(-8, 8);
    const value = Math.min(95, Math.max(55, base + jitter - i * 4));
    const weight = 20 - i * 3 - rng.int(0, 2);
    return { label, value, weight };
  });
}

function pickMappingFactors(rng: SeededRandom): Array<{ label: string; value: number }> {
  const shuffled = rng.shuffle(MAPPING_FACTOR_LIBRARY);
  return shuffled.slice(0, 5).map((label) => ({
    label,
    value: rng.int(65, 92),
  }));
}

function generateEvents(rng: SeededRandom, pack: SolutionPack): WorkflowEvent[] {
  const baseHour = rng.int(6, 16);
  const baseMinute = rng.int(0, 30);
  const events: WorkflowEvent[] = [];
  const sources = pack.sources.filter((s) => s !== "praxis");

  for (let i = 0; i < pack.eventCount; i++) {
    const minutesOffset = i * rng.int(15, 45) + rng.int(0, 30);
    const hour = baseHour + Math.floor((baseMinute + minutesOffset) / 60);
    const minute = (baseMinute + minutesOffset) % 60;
    const source = sources[i % sources.length];
    const severityRoll = rng.next();
    let severity: "high" | "medium" | "low" = "medium";
    if (severityRoll < 0.35) severity = "high";
    else if (severityRoll > 0.75) severity = "low";

    events.push({
      timestamp: `${String(hour % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(rng.int(0, 59)).padStart(2, "0")}`,
      source,
      type: `${source.replace(/_/g, " ")} signal`,
      summary: `Event #${i + 1} from ${source.replace(/_/g, " ")}: ${pack.rootCause.replace(/_/g, " ")} detected.`,
      severity,
    });
  }
  return events;
}

function generateTimeline(rng: SeededRandom, pack: SolutionPack, runId: string): WorkflowStep[] {
  const baseHour = rng.int(6, 16);
  const baseMinute = rng.int(0, 30);
  const steps: WorkflowStep[] = [];

  for (let i = 0; i < STEP_LABELS.length; i++) {
    const minutesOffset = i * rng.int(1, 8);
    const hour = baseHour + Math.floor((baseMinute + minutesOffset) / 60);
    const minute = (baseMinute + minutesOffset) % 60;
    const isLast = i === STEP_LABELS.length - 1;
    const isActive = i === STEP_LABELS.length - 2;

    const details = [
      `${pack.id} loaded`,
      `${pack.buyer} + ${pack.technicalPersona} mapped`,
      `${pack.objectsCreated} objects, ${pack.linksCreated} links, ${Math.max(3, Math.round(pack.objectsCreated / 2))} actions`,
      `Floci resources verified locally`,
      `${pack.eventCount} events archived and queued`,
      `priority ${pack.priorityScore.toFixed(2)}, trust ${pack.evidenceTrust.toFixed(2)}`,
      `approval-safe ${pack.recommendedAction.replace(/_/g, " ")} staged`,
      `value case ready for export`,
    ];

    steps.push({
      label: STEP_LABELS[i],
      status: isActive ? "active" : isLast ? "pending" : "completed",
      timestamp: `${String(hour % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(rng.int(0, 59)).padStart(2, "0")}`,
      detail: details[i] || `${STEP_LABELS[i]} step complete`,
    });
  }
  return steps;
}

function generateOntology(rng: SeededRandom, pack: SolutionPack): OntologyObject[] {
  const types = ["Site", "Asset", "Incident", "Ticket", "Vendor", "Runbook", "Stakeholder", "BusinessProcess"];
  const keys = [
    `${pack.id.replace(/-/g, "-").substring(0, 10)}-site`,
    `${pack.buyer.split(" ")[0].toLowerCase()}-asset-01`,
    `${pack.id.replace(/-/g, "-").toUpperCase().substring(0, 10)}-${rng.int(100, 999)}`,
    `TKT-${rng.int(8000, 9999)}`,
    `${pack.recommendedAction.replace(/_/g, "-").substring(0, 14)}-vendor`,
    `${pack.id.replace(/-/g, "-")}-policy`,
    `${pack.buyer.toLowerCase().replace(/\s+/g, "-")}`,
    pack.rootCause.replace(/_/g, "-").substring(0, 18),
  ];

  return types.slice(0, pack.objectsCreated || 8).map((type, i) => ({
    type,
    key: keys[i] || `${type.toLowerCase()}-${rng.int(100, 999)}`,
    links: rng.int(2, 7),
  }));
}

function generateServices(pack: SolutionPack): Array<{ service: string; resource: string; status: string }> {
  return [
    { service: "SQS", resource: "praxis-incident-events", status: `${pack.eventCount} refs queued` },
    { service: "S3", resource: "praxis-raw-events", status: `${pack.eventCount} archived` },
    { service: "DynamoDB", resource: "PraxisIncidentState", status: `${Math.max(2, Math.round(pack.priorityScore * 5))} states written` },
    { service: "EventBridge", resource: "praxis-workflow-events", status: `${Math.max(6, Math.round(pack.priorityScore * 10))} transitions` },
  ];
}

const SITE_MAP: Record<string, string> = {
  "manufacturing-printer-gpo": "Georgia assembly plant",
  "erp-access-disruption": "Carolinas distribution center",
  "k8s-ingress-degradation": "SaaS production region us-east-1",
};

const PROCESS_MAP: Record<string, string> = {
  "manufacturing-printer-gpo": "Shipping documentation",
  "erp-access-disruption": "Order release and invoicing",
  "k8s-ingress-degradation": "Customer API traffic",
};

const SUMMARY_MAP: Record<string, string> = {
  "manufacturing-printer-gpo":
    "Repeated printer mapping failures block shipping paperwork after a GPO permission drift and direct-IP printer workaround split the fleet.",
  "erp-access-disruption":
    "ERP role provisioning falls out of sync after SSO group changes, blocking warehouse supervisors from release and invoice modules.",
  "k8s-ingress-degradation":
    "Ingress policy rollback conflicts with GitOps reconciliation, increasing p95 latency and failed checkout API calls.",
};

function generateWorkflowRun(pack: SolutionPack): PraxisWorkflowRun {
  const rng = new SeededRandom(`praxis_${pack.id}_v2`);
  const runId = `fieldlab_run_${pack.id.replace(/-/g, "_")}_${rng.int(100, 999).toString().padStart(3, "0")}`;
  const events = generateEvents(rng, pack);
  const timeline = generateTimeline(rng, pack, runId);
  const ontologyObjects = generateOntology(rng, pack);
  const mappingFactors = pickMappingFactors(rng);
  const decisionWeights = pickDecisionWeights(rng, pack.priorityScore);
  const template = ASSUMPTION_TEMPLATES_BY_PACK[pack.id] || ASSUMPTION_TEMPLATES_BY_PACK["manufacturing-printer-gpo"];
  const assumptions = fillAssumptionValues(template, rng, pack);
  const expansion = pickExpansion(rng);

  const hashInput = `${pack.id}:${pack.eventCount}:${pack.priorityScore}:${pack.evidenceTrust}:${pack.objectsCreated}:${pack.linksCreated}`;
  const hashPreview = proofHash(hashInput);

  return {
    runId,
    pack,
    site: SITE_MAP[pack.id] || "Unknown site",
    businessProcess: PROCESS_MAP[pack.id] || "Unknown process",
    workflowSummary: SUMMARY_MAP[pack.id] || pack.rootCause.replace(/_/g, " "),
    fieldlabEndpoint: "localhost:4566",
    services: generateServices(pack),
    events,
    timeline,
    ontologyObjects,
    mappingFactors,
    decisionWeights,
    assumptions,
    expansion,
    proofHashPreview: `${hashPreview.substring(0, 14)}...${hashPreview.substring(hashPreview.length - 4)}`,
  };
}

const workflowCache = new Map<string, PraxisWorkflowRun>();

export function getWorkflowRun(packId: string = "manufacturing-printer-gpo"): PraxisWorkflowRun {
  if (workflowCache.has(packId)) return workflowCache.get(packId)!;

  const resolvedPack = SOLUTION_PACKS.find((pack) => pack.id === packId) ?? SOLUTION_PACKS[0];
  const run = generateWorkflowRun(resolvedPack);
  workflowCache.set(packId, run);
  return run;
}

export function getWorkflowRuns(): PraxisWorkflowRun[] {
  return SOLUTION_PACKS.map((pack) => getWorkflowRun(pack.id));
}

/**
 * Return the full SHA256 proof hash for a pack, used when displaying proof objects.
 */
export function getFullProofHash(packId: string = "manufacturing-printer-gpo"): string {
  const run = getWorkflowRun(packId);
  const hashInput = `${run.pack.id}:${run.pack.eventCount}:${run.pack.priorityScore}:${run.pack.evidenceTrust}:${run.pack.objectsCreated}:${run.pack.linksCreated}`;
  return proofHash(hashInput);
}
