"use client";

import { api } from "@/lib/api";

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

export type SolutionPackId = string;

export interface SolutionPack {
  id: string;
  name: string;
  industry: string;
  buyer: string;
  buyer_persona?: string;
  technical_persona?: string;
  technicalPersona: string;
  economic_buyer?: string;
  primary_pain: string;
  systems?: string[];
  signals?: string[];
  business_metrics?: string[];
  target_outcome?: string;
  demo_length_minutes: number;
  scenario?: Record<string, unknown>;
  roi_model?: Record<string, unknown>;
  event_count: number;
  eventCount: number;
  sources: string[];
  score: string;
  annualValue: string;
  status: string;
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

export interface PraxisProof {
  proof_id: string;
  run_id: string;
  solution_pack: string;
  customer_context_hash: string;
  evidence: Record<string, unknown> & {
    raw_events: number;
    sources: string[];
    evidence_trust: number;
  };
  ontology: Record<string, unknown> & {
    objects_created: number;
    links_created: number;
    actions_available: number;
    mapping_confidence: number;
  };
  decision: Record<string, unknown> & {
    root_cause_hypothesis: string;
    priority_score: number;
    confidence: number;
    requires_human_review: boolean;
    next_best_questions: Array<string | Record<string, unknown>>;
  };
  action: Record<string, unknown> & {
    recommended_action: string;
    mode: string;
    actor: string;
    status: string;
    action_log_hash: string;
  };
  value_case: Record<string, unknown> & {
    estimated_annual_value: number;
    confidence: number;
    primary_value_driver: string;
  };
  expansion: Array<Record<string, unknown> & { name: string; expansion_score: number }>;
  replay: Record<string, unknown> & {
    replay_hash: string;
    deterministic: boolean;
    verified_at: string;
  };
  proof_hash: string;
  generated_at: string;
}

export interface FieldLabRun {
  run_id: string;
  solution_pack_id: string;
  customer_profile: Record<string, unknown>;
  status: string;
  floci_endpoint: string;
  started_at?: string | null;
  completed_at?: string | null;
  summary_json?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface FieldLabExecuteResponse {
  run_id: string;
  status: string;
  proof: PraxisProof;
  decisions_generated: number;
  priority_score: number;
  evidence_trust: number;
  root_cause_hypothesis: string;
  ontology_objects: number;
  actions_captured: number;
  action_mode: string;
  estimated_annual_value: number;
}

export interface FieldLabTimeline {
  run_id: string;
  solution_pack_id: string;
  status: string;
  metadata: Record<string, unknown>;
  events: Array<{
    event_type: string;
    status: string;
    actor: string;
    proof_impact: string | number;
  }>;
}

export interface ProofVerificationResponse {
  valid: boolean;
  status: string;
  errors: string[];
  proof_hash: string;
}

export interface ActionCaptureResponse {
  run_id: string;
  status: string;
  action: PraxisProof["action"];
  proof_hash: string;
}

export const praxisClient = {
  listSolutionPacks: async () => {
    if (IS_DEMO) return [] as SolutionPack[];
    return (await api.get<SolutionPack[]>("/solution-packs")).data;
  },
  getSolutionPack: async (packId: string) => {
    if (IS_DEMO) return null as unknown as SolutionPack;
    return (await api.get<SolutionPack>(`/solution-packs/${packId}`)).data;
  },
  createRun: async (packId: string) => {
    if (IS_DEMO) return { run_id: `demo_${packId}`, solution_pack_id: packId, customer_profile: {}, status: "created", floci_endpoint: "demo" } as FieldLabRun;
    return (await api.post<FieldLabRun>("/fieldlab/runs", { solution_pack_id: packId })).data;
  },
  executeRun: async (runId: string) => {
    if (IS_DEMO) return { run_id: runId, status: "executed", proof: {} as PraxisProof, decisions_generated: 1, priority_score: 0, evidence_trust: 0, root_cause_hypothesis: "", ontology_objects: 0, actions_captured: 0, action_mode: "demo", estimated_annual_value: 0 } as FieldLabExecuteResponse;
    return (await api.post<FieldLabExecuteResponse>(`/fieldlab/runs/${runId}/execute`)).data;
  },
  getRunTimeline: async (runId: string) => {
    if (IS_DEMO) return { run_id: runId, events: [], status: "demo", solution_pack_id: "", metadata: {} } as unknown as FieldLabTimeline;
    return (await api.get<FieldLabTimeline>(`/fieldlab/runs/${runId}/events`)).data;
  },
  captureAction: async (
    runId: string,
    action: { action: string; status: string; actor?: string; note?: string },
  ) => {
    if (IS_DEMO) return { run_id: runId, status: "captured", action: action.action, proof_hash: "" } as unknown as ActionCaptureResponse;
    return (await api.post<ActionCaptureResponse>(`/fieldlab/runs/${runId}/action`, action)).data;
  },
  getProofByPack: async (packId: string) => {
    if (IS_DEMO) return {} as PraxisProof;
    return (await api.get<PraxisProof>(`/proofs/${packId}`)).data;
  },
  verifyProof: async (proof: PraxisProof) => {
    if (IS_DEMO) return { valid: true, proof_hash: proof.proof_hash || "", status: "verified", errors: [] } as ProofVerificationResponse;
    return (await api.post<ProofVerificationResponse>("/proofs/verify", proof)).data;
  },
};

export function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function questionText(question: string | Record<string, unknown>): string {
  if (typeof question === "string") return question;
  return String(question.question ?? question.field ?? "Missing field");
}
