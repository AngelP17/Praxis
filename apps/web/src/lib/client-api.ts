"use client";

function resolveApiPath(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || base === "/api") return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const cleanBase = base.replace(/\/$/, "");
  if (cleanBase.endsWith("/api") && normalized.startsWith("/api/")) {
    return `${cleanBase}${normalized.slice(4)}`;
  }
  return `${cleanBase}${normalized}`;
}

export async function fetchJsonWithTimeout<T>(path: string, timeoutMs = 7000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resolveApiPath(path), {
      signal: controller.signal,
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`${path}: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timed out loading ${path}`);
    }
    throw error instanceof Error ? error : new Error(`Could not load ${path}`);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function postJsonWithTimeout<T>(
  path: string,
  payload: Record<string, unknown> | undefined,
  timeoutMs = 7000
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resolveApiPath(path), {
      method: "POST",
      signal: controller.signal,
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!response.ok) {
      throw new Error(`${path}: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timed out posting ${path}`);
    }
    throw error instanceof Error ? error : new Error(`Could not post ${path}`);
  } finally {
    window.clearTimeout(timer);
  }
}
