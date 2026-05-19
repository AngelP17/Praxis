import { DEMO_TICKETS, getDemoReplay } from "@/lib/demo-scenario";
import { getServerApiUrl } from "@/lib/server-api";
import { deterministicHash } from "@/lib/deterministic-hash";
import { getScenarioByTicketId } from "@/lib/scenarios";
import { PraxisReplayWorkbench } from "@/components/praxis/workbench/replay-workbench";

type ReplayPayload = {
  decision: {
    id: number;
    event_id?: string;
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    risk_level?: string;
    replay_hash?: string;
  };
  original_event?: {
    event_id?: string;
    event_type?: string;
    asset_id?: string;
    site?: string;
    severity?: string;
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
  feedback: Array<{
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

async function buildDemoReplay(id: string): Promise<ReplayPayload> {
  const ticket = DEMO_TICKETS.find((t) => t.ticket_id === id) ?? DEMO_TICKETS[0];
  const base = getDemoReplay(ticket.ticket_id);
  const scenario = getScenarioByTicketId(ticket.ticket_id);
  const replayHash = await deterministicHash({
    scenario_id: id,
    source: scenario.source,
    event_type: scenario.eventType,
    asset_id: scenario.assetId,
    site: ticket.site || "",
    line: "",
    payload: {
      severity: ticket.priority_raw === "Critical" ? "critical" : "high",
      raw: { replay_id: id },
    },
  });
  const impactedAssets = scenario.impactedSystems.slice(0, 3).map((name, idx) => ({
    asset_name: name,
    criticality: idx === 0 ? "critical" : "high",
    depth: idx === 0 ? 1 : 2,
    relationship: "supports",
  }));
  return {
    decision: {
      id: Number(id) || Number(ticket.ticket_id.replace(/\D/g, "")) || 0,
      priority_score: base.latest_decision?.priority_score,
      confidence_score: ticket.confidence_score ?? 0.88,
      root_cause_hypothesis: base.latest_decision?.root_cause_hypothesis,
      risk_level: ticket.priority_raw === "Critical" ? "critical" : "high",
      replay_hash: replayHash,
    },
    original_event: {
      event_id: `evt-${id.toLowerCase()}`,
      event_type: scenario.eventType,
      asset_id: scenario.assetId,
      site: ticket.site || "",
      severity: ticket.priority_raw === "Critical" ? "critical" : "high",
    },
    replayed_decision: {
      priority_score: base.latest_decision?.priority_score,
      confidence_score: ticket.confidence_score ?? 0.88,
      root_cause_hypothesis: base.latest_decision?.root_cause_hypothesis,
      rationale: {
        impacted_assets: impactedAssets,
      },
    },
    stored_replay_hash: replayHash,
    replayed_hash: replayHash,
    determinism: true,
    feedback: base.operator_feedback,
    replayed_at: new Date("2026-04-27T16:42:00.000Z").toISOString(),
  };
}

async function loadReplay(
  id: string
): Promise<{ mode: "live" | "demo"; payload: ReplayPayload; notice?: string }> {
  try {
    const response = await fetch(await getServerApiUrl(`/api/decisions/${id}/replay`), {
      method: "POST",
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        mode: "demo",
        payload: await buildDemoReplay(id),
      };
    }
    return { mode: "live", payload: (await response.json()) as ReplayPayload };
  } catch (error) {
    return {
      mode: "demo",
      payload: await buildDemoReplay(id),
      notice: undefined,
    };
  }
}

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadReplay(id);
  return <PraxisReplayWorkbench id={id} payload={data.payload} mode={data.mode} notice={data.notice} />;
}
