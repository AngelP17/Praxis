/**
 * Deterministic replay hash -- TypeScript mirror of `domain.hashing.canonical_hash`.
 *
 * The Python version (source of truth) is at packages/domain/domain/hashing.py.
 * This implementation produces the same output for the same sorted-JSON input
 * bundle: sorted keys, compact separators, SHA-256 truncated to 32 hex chars.
 *
 * Used only in demo-mode fallbacks where the backend is unreachable.
 */

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

function canonicalJson(obj: unknown): string {
  return JSON.stringify(sortKeysDeep(obj));
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 32);
}

export interface HashInputBundle {
  scenario_id: string;
  source: string;
  event_type: string;
  asset_id: string;
  site: string;
  line: string;
  payload: Record<string, unknown>;
}

export async function deterministicHash(input: HashInputBundle): Promise<string> {
  const canonical = canonicalJson(input);
  const digest = await sha256Hex(canonical);
  return `sha256:${digest}`;
}
