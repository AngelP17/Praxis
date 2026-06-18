import generatedScenarioRows from "@/lib/generated/scenarios.generated.json";

export type Scenario = {
  id: string;
  label: string;
  site: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  icon: string;
  ticketId: string;
  incidentId: string;
  title: string;
  rootCause: string;
  priorityScore: number;
  confidenceScore: number;
  // Event ingestion fields
  source: string;
  eventType: string;
  assetId: string;
  line: string;
  payload: Record<string, unknown>;
  // Decision fields
  recommendation: string;
  rationale: string;
  runbookId: string;
  // ROI
  estimatedValueUsd: number;
  mttrReductionPct: number;
  recurrenceReductionPct: number;
  // Blast radius
  impactedSystems: string[];
  // Ontology context
  assetType: string;
  ownerTeam: string;
};

export const SCENARIO_TO_PACK_ID = {
  "printer-offline": "manufacturing-printer-gpo",
  "network-edge-failover": "network-edge-failover",
  "identity-onboarding-drift": "identity-onboarding-drift",
  "database-failover-lag": "database-failover-lag",
} as const;

export type ScenarioId = keyof typeof SCENARIO_TO_PACK_ID;

export function getPackIdForScenario(scenarioId: string): string {
  return SCENARIO_TO_PACK_ID[scenarioId as ScenarioId] ?? "manufacturing-printer-gpo";
}

export type ScenarioResponse = {
  id: string;
  label: string;
  site: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  icon: string;
  ticket_id: string;
  incident_id: string;
  title: string;
  root_cause: string;
  priority_score: number;
  confidence_score: number;
  source: string;
  event_type: string;
  asset_id: string;
  line: string;
  payload: Record<string, unknown>;
  recommendation: string;
  rationale: string;
  runbook_id: string;
  estimated_value_usd: number;
  mttr_reduction_pct: number;
  recurrence_reduction_pct: number;
  impacted_systems: string[];
  asset_type: string;
  owner_team: string;
};

export function adaptScenario(row: ScenarioResponse): Scenario {
  return {
    id: row.id,
    label: row.label,
    site: row.site,
    category: row.category,
    severity: row.severity,
    icon: row.icon,
    ticketId: row.ticket_id,
    incidentId: row.incident_id,
    title: row.title,
    rootCause: row.root_cause,
    priorityScore: row.priority_score,
    confidenceScore: row.confidence_score,
    source: row.source,
    eventType: row.event_type,
    assetId: row.asset_id,
    line: row.line,
    payload: row.payload,
    recommendation: row.recommendation,
    rationale: row.rationale,
    runbookId: row.runbook_id,
    estimatedValueUsd: row.estimated_value_usd,
    mttrReductionPct: row.mttr_reduction_pct,
    recurrenceReductionPct: row.recurrence_reduction_pct,
    impactedSystems: row.impacted_systems,
    assetType: row.asset_type,
    ownerTeam: row.owner_team,
  };
}

export function adaptScenarios(rows: ScenarioResponse[]): Scenario[] {
  return rows.map(adaptScenario);
}

export function toScenarioResponse(scenario: Scenario): ScenarioResponse {
  return {
    id: scenario.id,
    label: scenario.label,
    site: scenario.site,
    category: scenario.category,
    severity: scenario.severity,
    icon: scenario.icon,
    ticket_id: scenario.ticketId,
    incident_id: scenario.incidentId,
    title: scenario.title,
    root_cause: scenario.rootCause,
    priority_score: scenario.priorityScore,
    confidence_score: scenario.confidenceScore,
    source: scenario.source,
    event_type: scenario.eventType,
    asset_id: scenario.assetId,
    line: scenario.line,
    payload: scenario.payload,
    recommendation: scenario.recommendation,
    rationale: scenario.rationale,
    runbook_id: scenario.runbookId,
    estimated_value_usd: scenario.estimatedValueUsd,
    mttr_reduction_pct: scenario.mttrReductionPct,
    recurrence_reduction_pct: scenario.recurrenceReductionPct,
    impacted_systems: scenario.impactedSystems,
    asset_type: scenario.assetType,
    owner_team: scenario.ownerTeam,
  };
}

export const SCENARIOS: Scenario[] = adaptScenarios(
  generatedScenarioRows as ScenarioResponse[],
);

export function getScenarioById(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

export function getScenarioByTicketId(ticketId: string): Scenario {
  return SCENARIOS.find((s) => s.ticketId === ticketId) ?? SCENARIOS[0];
}

export function getScenarioForPack(packId: string): Scenario {
  return SCENARIOS.find((scenario) => getPackIdForScenario(scenario.id) === packId) ?? SCENARIOS[0];
}

export function getScenarioByIncidentId(incidentId: string): Scenario {
  return SCENARIOS.find((s) => s.incidentId === incidentId) ?? SCENARIOS[0];
}

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-rose-200 border-rose-500/40 bg-rose-500/10",
  high: "text-amber-200 border-amber-500/40 bg-amber-500/10",
  medium: "text-yellow-200 border-yellow-500/40 bg-yellow-500/10",
  low: "text-emerald-200 border-emerald-500/40 bg-emerald-500/10",
};

export const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
};
