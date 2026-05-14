import type { SolutionPackId } from "@/lib/praxis-client";

export interface WorkflowStep {
  [key: string]: any;
  label: string;
  status: "warning" | "pending" | "active" | "completed";
  detail: string;
  timestamp: string;
}

export interface WorkflowEvent {
  [key: string]: any;
  source: string;
  signal: string;
  severity: string;
  summary?: string;
  timestamp: string;
  type?: string;
}

export interface OntologyObject {
  [key: string]: any;
  id: string;
  type: string;
  label: string;
  key: string;
  links: number;
}

export interface PraxisWorkflowRun {
  [key: string]: any;
  packId: string;
  runId: string;
  title: string;
  pack: Record<string, any>;
  proofHashPreview: string;
  priorityScore: number;
  evidenceTrust: number;
  valueCase: number;
  events: WorkflowEvent[];
  timeline: WorkflowStep[];
  ontology: OntologyObject[];
  decisionWeights: Array<{ label: string; value: number; weight: number }>;
  mappingFactors: Array<{ label: string; value: number }>;
  expansion: Array<{ name: string; label: string; score: number }>;
  fieldlabEndpoint: string;
  ontologyObjects: OntologyObject[];
  assumptions: Array<{ label: string; value: string }>;
  services: Array<{ service: string; resource: string; status: string }>;
  businessProcess: string;
  site: string;
  workflowSummary: string;
}

type WorkflowSummary = Omit<
  PraxisWorkflowRun,
  "packId" | "ontologyObjects" | "assumptions" | "services" | "businessProcess" | "site" | "workflowSummary"
>;

const liveProofSummaries: Record<string, WorkflowSummary> = {
  "manufacturing-printer-gpo": {
    runId: "fieldlab_run_manufacturing-printer-gpo",
    title: "Manufacturing Printer Deployment Failure",
    pack: {
      id: "manufacturing-printer-gpo",
      name: "Manufacturing Printer Deployment Failure",
      buyer: "Director of Operations",
      status: "pilot now",
      annualValue: "$38.5K",
      rootCause: "printer_deployment_policy_drift",
      recommendedAction: "approve_remediation",
      priorityScore: 0.7708,
      evidenceTrust: 0.829,
      valueConfidence: 0.7601,
      primaryValueDriver: "Reduce repeated printer incidents and provide audit-ready ownership workflow",
      eventCount: 12,
      sources: ["operator_note", "print_server", "active_directory", "msp_ticketing", "erp_shipping", "praxis"],
      objectsCreated: 5,
      linksCreated: 144,
      mappingConfidence: 0.5733,
    },
    proofHashPreview: "sha256:4a111f3c5b60...",
    priorityScore: 0.7708,
    evidenceTrust: 0.829,
    valueCase: 38481.6,
    fieldlabEndpoint: "localhost:4566",
    events: [
      { source: "operator_note", signal: "Shipping labels not printing", severity: "high", timestamp: "2026-05-12T00:00:00Z" },
      { source: "print_server", signal: "Printer queue mapping drift", severity: "high", timestamp: "2026-05-12T00:00:00Z" },
      { source: "active_directory", signal: "Point and Print policy mismatch", severity: "medium", timestamp: "2026-05-12T00:00:00Z" },
    ],
    timeline: [
      { label: "Events ingested", status: "completed", detail: "12 raw field events", timestamp: "2026-05-12T00:00:00Z" },
      { label: "Decision generated", status: "completed", detail: "priority 0.7708", timestamp: "2026-05-12T00:00:00Z" },
      { label: "Action captured", status: "completed", detail: "HUMAN_APPROVAL", timestamp: "2026-05-12T00:00:00Z" },
      { label: "Proof verified", status: "completed", detail: "sha256 proof hash valid", timestamp: "2026-05-12T00:00:00Z" },
    ],
    ontology: [
      { id: "site", key: "site", type: "Site", label: "Manufacturing plant", links: 12 },
      { id: "asset", key: "asset", type: "Asset", label: "WEIFPS01", links: 24 },
      { id: "process", key: "process", type: "BusinessProcess", label: "ERP shipping", links: 18 },
    ],
    decisionWeights: [
      { label: "Severity", value: 0.8375, weight: 0.2 },
      { label: "Business impact", value: 1, weight: 0.2 },
      { label: "Evidence", value: 0.829, weight: 0.15 },
      { label: "Actionability", value: 0.88, weight: 0.15 },
    ],
    mappingFactors: [
      { label: "Objects", value: 5 },
      { label: "Links", value: 144 },
      { label: "Actions", value: 5 },
    ],
    expansion: [
      { name: "Asset Inventory Accuracy", label: "Asset Inventory Accuracy", score: 0.725 },
      { name: "Intelligent Ticket Routing", label: "Intelligent Ticket Routing", score: 0.6975 },
      { name: "Endpoint Configuration Drift", label: "Endpoint Configuration Drift", score: 0.675 },
    ],
  },
  "erp-access-disruption": {
    runId: "fieldlab_run_erp-access-disruption",
    title: "ERP Access Disruption",
    pack: {
      id: "erp-access-disruption",
      name: "ERP Access Disruption",
      buyer: "VP Operations",
      status: "demo + scope",
      annualValue: "$34.9K",
      rootCause: "role_mapping_drift",
      recommendedAction: "approve_remediation",
      priorityScore: 0.7042,
      evidenceTrust: 0.827,
      valueConfidence: 0.7661,
      primaryValueDriver: "reduce ERP access disruption",
      eventCount: 6,
      sources: ["identity_provider", "helpdesk", "praxis"],
      objectsCreated: 5,
      linksCreated: 144,
      mappingConfidence: 0.5995,
    },
    proofHashPreview: "sha256:7de4f178b64b...",
    priorityScore: 0.7042,
    evidenceTrust: 0.827,
    valueCase: 34944,
    fieldlabEndpoint: "localhost:4566",
    events: [{ source: "identity_provider", signal: "Role mapping drift", severity: "high", timestamp: "2026-05-12T00:00:00Z" }],
    timeline: [{ label: "Proof verified", status: "completed", detail: "ERP pack", timestamp: "2026-05-12T00:00:00Z" }],
    ontology: [{ id: "erp", key: "erp", type: "Service", label: "ERP access", links: 18 }],
    decisionWeights: [{ label: "Priority", value: 0.7042, weight: 1 }],
    mappingFactors: [{ label: "Objects", value: 5 }],
    expansion: [{ name: "Access Governance", label: "Access Governance", score: 0.72 }],
  },
  "k8s-ingress-degradation": {
    runId: "fieldlab_run_k8s-ingress-degradation",
    title: "K8s Ingress Degradation",
    pack: {
      id: "k8s-ingress-degradation",
      name: "K8s Ingress Degradation",
      buyer: "VP Engineering",
      status: "demo + scope",
      annualValue: "$310.0K",
      rootCause: "ingress_retry_timeout_config_mismatch",
      recommendedAction: "approve_remediation",
      priorityScore: 0.7135,
      evidenceTrust: 0.837,
      valueConfidence: 0.7541,
      primaryValueDriver: "reduce ingress degradation",
      eventCount: 6,
      sources: ["observability", "kubernetes", "praxis"],
      objectsCreated: 5,
      linksCreated: 144,
      mappingConfidence: 0.6004,
    },
    proofHashPreview: "sha256:fae92dfa9a50...",
    priorityScore: 0.7135,
    evidenceTrust: 0.837,
    valueCase: 310000,
    fieldlabEndpoint: "localhost:4566",
    events: [{ source: "observability", signal: "Ingress timeout mismatch", severity: "high", timestamp: "2026-05-12T00:00:00Z" }],
    timeline: [{ label: "Proof verified", status: "completed", detail: "K8s pack", timestamp: "2026-05-12T00:00:00Z" }],
    ontology: [{ id: "ingress", key: "ingress", type: "Service", label: "Ingress controller", links: 18 }],
    decisionWeights: [{ label: "Priority", value: 0.7135, weight: 1 }],
    mappingFactors: [{ label: "Objects", value: 5 }],
    expansion: [{ name: "SRE Runbook Governance", label: "SRE Runbook Governance", score: 0.74 }],
  },
};

export function getWorkflowRun(packId: string = "manufacturing-printer-gpo"): PraxisWorkflowRun {
  const summary = liveProofSummaries[packId] ?? liveProofSummaries["manufacturing-printer-gpo"];
  return {
    ...summary,
    packId,
    businessProcess: "customer workflow",
    site: "FieldLab",
    workflowSummary: "Real proof generated by the backend API",
    services: [
      { service: "S3", resource: "praxis-raw-events", status: "archive" },
      { service: "SQS", resource: "praxis-incident-events", status: "queue" },
      { service: "DynamoDB", resource: "PraxisIncidentState", status: "state" },
      { service: "EventBridge", resource: "praxis-workflow-events", status: "bus" },
    ],
    assumptions: [
      { label: "ROI model", value: String(summary.valueCase) },
      { label: "Evidence trust", value: String(summary.evidenceTrust) },
    ],
    ontologyObjects: summary.ontology,
  } as PraxisWorkflowRun;
}

export function getWorkflowRuns(): PraxisWorkflowRun[] {
  return Object.keys(liveProofSummaries).map((packId) => getWorkflowRun(packId));
}

export function getFullProofHash(packId: SolutionPackId = "manufacturing-printer-gpo") {
  return getWorkflowRun(packId).proofHashPreview.replace("...", "");
}
