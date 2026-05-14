import { DEMO_PIPELINE_STAGES } from "@/lib/praxis-demo-data";
import {
  getDemoRoutePayload,
  IS_VERCEL_RUNTIME,
  proxyBackend,
  sseHeaders,
} from "@/app/api/_lib/praxis-server";

function buildDemoStream(proof: { run_id: string; proof_hash: string }, completion: unknown) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const runId = proof.run_id;

      for (const [index, stage] of DEMO_PIPELINE_STAGES.entries()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const payload = {
          stage: stage.stage,
          label: stage.label,
          index,
          total: DEMO_PIPELINE_STAGES.length,
          progress: (index + 1) / DEMO_PIPELINE_STAGES.length,
          run_id: runId,
          stage_hash: `${proof.proof_hash.slice(0, 15)}${index}`,
          timestamp: Date.now(),
        };
        controller.enqueue(encoder.encode(`event: stage\ndata: ${JSON.stringify(payload)}\n\n`));
      }

      controller.enqueue(encoder.encode(`event: completed\ndata: ${JSON.stringify(completion)}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ packId: string }> },
) {
  const { packId } = await params;
  const { proof, completion } = getDemoRoutePayload(packId);

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(
      `/api/proofs/${packId}/stream`,
      undefined,
      () => buildDemoStream(proof, completion),
    );
  }

  return buildDemoStream(proof, completion);
}
