import { getDemoReplay } from "@/lib/demo-scenario";
import { getServerApiUrl } from "@/lib/server-api";
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

function buildDemoReplay(id: string): ReplayPayload {
  const base = getDemoReplay(id);
  return {
    decision: {
      id: Number(id) || 4821,
      priority_score: base.latest_decision?.priority_score,
      confidence_score: 0.88,
      root_cause_hypothesis: base.latest_decision?.root_cause_hypothesis,
      risk_level: "high",
      replay_hash: `sha256:${id}.demo`,
    },
    original_event: {
      event_id: `evt-${id.toLowerCase()}`,
      event_type: "com.praxis.asset.printer.offline",
      asset_id: "printer.weifps01",
      site: "TX",
      severity: "high",
    },
    replayed_decision: {
      priority_score: base.latest_decision?.priority_score,
      confidence_score: 0.88,
      root_cause_hypothesis: base.latest_decision?.root_cause_hypothesis,
      rationale: {
        impacted_assets: [
          { asset_name: "Zebra Labeling", criticality: "critical", depth: 1, relationship: "supports" },
          { asset_name: "Texas Production Line", criticality: "critical", depth: 2, relationship: "supports" },
          { asset_name: "Shipping Label Workflow", criticality: "high", depth: 2, relationship: "supports" },
        ],
      },
    },
    stored_replay_hash: `sha256:${id}.demo`,
    replayed_hash: `sha256:${id}.demo`,
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
        payload: buildDemoReplay(id),
      };
    }
    return { mode: "live", payload: (await response.json()) as ReplayPayload };
  } catch (error) {
    return {
      mode: "demo",
      payload: buildDemoReplay(id),
      notice: undefined,
    };
  }
}

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadReplay(id);
  return <PraxisReplayWorkbench id={id} payload={data.payload} mode={data.mode} notice={data.notice} />;
}
