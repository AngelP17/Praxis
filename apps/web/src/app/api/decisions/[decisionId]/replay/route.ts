import { NextResponse } from "next/server";

import { buildBackendUrl } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM, getDemoReplay } from "@/lib/demo-scenario";
import { deterministicHash } from "@/lib/deterministic-hash";

async function demoReplay(decisionId: string) {
  const base = getDemoReplay("INC-4821");
  const event = DEMO_EVENT_STREAM[0];
  const replayHash = await deterministicHash({
    scenario_id: decisionId,
    source: event.source,
    event_type: event.event_type,
    asset_id: "printer.weifps01",
    site: event.site ?? "",
    line: "",
    payload: {
      severity: "high",
      raw: { decision_id: decisionId },
    },
  });
  return {
    decision: {
      id: Number(decisionId),
      event_id: event.event_id,
      priority_score: 0.78,
      confidence_score: 0.88,
      root_cause_hypothesis: "printer_fleet_dependency_disruption",
      risk_level: "high",
      replay_hash: replayHash,
      recommendations: [],
    },
    original_event: {
      ...event,
      asset_id: "printer.weifps01",
      site: event.site,
    },
    replayed_decision: {
      priority_score: 0.78,
      confidence_score: 0.88,
      root_cause_hypothesis: "printer_fleet_dependency_disruption",
      rationale: {
        impacted_assets: [
          { asset_name: "Zebra Labeling", criticality: "critical", depth: 1, relationship: "supports" },
          { asset_name: "Texas Production Line", criticality: "critical", depth: 2, relationship: "supports" },
          { asset_name: "Shipping Label Workflow", criticality: "high", depth: 2, relationship: "supports" },
        ],
      },
    },
    stored_replay_hash: replayHash,
    replayed_hash: replayHash,
    determinism: true,
    feedback: base.operator_feedback,
    replayed_at: new Date("2026-04-27T16:42:00.000Z").toISOString(),
  };
}

type BackendDecisionReplay = {
  decision_id?: number | string;
  original_decision?: {
    decision_id?: number | string;
    event_id?: string;
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    risk_level?: string;
    replay_hash?: string;
  };
  replayed_decision?: {
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    rationale?: {
      impacted_assets?: Array<{
        asset_name?: string;
        criticality?: string;
        depth?: number;
        relationship?: string;
      }>;
    };
  };
  stored_replay_hash?: string;
  replayed_hash?: string;
  determinism?: boolean;
  feedback?: Array<{
    feedback_type?: string;
    feedback_note?: string;
    note?: string;
    feedback_ts?: string;
    created_at?: string;
    operator_id?: string;
    actor?: string;
  }>;
  replayed_at?: string;
};

type BackendIncidentReplay = {
  incident_id?: string;
  incident?: {
    incident_id?: string;
    root_cause_hypothesis?: string;
    confidence_score?: number;
    status?: string;
  };
  events?: Array<{
    event_id?: string;
    event_type?: string;
    asset_id?: string;
    site?: string;
    severity?: string;
  }>;
  decisions?: Array<{
    id?: number;
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    risk_level?: string;
    replay_hash?: string;
  }>;
  timeline?: Array<{
    timestamp?: string;
    event_type?: string;
    actor?: string;
    note?: string;
  }>;
};

function mapDecisionReplay(decisionId: string, payload: BackendDecisionReplay) {
  const original = payload.original_decision ?? {};
  return {
    decision: {
      id: Number(original.decision_id ?? decisionId) || 4821,
      event_id: original.event_id,
      priority_score: original.priority_score,
      confidence_score: original.confidence_score,
      root_cause_hypothesis: original.root_cause_hypothesis,
      risk_level: original.risk_level,
      replay_hash: original.replay_hash ?? payload.stored_replay_hash,
    },
    replayed_decision: payload.replayed_decision ?? {},
    stored_replay_hash: payload.stored_replay_hash,
    replayed_hash: payload.replayed_hash,
    determinism: payload.determinism,
    feedback: payload.feedback ?? [],
    replayed_at: payload.replayed_at,
  };
}

function mapIncidentReplay(decisionId: string, payload: BackendIncidentReplay) {
  const decision = payload.decisions?.[0] ?? {};
  const event = payload.events?.[0] ?? {};
  return {
    decision: {
      id: Number(decision.id ?? decisionId) || 4821,
      event_id: event.event_id,
      priority_score: decision.priority_score,
      confidence_score: decision.confidence_score ?? payload.incident?.confidence_score,
      root_cause_hypothesis:
        decision.root_cause_hypothesis ?? payload.incident?.root_cause_hypothesis,
      risk_level: decision.risk_level ?? "high",
      replay_hash: decision.replay_hash,
    },
    original_event: {
      event_id: event.event_id,
      event_type: event.event_type,
      asset_id: event.asset_id,
      site: event.site,
      severity: event.severity,
    },
    replayed_decision: {
      priority_score: decision.priority_score,
      confidence_score: decision.confidence_score ?? payload.incident?.confidence_score,
      root_cause_hypothesis:
        decision.root_cause_hypothesis ?? payload.incident?.root_cause_hypothesis,
    },
    stored_replay_hash: decision.replay_hash,
    replayed_hash: decision.replay_hash,
    determinism: Boolean(decision.replay_hash),
    feedback: [],
    replayed_at: payload.timeline?.[0]?.timestamp,
  };
}

async function fetchBackendReplay(decisionId: string) {
  const numericId = Number(decisionId);
  const isNumeric = Number.isInteger(numericId) && `${numericId}` === decisionId;

  if (isNumeric) {
    const response = await fetch(buildBackendUrl(`/api/decisions/${decisionId}/replay`), {
      method: "POST",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as BackendDecisionReplay;
    return mapDecisionReplay(decisionId, payload);
  }

  if (/^INC-/i.test(decisionId)) {
    const response = await fetch(buildBackendUrl(`/api/replay/incidents/${decisionId}`), {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as BackendIncidentReplay;
    return mapIncidentReplay(decisionId, payload);
  }

  const response = await fetch(buildBackendUrl(`/api/replay/tickets/${decisionId}`), {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as BackendIncidentReplay;
  return mapIncidentReplay(decisionId, payload);
}

export async function POST(_: Request, { params }: { params: Promise<{ decisionId: string }> }) {
  const { decisionId } = await params;
  try {
    const livePayload = await fetchBackendReplay(decisionId);
    if (livePayload) {
      return NextResponse.json(livePayload);
    }
  } catch {
    // Fall through to demo response below.
  }

  return NextResponse.json(await demoReplay(decisionId));
}
