import {
  DEMO_HEALTH,
  DEMO_PACKS,
  getDemoPipelineCompletion,
  getDemoProof,
} from "@/lib/praxis-demo-data";

export const IS_VERCEL_RUNTIME = process.env.VERCEL === "1";

function resolvedApiBaseUrl() {
  const rawApiBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
  return rawApiBase.replace(/\/api\/?$/, "");
}

export function buildBackendUrl(pathname: string) {
  return `${resolvedApiBaseUrl()}${pathname}`;
}

export async function proxyBackend(
  pathname: string,
  init?: RequestInit,
  demoFallback?: () => Response,
) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  try {
    const response = await fetch(buildBackendUrl(pathname), {
      ...init,
      cache: "no-store",
      headers: {
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok && (isDemoMode || !process.env.API_INTERNAL_URL) && demoFallback) {
      return demoFallback();
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    if ((isDemoMode || !process.env.API_INTERNAL_URL) && demoFallback) {
      return demoFallback();
    }
    return new Response(JSON.stringify({ error: "Backend unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

export function getDemoRoutePayload(packId: string) {
  const proof = getDemoProof(packId);
  return {
    proof,
    completion: getDemoPipelineCompletion(packId, proof.run_id),
    health: DEMO_HEALTH,
    packs: DEMO_PACKS,
  };
}
