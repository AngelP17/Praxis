import { getDemoReplay } from "@/lib/demo-scenario";
import { getServerApiUrl } from "@/lib/server-api";
import { ReplayForensicsView } from "@/components/sentinel-v2/replay/replay-forensics-view";

type ReplayPayload = {
  ticket_id: string;
  latest_decision?: {
    priority_score?: number;
    root_cause_hypothesis?: string;
  };
  decision_history: Array<{
    id: number;
    decision_ts: string;
    priority_score: number;
    root_cause_hypothesis: string;
    confidence_score: number;
  }>;
  events: Array<{ event_type: string; event_ts: string; actor_type: string }>;
  operator_feedback: Array<{
    feedback_type: string;
    feedback_note?: string;
    feedback_ts: string;
    operator_id?: string;
  }>;
  similar_cases: Array<{ ticket_id: string; title: string; status: string }>;
};

async function loadReplay(id: string): Promise<{ mode: "live" | "demo"; payload: ReplayPayload; notice?: string }> {
  try {
    const response = await fetch(await getServerApiUrl(`/api/replay/${id}`), { cache: "no-store" });
    if (!response.ok) {
      const fallback = getDemoReplay(id);
      return {
        mode: "demo",
        payload: fallback,
        notice:
          response.status === 404
            ? `Demo scenario active. Replay ${id} is not present in live storage.`
            : `Demo scenario active. Live replay API returned ${response.status}.`,
      };
    }
    return { mode: "live", payload: (await response.json()) as ReplayPayload };
  } catch (error) {
    return {
      mode: "demo",
      payload: getDemoReplay(id),
      notice: `Demo scenario active. Live replay API unavailable: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadReplay(id);
  return <ReplayForensicsView id={id} payload={data.payload} mode={data.mode} notice={data.notice} />;
}
