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
  "network-edge-failover": {
    runId: "fieldlab_run_network-edge-failover",
    title: "Network Edge Failover",
    pack: {
      id: "network-edge-failover",
      name: "Network Edge Failover",
      buyer: "Director of Supply Chain",
      status: "pilot now",
      annualValue: "$47.1K",
      rootCause: "failover_route_degraded",
      recommendedAction: "approve_remediation",
      priorityScore: 0.88,
      evidenceTrust: 0.88,
      valueConfidence: 0.88,
      primaryValueDriver: "Reduce network downtime for outbound shipping",
      eventCount: 8,
      sources: ["network_monitor", "msp_ticketing", "praxis", "operator_note"],
      objectsCreated: 9,
      linksCreated: 49,
      mappingConfidence: 0.84,
    },
    proofHashPreview: "sha256:d5c36453cdf4...",
    priorityScore: 0.88,
    evidenceTrust: 0.88,
    valueCase: 47100,
    fieldlabEndpoint: "localhost:4566",
    events: [{ source: "network_monitor", signal: "Primary ISP outage", severity: "high", timestamp: "2026-05-12T00:00:00Z" }],
    timeline: [{ label: "Proof verified", status: "completed", detail: "Network edge pack", timestamp: "2026-05-12T00:00:00Z" }],
    ontology: [{ id: "network", key: "network", type: "Service", label: "Edge network Router", links: 24 }],
    decisionWeights: [{ label: "Priority", value: 0.88, weight: 1 }],
    mappingFactors: [{ label: "Objects", value: 9 }],
    expansion: [{ name: "Redundancy Verification", label: "Redundancy Verification", score: 0.82 }],
  },
  "identity-onboarding-drift": {
    runId: "fieldlab_run_identity-onboarding-drift",
    title: "Identity Onboarding Drift",
    pack: {
      id: "identity-onboarding-drift",
      name: "Identity Onboarding Drift",
      buyer: "VP of Human Resources",
      status: "pilot now",
      annualValue: "$64.8K",
      rootCause: "ad_onboarding_drift",
      recommendedAction: "approve_remediation",
      priorityScore: 0.85,
      evidenceTrust: 0.87,
      valueConfidence: 0.85,
      primaryValueDriver: "Reduce access onboarding downtime",
      eventCount: 8,
      sources: ["active_directory", "identity_provider", "msp_ticketing", "praxis"],
      objectsCreated: 8,
      linksCreated: 35,
      mappingConfidence: 0.88,
    },
    proofHashPreview: "sha256:d5c36453cdf5...",
    priorityScore: 0.85,
    evidenceTrust: 0.87,
    valueCase: 64800,
    fieldlabEndpoint: "localhost:4566",
    events: [{ source: "active_directory", signal: "Identity onboarding GPO drift", severity: "high", timestamp: "2026-05-12T00:00:00Z" }],
    timeline: [{ label: "Proof verified", status: "completed", detail: "Identity onboarding pack", timestamp: "2026-05-12T00:00:00Z" }],
    ontology: [{ id: "identity", key: "identity", type: "Service", label: "Identity Sync Router", links: 18 }],
    decisionWeights: [{ label: "Priority", value: 0.85, weight: 1 }],
    mappingFactors: [{ label: "Objects", value: 8 }],
    expansion: [{ name: "Access Provisioning SLA", label: "Access Provisioning SLA", score: 0.80 }],
  },
  "database-failover-lag": {
    runId: "fieldlab_run_database-failover-lag",
    title: "Database Replication Lag",
    pack: {
      id: "database-failover-lag",
      name: "Database Replication Lag",
      buyer: "Director of Infrastructure",
      status: "pilot now",
      annualValue: "$110.0K",
      rootCause: "postgresql_replication_lag",
      recommendedAction: "tune_connection_pools",
      priorityScore: 0.92,
      evidenceTrust: 0.92,
      valueConfidence: 0.92,
      primaryValueDriver: "Prevent order timeouts and database lockouts",
      eventCount: 12,
      sources: ["postgres-replica", "pgpool_load_balancer", "monitoring_alerts", "checkout_microservice", "helpdesk"],
      objectsCreated: 10,
      linksCreated: 40,
      mappingConfidence: 0.85,
    },
    proofHashPreview: "sha256:4f9ec24f5a66...",
    priorityScore: 0.92,
    evidenceTrust: 0.92,
    valueCase: 110000,
    fieldlabEndpoint: "localhost:4566",
    events: [{ source: "postgres-replica", signal: "High database replication lag", severity: "high", timestamp: "2026-05-12T00:00:00Z" }],
    timeline: [{ label: "Proof verified", status: "completed", detail: "Database lag pack", timestamp: "2026-05-12T00:00:00Z" }],
    ontology: [{ id: "database", key: "database", type: "Service", label: "PostgreSQL Database", links: 36 }],
    decisionWeights: [{ label: "Priority", value: 0.92, weight: 1 }],
    mappingFactors: [{ label: "Objects", value: 10 }],
    expansion: [{ name: "Replica Health Checks", label: "Replica Health Checks", score: 0.88 }],
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
